import {
  STOCK_BALANCES,
  ADMIN_Balance,
  INR_BALANCES,
  ORDERBOOK,
} from "../data/data";

const rewardWinners = (stockSymbol: string, result: "yes" | "no") => {
  //reward the winners their price money from the admin balance
  //relese the locked money of unmatched stocks irrespective of result
  for (let userId in STOCK_BALANCES) {
    const userStocks = STOCK_BALANCES[userId];
    if (!userStocks) continue;

    for (let stockSymb in userStocks) {
      if (stockSymb === stockSymbol) {
        const Stock = userStocks[stockSymbol];

        if (!Stock) continue;

        const stockWinnerTypeData = Stock[result];
        if (!stockWinnerTypeData) continue;
        for (const stockPrice in stockWinnerTypeData) {
          const stockDetails = stockWinnerTypeData;
          if (stockDetails) {
            // This is where you can safely access stockDetails.matched and stockDetails.locked
            const { quantity, locked } = stockDetails;
            //reward the winners their price money from the admin balance for both quantity and locked
            if (quantity > 0) {
              ADMIN_Balance.balance -= quantity * 1000;
              INR_BALANCES[userId].balance += quantity * 1000;
            }
            if (locked > 0) {
              ADMIN_Balance.balance -= locked * 1000;
              INR_BALANCES[userId].balance += locked * 1000;
            }
          }
        }
        // const losingStock = result === "yes" ? "no" : "yes";
        // const stockLoserTypeData = Stock[losingStock];
        // if (!stockLoserTypeData) continue;
        // for (const stockPrice in stockLoserTypeData) {
        //   const stockDetails = stockLoserTypeData;
        //   if (stockDetails) {
        //     // This is where you can safely access stockDetails.matched and stockDetails.locked
        //     const { quantity, locked } = stockDetails;

        //     if (locked > 0) {
        //       INR_BALANCES[userId].locked -= locked * Number(stockPrice);
        //       INR_BALANCES[userId].balance += locked * Number(stockPrice);
        //     }
        //   }
        // }
      }
    }
  }
  // release the locked money of unmatched stocks
  const Stock = ORDERBOOK[stockSymbol];
  if (!Stock) return;
  ["yes", "no"].map((key) => {
    Object.keys(Stock[key as keyof typeof Stock]).forEach((price) => {
      if (Stock[key as keyof typeof Stock][parseInt(price)].total > 0) {
        Object.keys(
          Stock[key as keyof typeof Stock][parseInt(price)].orders.req
        ).forEach((userId) => {
          const quantity =
            Stock[key as keyof typeof Stock][parseInt(price)].orders.req.userId;
          INR_BALANCES[userId].locked -= quantity * Number(price);
          INR_BALANCES[userId].balance += quantity * Number(price);
        });
      }
    });
  });
};

export { rewardWinners };
