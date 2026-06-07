# Informe semanal de backtests 2026 — SPX500 / EURUSD / BTCUSDT

**Período analizado:** 2026-01-01 → 2026-06-05 (datos disponibles más recientes)
**Balance inicial:** $10,000 por bot · **Configuración:** la de producción de cada bot (`config.json` actual, sin flags de prueba)

Leyenda de tipo de señal: `EMA_PB` = EMA Pullback · `ZONE` = Zone Bounce (solo SPX500) · `SMA_X` = SMA Crossover

---

## Semana 2026-01-05 → 2026-01-11
| Bot | Ops | W/L | P&L |
|---|---|---|---|
| SPX500 | 1 | 1/0 | +$189.22 |
| EURUSD | 0 | — | $0.00 |
| BTCUSDT | 2 | 0/2 | -$198.71 |

- SPX500: 01-07 10:00 `EMA_PB` BUY → WIN +189.22
- BTCUSDT: 01-05 12:20 `EMA_PB` BUY → LOSS -99.81 · 01-08 09:45 `EMA_PB` SELL → LOSS -98.90

## Semana 2026-01-12 → 2026-01-18
| Bot | Ops | W/L | P&L |
|---|---|---|---|
| SPX500 | 0 | — | $0.00 |
| EURUSD | 2 | 1/1 | +$36.17 |
| BTCUSDT | 1 | 1/0 | +$195.98 |

- EURUSD: 01-15 07:50 `EMA_PB` SELL → WIN +86.60 · 01-15 10:45 `EMA_PB` SELL → LOSS -50.43
- BTCUSDT: 01-14 08:00 `EMA_PB` BUY → WIN +195.98

## Semana 2026-01-19 → 2026-01-25
| Bot | Ops | W/L | P&L |
|---|---|---|---|
| SPX500 | 0 | — | $0.00 |
| EURUSD | 0 | — | $0.00 |
| BTCUSDT | 4 | 2/2 | +$196.30 |

- BTCUSDT: 01-19 08:20 SELL → WIN +199.79 · 01-20 09:00 SELL → WIN +203.59 · 01-21 08:00 SELL → LOSS -104.13 · 01-21 13:45 SELL → LOSS -102.95

## Semana 2026-01-26 → 2026-02-01
| Bot | Ops | W/L | P&L |
|---|---|---|---|
| SPX500 | 0 | — | $0.00 |
| EURUSD | 0 | — | $0.00 |
| BTCUSDT | 3 | 2/1 | +$305.48 |

- BTCUSDT: 01-30 12:05 SELL → LOSS -102.07 · 02-01 08:00 SELL → WIN +201.87 · 02-01 15:35 SELL → WIN +205.68

## Semana 2026-02-02 → 2026-02-08
Sin operaciones en ningún bot.

## Semana 2026-02-09 → 2026-02-15
| Bot | Ops | W/L | P&L |
|---|---|---|---|
| SPX500 | 0 | — | $0.00 |
| EURUSD | 0 | — | $0.00 |
| BTCUSDT | 3 | 1/2 | -$3.24 |

- BTCUSDT: 02-11 11:10 SELL → WIN +210.13 · 02-11 12:40 SELL → LOSS -107.04 · 02-14 12:20 BUY → LOSS -106.33

## Semana 2026-02-16 → 2026-02-22
| Bot | Ops | W/L | P&L |
|---|---|---|---|
| SPX500 | 3 | 0/1 (+2 abiertas) | -$101.89 |
| EURUSD | 1 | 1/0 | +$87.94 |
| BTCUSDT | 0 | — | $0.00 |

- SPX500: 02-18 09:35 `SMA_X` BUY → ABIERTA · 02-18 09:50 `SMA_X` BUY → ABIERTA · 02-20 15:05 `ZONE` BUY → LOSS -101.89
- EURUSD: 02-17 07:00 SELL → WIN +87.94

## Semana 2026-02-23 → 2026-03-01
| Bot | Ops | W/L | P&L |
|---|---|---|---|
| SPX500 | 1 | 1/0 | +$190.27 |
| EURUSD | 1 | 0/1 | -$50.62 |
| BTCUSDT | 1 | 0/1 | -$104.81 |

- SPX500: 02-26 15:35 `ZONE` BUY → WIN +190.27
- EURUSD: 02-24 16:55 SELL → LOSS -50.62
- BTCUSDT: 02-24 08:50 SELL → LOSS -104.81

## Semana 2026-03-02 → 2026-03-08
| Bot | Ops | W/L | P&L |
|---|---|---|---|
| SPX500 | 2 | 2/0 | +$391.89 |
| EURUSD | 1 | 1/0 | +$92.07 |
| BTCUSDT | 1 | 1/0 | +$208.04 |

