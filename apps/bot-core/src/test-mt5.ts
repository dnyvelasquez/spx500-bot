import { MT5Service } from "./services/mt5/mt5.service";

async function main() {

  const mt5 =
    new MT5Service();

  const tick =
    await mt5.getTick("SPX500");

  console.log("\nTICK:");
  console.log(tick);

  const candles =
    await mt5.getCandles(
      "SPX500",
      "M5",
      5
    );

  console.log("\nCANDLES:");
  console.log(candles.data);
}

main();