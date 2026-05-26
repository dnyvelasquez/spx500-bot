# SPX500 Bot

Bot de trading algorítmico para el S&P 500 basado en conceptos ICT / Smart Money. Analiza el mercado en tiempo real, detecta setups de alta probabilidad y ejecuta órdenes automáticamente a través de MetaTrader 5.

## Arquitectura

```
┌─────────────────────────────────────────────────────────┐
│                    MetaTrader 5                          │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│              mt5-bridge  (Python / FastAPI)              │
│  /health  /account  /candles  /positions  /trade        │
│  /settings  /license  /telegram  /status  /journal      │
│  Dashboard web  →  http://localhost:8000                 │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP
┌──────────────────────▼──────────────────────────────────┐
│                  bot-core  (TypeScript)                  │
│                                                          │
│  MarketDataService  (D1 / H4 / H1 / M15 / M5)          │
│    ├─ ZoneEngine       (zonas S/R desde D1 + H4 + H1 + M15)   │
│    ├─ BiasEngine       (sesgo multi-TF D1+H4+H1)        │
│    ├─ MomentumEngine   (impulso intradía en M15)         │
│    ├─ FVGDetector      (Fair Value Gaps en M5)           │
│    ├─ DisplacementDetector  (velas impulso en M5)        │
│    ├─ EntryValidator   (momentum + FVG + desplazamiento) │
│    ├─ EMAEngine        (EMA 8/34 en H1 y M15)           │
│    ├─ MACDEngine       (MACD histograma en M15)          │
│    ├─ PositionSizing   (riesgo % del balance)            │
│    └─ PositionMonitor  (break-even + partial TP + trailing)│
│                                                          │
│  Filtros de riesgo (se evalúan antes de cada orden)      │
│    ├─ NewsFilterService      (bloqueo ±1 min noticias)   │
│    ├─ SessionGuard           (horarios bloqueados en ET) │
│    ├─ DailyDrawdownGuard     (límite % pérdida diaria)   │
│    ├─ DailyProfitTargetGuard (objetivo % ganancia diaria)│
│    ├─ WeeklyDrawdownGuard    (límite % pérdida semanal)  │
│    ├─ DailyTradeCountGuard   (máximo trades por día)     │
│    └─ ConsecLossGuard        (circuit breaker racha de pérdidas)│
│                                                          │
│  TradeJournalService  (registro de operaciones en DB)    │
│  BotStatusService     (semáforo en tiempo real)          │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│              Telegram Bot  (notificaciones)              │
└─────────────────────────────────────────────────────────┘
```

## Lógica de entrada

El bot evalúa dos tipos de señal en cada ciclo. La señal **Zone Bounce (ZB)** tiene prioridad; si no se cumple, intenta la señal **EMA Pullback (EP)** como fallback. Solo se ejecuta una señal por ciclo.

### [ZB] Zone Bounce — rebote en zona HTF (4 capas top-down)

1. **Zona activa (D1 / H4 / H1 / M15)** — ZoneEngine identifica swing highs/lows en 4 timeframes. Solo se considera un setup cuando el precio está dentro de `ZONE_PROXIMITY_POINTS` puntos de alguna zona. Pesos: D1=3, H4=2, H1=1, M15=0.5. Lookback: 100 candles para D1/H4/H1, 50 candles para M15.

2. **Sesgo HTF alineado (D1 + H4 + H1)** — BiasEngine detecta BOS/CHoCH en los 3 timeframes. El D1 fija la dirección; H4 o H1 deben confirmar. La zona debe coincidir con el sesgo (soporte → BULLISH, resistencia → BEARISH).

3. **Impulso M15 confirmado** — MomentumEngine detecta el último BOS en M15 (los 50 candles más recientes). Solo se acepta BOS; la dirección debe coincidir con el sesgo HTF.

4. **Entrada M5 (FVG + desplazamiento)** — FVG en la dirección del sesgo y vela de desplazamiento (cuerpo ≥ 60% del rango) en las últimas velas M5. La entrada es al cierre de la vela M5. El SL va más allá de la zona HTF activa (`ZONE_SL_BUFFER_POINTS`) y el TP garantiza mínimo 2:1 R:R.

### [EP] EMA Pullback — pullback a EMA dinámica (tendencia + momentum)