- SPX500: 03-04 10:00 `ZONE` BUY → WIN +195.44 · 03-04 13:15 `ZONE` BUY → WIN +196.45
- EURUSD: 03-02 09:30 SELL → WIN +92.07
- BTCUSDT: 03-07 08:35 SELL → WIN +208.04

**Mejor semana conjunta del período** — los tres bots ganaron la misma semana (+$691.99 combinados).

## Semana 2026-03-09 → 2026-03-15
| Bot | Ops | W/L | P&L |
|---|---|---|---|
| SPX500 | 1 | 0/1 | -$106.69 |
| EURUSD | 5 | 5/0 | +$377.15 |
| BTCUSDT | 0 | — | $0.00 |

- SPX500: 03-11 09:40 `ZONE` BUY → LOSS -106.69
- EURUSD: racha perfecta de 5 wins (03-11 a 03-13): +92.86, +94.36, +93.21, +96.12, +0.60

## Semana 2026-03-16 → 2026-03-22
| Bot | Ops | W/L | P&L |
|---|---|---|---|
| SPX500 | 0 | — | $0.00 |
| EURUSD | 2 | 0/2 | -$105.16 |
| BTCUSDT | 3 | 1/2 | -$3.46 |

- EURUSD: 03-20 07:30 BUY → LOSS -52.71 · 03-20 13:00 BUY → LOSS -52.45
- BTCUSDT: 03-16 08:00 BUY → WIN +211.51 · 03-19 09:45 SELL → LOSS -108.11 · 03-22 08:20 SELL → LOSS -106.86

## Semana 2026-03-23 → 2026-03-29
| Bot | Ops | W/L | P&L |
|---|---|---|---|
| SPX500 | 4 | 3/1 | +$504.07 |
| EURUSD | 3 | 0/3 | -$155.79 |
| BTCUSDT | 0 | — | $0.00 |

- SPX500: 03-24 `ZONE` SELL → WIN +198.55 · 03-25 `ZONE` SELL → LOSS -107.61 · 03-25 `ZONE` SELL → WIN +200.14 · 03-26 `SMA_X` SELL → WIN +212.99
- EURUSD: racha de 3 losses (03-24 a 03-25): -52.19, -51.93, -51.67

**Mejor semana de SPX500** en el período (+$504.07).

## Semana 2026-03-30 → 2026-04-05
| Bot | Ops | W/L | P&L |
|---|---|---|---|
| SPX500 | 4 | 2/2 | +$191.00 |
| EURUSD | 4 | 2/2 | -$10.01 |
| BTCUSDT | 0 | — | $0.00 |

- SPX500: 03-30 `ZONE` SELL → WIN +208.10 · 03-31 SELL → LOSS -112.75 · 03-31 SELL → WIN +209.37 · 03-31 SELL → LOSS -113.72
- EURUSD: 03-30 SELL → WIN +93.09 · 03-31 SELL → LOSS -51.87 · 04-01 BUY → WIN +0.39 · 04-03 SELL → LOSS -51.62

## Semana 2026-04-06 → 2026-04-12
| Bot | Ops | W/L | P&L |
|---|---|---|---|
| SPX500 | 1 | 0/1 | -$112.58 |
| EURUSD | 1 | 1/0 | +$93.55 |
| BTCUSDT | 3 | 0/3 | -$314.04 |

- BTCUSDT: peor semana del período → 04-06 BUY -105.58, 04-08 BUY -104.77, 04-08 BUY -103.70 (3 losses consecutivas)

## Semana 2026-04-13 → 2026-04-19
| Bot | Ops | W/L | P&L |
|---|---|---|---|
| SPX500 | 4 | 3/1 | +$539.41 |
| EURUSD | 0 | — | $0.00 |
| BTCUSDT | 1 | 0/1 | -$102.92 |

- SPX500: **mejor semana del período para cualquier bot** → 04-14 WIN +216.57, 04-15 WIN +216.93, 04-16 LOSS -115.79, 04-17 WIN +221.70

## Semana 2026-04-20 → 2026-04-26
| Bot | Ops | W/L | P&L |
|---|---|---|---|
| SPX500 | 1 | 0/1 | -$116.85 |
| EURUSD | 2 | 2/0 | +$102.09 |
| BTCUSDT | 0 | — | $0.00 |

## Semana 2026-04-27 → 2026-05-03
| Bot | Ops | W/L | P&L |
|---|---|---|---|
| SPX500 | 3 | 2/1 | +$330.00 |
| EURUSD | 3 | 0/3 | -$156.23 |
| BTCUSDT | 0 | — | $0.00 |

- SPX500: primera racha de `SMA_X` (04-30): LOSS -115.68, WIN +216.40, WIN +229.28
- EURUSD: racha de 3 losses (04-28 a 04-29): -52.34, -52.08, -51.81

