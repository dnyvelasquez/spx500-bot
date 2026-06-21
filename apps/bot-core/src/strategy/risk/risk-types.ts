export interface RiskParameters {
  accountBalance: number;

  riskPercent: number;

  entryPrice: number;

  stopLoss: number;

  target: number;

  tradeContractSize: number;
}

export interface PositionSizingResult {
  riskAmount: number;

  stopDistance: number;

  positionSize: number;

  riskRewardRatio: number;
}