1. **Tendencia H1 confirmada** — EMA8 > EMA34 en H1 → BULLISH; EMA8 < EMA34 → BEARISH. La separación entre EMAs debe ser ≥ `EMA_SPREAD_MIN` (default 12 pts) para evitar mercados choppy.

2. **Confirmación de pullback superficial** — si `EP_M15_ALIGN=true`, la EMA8 en M15 debe mantenerse al mismo lado de la EMA34 (pullback poco profundo, sin cruce de tendencia).

3. **Precio cerca de EMA34 en M15** — el precio actual debe estar dentro de `ZONE_PROXIMITY_POINTS` puntos de la EMA34 en M15 (zona dinámica de soporte/resistencia).

4. **MACD confirma momentum** — el histograma MACD (EMA12-EMA26, signal 9) en M15 debe estar en la dirección del trade (>0 para BULLISH, <0 para BEARISH). El SL va más allá de la EMA34 en M15 (`ZONE_SL_BUFFER_POINTS`) y el TP garantiza mínimo 2:1 R:R.

## Filtros de riesgo

Antes de ejecutar cualquier orden, el bot pasa por los siguientes filtros en este orden:

| Filtro | Comportamiento |
|---|---|
| **News filter** | Bloquea señales ±1 minuto alrededor de noticias USD de alto impacto (Forex Factory). Se refresca cada día a medianoche UTC. |
| **Session guard** | Bloquea señales fuera de las ventanas horarias permitidas (ver tabla abajo). Usa hora ET con soporte automático de DST. |
| **Daily drawdown** | Si la pérdida del día supera `MAX_DAILY_DRAWDOWN_PERCENT` (default 3%), no se abren más posiciones hasta el día siguiente. |
| **Daily profit target** | Si la ganancia del día supera `MAX_DAILY_PROFIT_PERCENT` (default 3%), no se abren más posiciones. Protege las ganancias. |
| **Weekly drawdown** | Si la pérdida de la semana supera `MAX_WEEKLY_DRAWDOWN_PERCENT` (default 5%), no se abren posiciones hasta el lunes siguiente. Referencia se resetea cada lunes. |
| **Daily trade limit** | Si el número de trades del día alcanza `MAX_DAILY_TRADES`, no se abren más posiciones. `0` = sin límite (default). Se resetea automáticamente a medianoche UTC. |
| **Consecutive loss circuit** | Si se cierran `MAX_CONSEC_LOSSES` pérdidas seguidas en el mismo día ET, no se abren más posiciones hasta el día siguiente. `0` = desactivado (default). |
| **Signal cooldown** | Mínimo `SIGNAL_COOLDOWN_MINUTES` (default 30) entre señales del mismo tipo para evitar sobreoperación. |

### Ventanas bloqueadas por defecto (hora ET)

| Ventana | Horario | Razón |
|---|---|---|
| NY Open | 09:30 – 09:35 | Spike de volatilidad, stops hunts erráticos, estructura sucia |
| NY Lunch | 12:00 – 13:00 | Volumen cae ~40%, precio choppea sin dirección |
| NY Close | 15:45 – 16:00 | Cierre de posiciones del día, movimientos artificiales |
| Out of market | 16:00 – 09:30 | Sin volumen institucional (pre/post market) |

Las ventanas son configurables en `config.json` bajo la clave `BLOCKED_HOURS` y soportan hot-reload desde el dashboard sin reiniciar el bot. Formato de cada ventana:

```json
"BLOCKED_HOURS": [
  { "from": "09:30", "to": "09:35", "label": "NY Open" },
  { "from": "12:00", "to": "13:00", "label": "NY Lunch" },
  { "from": "15:45", "to": "16:00", "label": "NY Close" },
  { "from": "16:00", "to": "09:30", "label": "Out of market" }
]
```

> Las ventanas que cruzan medianoche (como `16:00–09:30`) se detectan automáticamente.

## Gestión de lotaje

| Parámetro | Valor |
|---|---|
| Lotaje mínimo | 0.1 lotes |
| Lotaje máximo | 20.0 lotes |
| Incremento | 0.1 lotes (1 decimal) |

El tamaño de posición se calcula en base al riesgo porcentual del balance y se redondea al múltiplo de 0.1 más cercano dentro del rango permitido.

## Dashboard web

