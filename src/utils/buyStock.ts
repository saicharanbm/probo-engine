import { createClientOrderBook } from "./createClientOrderBook";
import {
  ORDERBOOK,
  INR_BALANCES,
  STOCK_BALANCES,
  ADMIN_Balance,
} from "../data/data";
import { publishDataToPubSub } from "./publishDataToPubSub";

const buyStock = (
  userId: string,
  stockSymbol: string,
  userStock: "yes" | "no",
  oppositeStock: "yes" | "no",
  quantity: number,
  price: number
) => {
  let requiredStocks = quantity;

  //In order to provide the best price let us check for all the possibe best prices
  //starting from 50 to price
  for (let bestPrice = 50; bestPrice <= price; bestPrice += 50) {
    const oppositeStockPrice = 1000 - bestPrice;
    if (ORDERBOOK[stockSymbol]?.[userStock]?.[bestPrice]) {
      console.log("prices ", bestPrice);
      //first check for the request/sudo stock and then switch to selling stock
      while (
        ORDERBOOK[stockSymbol][userStock][bestPrice] &&
        requiredStocks > 0
      ) {
        // Check if there are "request/sudo" orders for matching
        const requestOrders =
          ORDERBOOK[stockSymbol][userStock][bestPrice].orders.req;
        if (Object.keys(requestOrders).length > 0) {
          console.log("Matching with request order");
          const userToBeMatched = Object.keys(requestOrders)[0];
          const matchingStocksCount = Math.min(
            requiredStocks,
            requestOrders[userToBeMatched]
          );

          // Deduct the stock cost from balance
          INR_BALANCES[userId].balance -= bestPrice * matchingStocksCount;
          ADMIN_Balance.balance += bestPrice * matchingStocksCount;

          // Deduct the locked stock amount from the matched user
          INR_BALANCES[userToBeMatched].locked -=
            oppositeStockPrice * matchingStocksCount;
          ADMIN_Balance.balance += oppositeStockPrice * matchingStocksCount;

          // Deduct the matched stock count from the total stocks
          ORDERBOOK[stockSymbol][userStock][bestPrice].total -=
            matchingStocksCount;

          // Remove the matched user from the orders or reduce the quantity
          if (matchingStocksCount === requestOrders[userToBeMatched]) {
            delete requestOrders[userToBeMatched];
          } else {
            requestOrders[userToBeMatched] -= matchingStocksCount;
          }

          // Deduct the matching stocks from requiredStocks
          requiredStocks -= matchingStocksCount;

          // Update stock balances for the matched user
          if (!STOCK_BALANCES[userToBeMatched][stockSymbol]) {
            STOCK_BALANCES[userToBeMatched][stockSymbol] = {};
          }
          if (!STOCK_BALANCES[userToBeMatched][stockSymbol][oppositeStock]) {
            STOCK_BALANCES[userToBeMatched][stockSymbol][oppositeStock] = {
              quantity: 0,
              locked: 0,
            };
          }
          //award the stocks to the user who got matched
          STOCK_BALANCES[userToBeMatched][stockSymbol][
            oppositeStock
          ].quantity += matchingStocksCount;

          // Remove order if total stocks are exhausted
          if (ORDERBOOK[stockSymbol][userStock][bestPrice].total <= 0) {
            delete ORDERBOOK[stockSymbol][userStock][bestPrice];
          }
        } else {
          break;
        }
      }
      // Check for matching with sell orders
      while (
        ORDERBOOK[stockSymbol][userStock][bestPrice] &&
        requiredStocks > 0
      ) {
        const sellOrders =
          ORDERBOOK[stockSymbol][userStock][bestPrice].orders.sell;

        if (Object.keys(sellOrders).length > 0) {
          console.log("Matching with sell order");
          const userSellingTheStock = Object.keys(sellOrders)[0];
          console.log("User selling the stock", userSellingTheStock);
          //get the number  of stocks that are available to match
          const matchingStocksCount = Math.min(
            requiredStocks,
            sellOrders[userSellingTheStock]
          );

          // Award the seller with the buyer's money
          INR_BALANCES[userSellingTheStock].balance +=
            bestPrice * matchingStocksCount;
          INR_BALANCES[userId].balance -= bestPrice * matchingStocksCount;
          //deduct the matched stock count from the total stocks
          ORDERBOOK[stockSymbol][userStock][bestPrice].total -=
            matchingStocksCount;

          // Deduct the matched stock count from the seller record
          sellOrders[userSellingTheStock] -= matchingStocksCount;

          // Deduct the stock from the seller's stock balance and release locked stocks

          if (
            STOCK_BALANCES[userSellingTheStock] &&
            STOCK_BALANCES[userSellingTheStock][stockSymbol] &&
            STOCK_BALANCES[userSellingTheStock][stockSymbol][userStock]
          ) {
            STOCK_BALANCES[userSellingTheStock][stockSymbol][
              userStock
            ].locked -= matchingStocksCount;
            if (
              STOCK_BALANCES[userSellingTheStock][stockSymbol][userStock]
                .locked === 0 &&
              STOCK_BALANCES[userSellingTheStock][stockSymbol][userStock]
                .quantity === 0
            ) {
              delete STOCK_BALANCES[userSellingTheStock][stockSymbol][
                userStock
              ];
              if (
                Object.keys(STOCK_BALANCES[userSellingTheStock][stockSymbol])
                  .length <= 0
              ) {
                delete STOCK_BALANCES[userSellingTheStock][stockSymbol];
              }
            }
          }

          // if sellers stock balance for this stock type at this price is 0, remove it

          //award the matched stock to the buyer it will be done at the end for both req and sell stocks at once.

          if (sellOrders[userSellingTheStock] === 0) {
            delete sellOrders[userSellingTheStock];
          }

          // Deduct the matching stocks from requiredStocks
          requiredStocks -= matchingStocksCount;

          // Remove order if total stocks are exhausted
          if (ORDERBOOK[stockSymbol][userStock][bestPrice].total <= 0) {
            delete ORDERBOOK[stockSymbol][userStock][bestPrice];
          }
        } else {
          break; // No sell orders, exit the loop
        }
      }
    }
    // Update stock balances for the current user after matching the stocks
    if (!STOCK_BALANCES[userId]) {
      STOCK_BALANCES[userId] = {};
    }
    if (!STOCK_BALANCES[userId][stockSymbol]) {
      STOCK_BALANCES[userId][stockSymbol] = {};
    }
    if (!STOCK_BALANCES[userId][stockSymbol][userStock]) {
      STOCK_BALANCES[userId][stockSymbol][userStock] = {
        quantity: 0,
        locked: 0,
      };
    }

    STOCK_BALANCES[userId][stockSymbol][userStock].quantity +=
      quantity - requiredStocks;
  }

  // If there are still required stocks left, place a new request order in the order book for the opposite stock at the required match price
  if (requiredStocks > 0) {
    const requiredMatchPrice = 1000 - price;
    if (ORDERBOOK[stockSymbol]?.[oppositeStock]?.[requiredMatchPrice]) {
      ORDERBOOK[stockSymbol][oppositeStock][requiredMatchPrice].total +=
        requiredStocks;

      if (
        userId in
        ORDERBOOK[stockSymbol][oppositeStock][requiredMatchPrice].orders.req
      ) {
        ORDERBOOK[stockSymbol][oppositeStock][requiredMatchPrice].orders.req[
          userId
        ] += requiredStocks;
      } else {
        ORDERBOOK[stockSymbol][oppositeStock][requiredMatchPrice].orders.req[
          userId
        ] = requiredStocks;
      }
    } else {
      ORDERBOOK[stockSymbol][oppositeStock][requiredMatchPrice] = {
        total: requiredStocks,
        orders: {
          sell: {},
          req: { [userId]: requiredStocks },
        },
      };
    }

    // Lock the user's balance
    INR_BALANCES[userId].locked += requiredStocks * price;
    INR_BALANCES[userId].balance -= requiredStocks * price;
  }
  const clientOrderBook = createClientOrderBook(ORDERBOOK[stockSymbol]);
  publishDataToPubSub(clientOrderBook, stockSymbol);
};

export { buyStock };
