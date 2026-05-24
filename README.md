# SPX500 Bot

Bot de trading algorítmico para el S&P 500 (US500) basado en conceptos ICT / Smart Money. Analiza el mercado en tiempo real, detecta setups de alta probabilidad y ejecuta órdenes automáticamente a través de MetaTrader 5.

## Arquitectura

```
┌─────────────────────────────────────────────────────────┐
│                    MetaTrader 5                          │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│              mt5-bridge  (Python / FastAPI)              │
│  /health  /account  /candles  /positions  /trade        │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP
┌──────────────────────▼──────────────────────────────────┐
│                  bot-core  (TypeScript)                  │
│                                                          │
│  MarketDataService → StrategyEngine                      │
│    ├─ LiquidityEngine  (niveles BSL/SSL + sweeps)        │
│    ├─ BiasEngine       (sesgo HTF en H1)                 │
│    ├─ FVGEngine        (Fair Value Gaps en M5)           │
│    ├─ MSSDetector      (Market Structure Shift)          │
│    ├─ EntryValidator   (5 condiciones ICT)               │
│    ├─ PositionSizing   (riesgo % del balance)            │
│    └─ PositionMonitor  (break-even + trailing stop)      │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│              Telegram Bot  (notificaciones)              │
└─────────────────────────────────────────────────────────┘
```

## Lógica de entrada

El bot requiere **5 condiciones simultáneas** antes de abrir una posición:

1. **Sesgo HTF alineado** — BiasEngine detecta BOS/CHOCH en H1
2. **Sweep de liquidez** — precio toma stops por encima/debajo de un nivel BSL/SSL
3. **Market Structure Shift (MSS)** — rotura de estructura en dirección contraria al sweep
4. **Desplazamiento** — vela M5 con cuerpo ≥ 70% del rango
5. **Fair Value Gap (FVG)** — imbalance de precio en las últimas 3 velas M5

La entrada se coloca en el midpoint del FVG (o al precio de mercado si no hay FVG). El SL va más allá del extremo de la vela del sweep y el TP garantiza mínimo 2:1 R:R.

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Bot principal | TypeScript, Node.js, tsx |
| Bridge MT5 | Python, FastAPI, uvicorn |
| Broker | MetaTrader 5 |
| Notificaciones | Telegram Bot API |
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

SYMBOL=US500
RISK_PERCENT=1
LIVE_TRADING=false

SIGNAL_COOLDOWN_MINUTES=30
```

> Para obtener tu `TELEGRAM_CHAT_ID`: envía un mensaje al bot y visita
> `https://api.telegram.org/bot{TOKEN}/getUpdates`

> Pon `LIVE_TRADING=false` para modo paper (loggea setups sin ejecutar órdenes).

## Inicio

**1. Abrir MetaTrader 5** con la cuenta activa y `US500` visible en el Market Watch.

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

## Scripts disponibles

```bash
npm run dev          # Modo desarrollo con hot-reload
npm run build        # Compilar para producción
npm start            # Ejecutar build de producción
npm test             # Correr tests unitarios
npm run test:watch   # Tests en modo watch
npm run typecheck    # Verificar tipos TypeScript
npm run lint         # ESLint
```

## Endpoints del bridge

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/trading/health` | Estado de conexión MT5 |
| GET | `/api/trading/account` | Balance, equity y margen |
| GET | `/api/trading/candles/{symbol}/{timeframe}` | Velas históricas |
| GET | `/api/trading/positions/{symbol}` | Posiciones abiertas |
| PATCH | `/api/trading/positions/{ticket}` | Modificar SL/TP |
| POST | `/api/trading/trade` | Colocar orden |

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
| Trailing stop | 📈 SL actualizado |
| Bridge caído | 🔌 Bridge MT5 desconectado |
| Bridge recuperado | ✅ Bridge MT5 reconectado |

## Gestión de posiciones

Una vez abierta una posición, el bot la monitorea en cada ciclo de sync (10s):

- **Break-even** — cuando el precio se mueve 1R a favor, el SL se mueve al precio de entrada (operación sin riesgo)
- **Trailing stop** — cuando el precio se mueve 2R a favor, el SL sigue al precio manteniéndose a 1R de distancia

## Tests

```bash
npm test
```

26 tests unitarios cubriendo los módulos principales de estrategia:
- `SwingDetector` — detección de swing highs y lows
- `FVGDetector` — Fair Value Gaps alcistas y bajistas
- `DisplacementDetector` — fuerza del desplazamiento
- `EntryValidator` — validación de las 5 condiciones ICT
- `PositionMonitor` — lógica de break-even y trailing stop

## Variables de entorno

| Variable | Descripción | Default |
|---|---|---|
| `SYMBOL` | Símbolo en MT5 | `US500` |
| `RISK_PERCENT` | % del balance a arriesgar por trade | `1` |
| `LIVE_TRADING` | `true` para ejecutar órdenes reales | `false` |
| `SIGNAL_COOLDOWN_MINUTES` | Minutos entre señales del mismo tipo | `30` |
| `TELEGRAM_BOT_TOKEN` | Token del bot de Telegram | — |
| `TELEGRAM_CHAT_ID` | Chat ID para notificaciones | — |