El bridge incluye un dashboard en `http://localhost:8000` con las siguientes secciones:

- **Estado del bridge** — conexión MT5 (verde / rojo)
- **Estado del bot** — semáforo en tiempo real con razón de bloqueo
- **Licencia** — visualizar y validar la clave de licencia
- **Configuración** — editar símbolo, riesgo, modo live, cooldown; límites de pérdida diaria/semanal y objetivo de ganancia diaria (con barras de progreso); máximo de trades diarios; filtros de entrada (SL mínimo, FVG mínimo, spread EMA mínimo, confirmación M15 para señal EP, circuit breaker de pérdidas consecutivas); gestión de posiciones (trigger break-even, buffer BE, toggle TP parcial); modo semi-automático. Hot-reload sin reiniciar el bot.
- **Telegram** — configurar token y chat ID, toggle de notificaciones, botón de prueba
- **Journal** — estadísticas (win rate, profit factor, avg R:R, P&L, rachas de pérdidas) + tabla de las últimas 20 operaciones con resultado y R:R real

## Hot-reload de configuración

Los cambios guardados desde el dashboard se escriben en `config.json` en la raíz. El bot detecta el cambio automáticamente (sin reiniciar) vía `fs.watch`. Los parámetros con soporte hot-reload son:

`SYMBOL`, `RISK_PERCENT`, `LIVE_TRADING`, `SIGNAL_COOLDOWN_MINUTES`, `MAX_DAILY_DRAWDOWN_PERCENT`, `MAX_DAILY_PROFIT_PERCENT`, `MAX_WEEKLY_DRAWDOWN_PERCENT`, `MAX_DAILY_TRADES`, `MIN_SL_POINTS`, `MIN_FVG_POINTS`, `ZONE_PROXIMITY_POINTS`, `ZONE_SL_BUFFER_POINTS`, `EMA_SPREAD_MIN`, `EP_M15_ALIGN`, `MAX_CONSEC_LOSSES`, `BE_AT_POINTS`, `BE_BUFFER_POINTS`, `PARTIAL_TP_ENABLED`, `TELEGRAM_ENABLED`, `LICENSE_KEY`, `BLOCKED_HOURS`

> `SEMI_AUTO_MODE` **no** aplica hot-reload — requiere reiniciar el bot para activar el polling de Telegram.

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Bot principal | TypeScript, Node.js, tsx |
| Bridge MT5 | Python, FastAPI, uvicorn |
| Broker | MetaTrader 5 |
| Notificaciones | Telegram Bot API |
| Licencias | Neon PostgreSQL |
| Validación | Zod (TS), Pydantic (Python) |
| Logger | Pino |
| Tests | Vitest |

## Requisitos

