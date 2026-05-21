export interface LiquidityLevel {

  price: number;

  type:
    | "EQH"
    | "EQL";

  touches: number;

  firstTouchTime: number;
}