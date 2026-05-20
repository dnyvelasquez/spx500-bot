import { MarketDataService }
  from "./market-data/market-data.service";

import { marketEvents }
  from "./market-data/market-events";

async function main() {

  const market =
    new MarketDataService();

  marketEvents.on(
    "new-candle",
    (data) => {

      console.log(
        "\nNEW CANDLE:"
      );

      console.log(data);
    }
  );

  console.log(
    "Monitoring candles..."
  );

  setInterval(async () => {

    await market.loadCandles(
      "SPX500",
      "M1",
      10
    );

  }, 5000);
}

main();