- Node.js 18+
- Python 3.10+
- MetaTrader 5 instalado y con sesión activa
- Bot de Telegram creado via [@BotFather](https://t.me/BotFather)

## Instalación

```bash
# Clonar el repositorio
git clone https://github.com/dnyvelasquez/spx500-bot.git
cd spx500-bot

# Dependencias Node.js
npm install

# Entorno virtual Python
python -m venv .venv
.venv\Scripts\activate          # Windows
# source .venv/bin/activate     # Linux/Mac

pip install -r apps/mt5-bridge/requirements.txt
```

## Configuración

Crear `.env` en la raíz del proyecto:

```env
NODE_ENV=development

TELEGRAM_BOT_TOKEN=tu_token_aqui
TELEGRAM_CHAT_ID=tu_chat_id_aqui

SYMBOL=SPX500
RISK_PERCENT=1
LIVE_TRADING=false

SIGNAL_COOLDOWN_MINUTES=30

LICENSE_KEY=tu-uuid-de-licencia

DATABASE_URL=postgresql://...
```

> Para obtener tu `TELEGRAM_CHAT_ID`: envía un mensaje al bot y visita
> `https://api.telegram.org/bot{TOKEN}/getUpdates`

> Pon `LIVE_TRADING=false` para modo paper (loggea setups sin ejecutar órdenes).

## Inicio

**1. Abrir MetaTrader 5** con la cuenta activa y `SPX500` visible en el Market Watch.

**2. Arrancar el bridge** (terminal 1):
```bash
.venv\Scripts\activate
cd apps\mt5-bridge
uvicorn app.main:app --reload
```

**3. Arrancar el bot** (terminal 2):
```bash
npm run dev
```

El dashboard queda disponible en `http://localhost:8000`.

## Scripts disponibles

```bash
npm run dev          # Modo desarrollo con hot-reload
npm run build        # Compilar para producción
npm start            # Ejecutar build de producción
npm run backtest     # Modo backtest (ver sección Backtest)
npm test             # Correr tests unitarios
npm run test:watch   # Tests en modo watch
npm run typecheck    # Verificar tipos TypeScript
npm run lint         # ESLint
```

## Backtest

Replaya velas históricas de MT5 contra la misma estrategia de trading en vivo (ZoneEngine → BiasEngine → MomentumEngine → FVGDetector + EntryValidator) sin arriesgar capital.

### Requisitos

- El bridge de Python debe estar corriendo (`uvicorn`) para que el backtest pueda consultar las velas históricas de MT5.
- MetaTrader 5 debe estar abierto con la cuenta activa.

### Uso

```bash
npm run backtest -- --start 2025-01-01 --end 2025-05-01
```

> **Nota:** npm intercepta `--from` y `--to` como flags propios. Usa `--start`/`--end` con `npm run backtest`, o pasa los argumentos directamente con `npx tsx -r tsconfig-paths/register src/backtest/index.ts --start 2025-01-01 --end 2025-05-01`.

Parámetros disponibles:

| Parámetro | Default | Descripción |
|---|---|---|
| `--start` | (requerido) | Fecha de inicio `YYYY-MM-DD` |
| `--end` | (requerido) | Fecha de fin `YYYY-MM-DD` |
| `--symbol` | Desde `config.json` | Símbolo a testear |
| `--balance` | `10000` | Balance inicial simulado en USD |
| `--risk` | Desde `config.json` | % de riesgo por trade |
| `--cooldown` | Desde `config.json` | Minutos de cooldown entre señales |
| `--proximity` | Desde `config.json` | Puntos de proximidad a zona HTF |

Los parámetros `BLOCKED_HOURS`, `MIN_FVG_POINTS`, `MIN_SL_POINTS`, `ZONE_PROXIMITY_POINTS`, `ZONE_SL_BUFFER_POINTS`, `EMA_SPREAD_MIN`, `EP_M15_ALIGN`, `BE_AT_POINTS`, `BE_BUFFER_POINTS`, `PARTIAL_TP_ENABLED`, `MAX_DAILY_DRAWDOWN_PERCENT`, `MAX_WEEKLY_DRAWDOWN_PERCENT` y `MAX_CONSEC_LOSSES` se leen automáticamente desde `config.json`.

### Salida

El backtest imprime en consola un resumen por trade y las métricas finales:

```
════════════════════════════════════════════════════════════════════════════════
 SPX500 Bot — Backtest │ SPX500  2026-01-01 → 2026-05-25
 Balance: $10000.00 → $10703.31  │  Risk: 1%  │  Cooldown: 15 min
════════════════════════════════════════════════════════════════════════════════

  #  Apertura (ET)      Tipo   Dir        Entry         SL         TP     R:R  Resultado     P&L ($)
────────────────────────────────────────────────────────────────────────────────
  1  2026-01-29 09:40   [ZB]   SELL     6991.70    7000.35    6974.40   -1.00  ✗ LOSS      -100.00

════════════════════════════════════════════════════════════════════════════════
 RESULTADOS
════════════════════════════════════════════════════════════════════════════════
 [ZB] Zone Bounce:      trades=17  W/L=8/9  WR=47.1%  P&L=+703.31
 Total trades:          17
 Win rate:              47.1%
 Profit factor:         1.74
 Max drawdown:          3.94%
```

La columna `Tipo` indica el origen de la señal: `[ZB]` = Zone Bounce (rebote en zona HTF), `[EP]` = EMA Pullback (pullback a EMA34 dinámica), `[BP]` = Breakout Pullback (pullback a zona rota).

Adicionalmente escribe un archivo JSON completo en la raíz del proyecto: `backtest-SPX500-2025-01-01-2025-05-01.json`.

### Fidelidad del backtest

| Aspecto | Comportamiento |
|---|---|
| Filtros activos | Session guard, cooldown, zona (D1/H4/H1 lookback 100c, M15 lookback 50c), sesgo multi-TF D1+H4+H1, impulso M15 BOS (50 candles), FVG size, SL mínimo |
| Filtros simulados | Daily drawdown (`MAX_DAILY_DRAWDOWN_PERCENT`), weekly drawdown (`MAX_WEEKLY_DRAWDOWN_PERCENT`), consecutive loss circuit (`MAX_CONSEC_LOSSES`) |
| Filtros omitidos | Profit target, daily trade count — el backtest evalúa señales sin esos cortes |
| News filter | No simulado — requeriría datos históricos de noticias |
| Entrada al mercado | Al cierre de la vela M5 del setup (precio de mercado), sin slippage |
| SL | Más allá de la zona HTF activa + `ZONE_SL_BUFFER_POINTS` puntos de buffer |
| Salida | Se busca la primera vela M5 futura que toca TP o SL; si ambos se tocan en la misma vela, se asume SL primero (pesimista) salvo que el open ya esté pasado el TP |
| Partial TPs | Simulados cuando `PARTIAL_TP_ENABLED=true` — cierra 50% al trigger y continúa con el 50% restante |
| Break-even | Simulado cuando `BE_AT_POINTS > 0` — mueve SL a entry + `BE_BUFFER_POINTS` al alcanzar el trigger |
| Warm-up | 5 días previos a `--from` + 100 velas M5 para que D1/H4/H1/M15 tengan suficiente historia |

## Endpoints del bridge

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/trading/health` | Estado de conexión MT5 |
| GET | `/api/trading/account` | Balance, equity y margen |
| GET | `/api/trading/candles/{symbol}/{timeframe}` | Últimas N velas |
| GET | `/api/trading/candles/{symbol}/{timeframe}/range` | Velas por rango de fechas (`?from_date=YYYY-MM-DD&to_date=YYYY-MM-DD`) |
| GET | `/api/trading/positions/{symbol}` | Posiciones abiertas |
| PATCH | `/api/trading/positions/{ticket}` | Modificar SL/TP |
| POST | `/api/trading/positions/{ticket}/partial-close` | Cierre parcial de posición (TPs parciales) |
| POST | `/api/trading/trade` | Colocar orden |
| GET | `/api/settings` | Leer configuración actual |
| PUT | `/api/settings` | Actualizar configuración |
| GET | `/api/license` | Leer licencia cacheada |
| POST | `/api/license/validate` | Validar clave de licencia |
| GET | `/api/telegram` | Leer credenciales Telegram |
| PUT | `/api/telegram` | Actualizar credenciales Telegram |
| POST | `/api/telegram/test` | Enviar mensaje de prueba |
| GET | `/api/trading/history/{ticket}` | Historial de cierre de una posición |
| GET | `/api/journal/trades` | Últimas N operaciones del journal |
| GET | `/api/journal/stats` | Estadísticas: win rate, profit factor, avg R:R, P&L, rachas de pérdidas |

## Notificaciones Telegram

| Evento | Mensaje |
|---|---|
| Arranque | 🤖 Bot iniciado con símbolo, riesgo y modo |
| Mercado abierto | 🟢 Mercado abierto |
| Mercado cerrado | 🔴 Mercado cerrado |
| Setup paper | 📋 Setup validado con entry/SL/TP |
| Orden ejecutada | ✅ Orden colocada con ID y niveles |
| Orden fallida | ❌ Error con razón de MT5 |
| Break-even | 🔒 SL movido a precio de entrada |
| Partial TP | 📊 50% cerrado con precio y SL movido a BE |
| Semi-auto setup | 📋 Botones ✅ Ejecutar / ❌ Ignorar con niveles del trade |
| Trailing stop | 📈 SL actualizado |
| Bridge caído | 🔌 Bridge MT5 desconectado |
| Bridge recuperado | ✅ Bridge MT5 reconectado |

## Filtros de estrategia

| Filtro | Parámetro | Comportamiento |
|---|---|---|
| **Tamaño mínimo de FVG** | `MIN_FVG_POINTS` | Ignora FVGs cuyo gap sea menor al valor en puntos. `0` = desactivado. |
| **Distancia mínima de SL** | `MIN_SL_POINTS` | Descarta setups donde la distancia entry → SL es menor al valor. `0` = desactivado. |
| **Proximidad de zona** | `ZONE_PROXIMITY_POINTS` | Radio en puntos alrededor de una zona HTF (o EMA34 para EP) para considerar que el precio está "en zona". Default 20. |
| **Buffer de SL en zona** | `ZONE_SL_BUFFER_POINTS` | Puntos adicionales más allá del nivel de zona (o EMA34) para colocar el SL. Default 8. |
| **Spread mínimo de EMA** | `EMA_SPREAD_MIN` | Para señal [EP]: separación mínima entre EMA8 y EMA34 en H1 (evita mercados choppy). Default 12. |
| **Confirmación M15 [EP]** | `EP_M15_ALIGN` | Para señal [EP]: exige que EMA8 en M15 esté al mismo lado de EMA34 (pullback superficial). Default `true`. |

## Gestión de posiciones

Una vez abierta una posición, el bot la monitorea en cada ciclo de sync (10s):

- **Break-even** (opcional) — cuando `BE_AT_POINTS > 0` y el precio se mueve ese número de puntos a favor, el SL se mueve al precio de entrada + `BE_BUFFER_POINTS`. Aplica solo cuando `PARTIAL_TP_ENABLED=false`. Desactivado por defecto (`BE_AT_POINTS=0`).
- **Partial TP** (opcional) — cuando `PARTIAL_TP_ENABLED=true` y `BE_AT_POINTS > 0`, al alcanzar el trigger se cierra el 50% de la posición al precio actual y el SL se mueve a `entry + BE_BUFFER_POINTS`. El 50% restante corre hasta el TP completo. Desactivado por defecto.
- **Trailing stop** — cuando el precio se mueve 2R a favor, el SL sigue al precio manteniéndose a 1R de distancia. Siempre activo.

## Semáforo de estado del bot

El dashboard muestra en tiempo real si el bot puede operar y por qué está bloqueado:

| Color | Estado |
|---|---|
| 🟢 Verde | Listo para operar |
| 🟡 Amarillo | Mercado cerrado (estado normal fuera de horario) |
| 🔴 Rojo | Bloqueado — muestra la razón exacta |
| ⚫ Gris | Bot no disponible (apagado o sin actividad > 30s) |

Razones posibles de bloqueo: horario bloqueado (NY Open / Lunch / Close / fuera de mercado), noticia USD de alto impacto, límite de pérdida diaria, objetivo de ganancia diaria, límite de pérdida semanal, máximo de trades diarios, cooldown activo, bridge MT5 no disponible.

El bot escribe `bot-status.json` en cada ciclo de sync (10s). El dashboard lo consulta cada 10s vía `GET /api/status`. Las barras de progreso de los límites se actualizan al mismo tiempo.

## Auto-reconexión al bridge

Si el bridge de Python cae después de que el bot está corriendo, el bot lo detecta en el siguiente ciclo de sync (máximo 10s) y:

1. Marca el estado como `bridgeDown = true` y envía notificación por Telegram (`🔌 Bridge MT5 desconectado`).
2. El dashboard muestra **"Bridge MT5 no disponible — reconectando..."** en rojo en lugar de ponerse gris.
3. Reintenta automáticamente cada 10s. Cuando el bridge vuelve: notifica `✅ Bridge MT5 reconectado` y reanuda operación normal.

En el **arranque** del bot, si el bridge no responde, el bot espera hasta **60 segundos** (12 reintentos × 5s) antes de fallar. Esto permite arrancar el bridge y el bot casi simultáneamente sin coordinación manual.

## Trade Journal

Cada operación ejecutada en modo live se registra automáticamente en la tabla `trades` de Neon PostgreSQL:

| Campo | Descripción |
|---|---|
| `ticket` | ID de la posición en MT5 |
| `side` / `volume` | Dirección y tamaño |
| `entry_price`, `stop_loss`, `take_profit` | Niveles de la operación |
| `planned_rr` | R:R calculado al abrir |
| `risk_amount` | Capital arriesgado en USD |
| `opened_at` / `closed_at` | Timestamps de apertura y cierre |
| `close_price` / `profit` | Precio de cierre y P&L |
| `actual_rr` | R:R realizado |
| `result` | `WIN`, `LOSS` o `BE` (break-even) |

Las estadísticas (win rate, profit factor, avg R:R, P&L total, racha máxima y actual de pérdidas consecutivas) se visualizan en tiempo real en el dashboard bajo la sección **Journal**, con actualización automática cada 30 segundos.

## Modo semi-automático

Cuando `SEMI_AUTO_MODE=true` y `LIVE_TRADING=true`, el bot detecta el setup completo (todas las condiciones ICT) y en lugar de ejecutar automáticamente envía por Telegram un mensaje con los niveles del trade y dos botones:

- **✅ Ejecutar** — coloca la orden en MT5 inmediatamente
- **❌ Ignorar** — descarta el setup

Si no hay respuesta en **3 minutos**, el trade se cancela automáticamente y el mensaje se actualiza indicando que expiró. Útil para usuarios que quieren supervisar las entradas sin perder las señales.

> Requiere reiniciar el bot para activar/desactivar el polling de Telegram.

## Tests

```bash
npm test
```

26 tests unitarios cubriendo los módulos principales de estrategia:
- `SwingDetector` — detección de swing highs y lows
- `FVGDetector` — Fair Value Gaps alcistas y bajistas
- `DisplacementDetector` — fuerza del desplazamiento
- `EntryValidator` — validación de las 5 condiciones ICT
- `PositionMonitor` — lógica de break-even, partial TP y trailing stop

## Variables de entorno

| Variable | Descripción | Default |
|---|---|---|
| `SYMBOL` | Símbolo en MT5 | `SPX500` |
| `RISK_PERCENT` | % del balance a arriesgar por trade | `1` |
| `LIVE_TRADING` | `true` para ejecutar órdenes reales | `false` |
| `SIGNAL_COOLDOWN_MINUTES` | Minutos entre señales del mismo tipo | `30` |
| `MAX_DAILY_DRAWDOWN_PERCENT` | % máximo de pérdida diaria permitida | `3` |
| `MAX_DAILY_PROFIT_PERCENT` | % objetivo de ganancia diaria (para al alcanzarlo) | `3` |
| `MAX_WEEKLY_DRAWDOWN_PERCENT` | % máximo de pérdida semanal permitida (resetea el lunes) | `5` |
| `MAX_DAILY_TRADES` | Máximo de trades por día (`0` = sin límite) | `0` |
| `MIN_SL_POINTS` | Distancia mínima entry→SL en puntos para aceptar el setup (`0` = sin filtro) | `0` |
| `MIN_FVG_POINTS` | Tamaño mínimo del FVG en puntos para aceptar la entrada (`0` = sin filtro) | `0` |
| `ZONE_PROXIMITY_POINTS` | Radio en puntos para considerar que el precio está en una zona HTF o EMA34 | `20` |
| `ZONE_SL_BUFFER_POINTS` | Puntos adicionales más allá de la zona/EMA34 para colocar el SL | `8` |
| `EMA_SPREAD_MIN` | Separación mínima EMA8/34 en H1 para señal [EP] (`0` = desactivado) | `12` |
| `EP_M15_ALIGN` | Exigir EMA8 M15 al mismo lado que EMA34 en señal [EP] (pullback superficial) | `true` |
| `MAX_CONSEC_LOSSES` | Pérdidas consecutivas antes de pausar el resto del día (`0` = desactivado) | `0` |
| `BE_AT_POINTS` | Puntos a favor para activar break-even/partial TP (`0` = desactivado) | `0` |
| `BE_BUFFER_POINTS` | Puntos sobre entry al mover SL a BE | `0.25` |
| `PARTIAL_TP_ENABLED` | `true` para cerrar 50% al trigger de BE y dejar correr el resto (requiere `BE_AT_POINTS > 0`) | `false` |
| `SEMI_AUTO_MODE` | `true` para enviar alerta de Telegram con botones antes de ejecutar (requiere reinicio) | `false` |
| `TELEGRAM_ENABLED` | `false` para silenciar notificaciones | `true` |
| `LICENSE_KEY` | UUID de licencia (también editable en dashboard) | — |
| `TELEGRAM_BOT_TOKEN` | Token del bot de Telegram | — |
| `TELEGRAM_CHAT_ID` | Chat ID para notificaciones | — |
| `DATABASE_URL` | Conexión Neon PostgreSQL para validación de licencias | — |