## Semana 2026-05-04 → 2026-05-10
| Bot | Ops | W/L | P&L |
|---|---|---|---|
| SPX500 | 2 | 1/1 | +$110.35 |
| EURUSD | 2 | 0/2 | -$102.86 |
| BTCUSDT | 0 | — | $0.00 |

## Semana 2026-05-11 → 2026-05-17
| Bot | Ops | W/L | P&L |
|---|---|---|---|
| SPX500 | 2 | 1/1 | +$108.94 |
| EURUSD | 1 | 1/0 | +$93.20 |
| BTCUSDT | 0 | — | $0.00 |

## Semana 2026-05-18 → 2026-05-24
| Bot | Ops | W/L | P&L |
|---|---|---|---|
| SPX500 | 2 | 2/0 | +$461.82 |
| EURUSD | 0 | — | $0.00 |
| BTCUSDT | 0 | — | $0.00 |

- SPX500: 05-20 `ZONE` BUY → WIN +228.28 · 05-20 `ZONE` BUY → WIN +233.54 (única señal activa esa semana, ambos ganadores)

## Semana 2026-05-25 → 2026-05-31
| Bot | Ops | W/L | P&L |
|---|---|---|---|
| SPX500 | 2 | 0/2 | -$250.32 |
| EURUSD | 4 | 1/3 | -$64.08 |
| BTCUSDT | 1 | 0/1 | -$101.60 |

- **Peor semana conjunta del período** — los tres bots cerraron en rojo (-$416.00 combinados).
- SPX500: 05-25 `ZONE` BUY → LOSS -125.79 · 05-26 `ZONE` BUY → LOSS -124.53

## Semana 2026-06-01 → 2026-06-07 (parcial, datos hasta 06-05)
| Bot | Ops | W/L | P&L |
|---|---|---|---|
| SPX500 | 2 | 0/2 | -$245.34 |
| EURUSD | 1 | 0/1 | -$51.19 |
| BTCUSDT | 2 | 1/0 (+1 abierta) | +$200.98 |

- SPX500: 06-04 `ZONE` BUY → LOSS -123.29 · 06-05 `SMA_X` BUY → LOSS -122.05
- BTCUSDT: 06-03 SELL → WIN +200.98 · 06-04 SELL → posición abierta al cierre del backtest

---

## Consolidado del período (2026-01-01 → 2026-06-05)

| Bot | Trades | W / L / Abiertas | Win Rate | Profit Factor | P&L total | Max Drawdown | Racha máx. de pérdidas | Balance final |
|---|---|---|---|---|---|---|---|---|
| **SPX500** | 35 | 18 / 15 / 2 | 54.55% | 2.20 | **+$2,083.30** | 3.94% | 4 | $10,000 → $12,083.31 |
| **EURUSD** | 33 | 15 / 18 / 0 | 45.45% | 1.20 | **+$186.23** | 3.38% | 5 | $10,000 → $10,186.26 |
| **BTCUSDT** | 25 | 9 / 15 / 1 | 37.50% | 1.18 | **+$277.99** | 6.79% | 7 | $10,000 → $10,277.99 |
| **TOTAL combinado** | 93 | 42 / 48 / 3 | — | — | **+$2,547.52** | — | — | $30,000 → $32,547.52 |

### Lectura rápida
- **SPX500 lidera con claridad**: el motor mixto `EMA_PB + ZONE + SMA_X` produce más del doble del rendimiento combinado de los otros dos bots, con el mejor PF (2.20) y el menor drawdown (3.94%). Su mejor racha fue la semana del 13-19 abr (+$539.41) y la peor la del 25-31 may (-$250.32).
- **EURUSD avanza despacio pero estable**: WR 45.45% y PF 1.20 — apenas rentable, arrastrado por una racha perfecta de 5 wins consecutivos (09-15 mar, +$377.15) que compensa varias rachas de 2-3 losses seguidas. Sin esa semana, el bot estaría prácticamente plano.
- **BTCUSDT es el más débil del trimestre**: WR 37.5%, PF 1.18 y el mayor drawdown (6.79%) y racha de pérdidas (7) de los tres. Tal como se documentó en el tuning de junio, esta debilidad es de **régimen de mercado** (corrección choppy post-ATH), no de parámetros — la config ya está en su óptimo (ver `project_btcusd_tuning`).
- **Solapamiento de operaciones**: solo en la semana del 02-08 mar coincidieron señales ganadoras en los tres bots a la vez (+$691.99 combinados); en la semana del 25-31 may coincidieron en rojo los tres (-$416.00 combinados) — son las dos semanas de mayor correlación entre los tres sistemas.
- **Distribución temporal**: SPX500 concentra su actividad desde mediados de febrero (la mayoría de sus operaciones caen entre semana 9 y semana 22), mientras que BTCUSDT está más activo en enero-febrero y prácticamente inactivo entre mediados de marzo y finales de mayo (filtros de sesión/cooldown más estrictos).
