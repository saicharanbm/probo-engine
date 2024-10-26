import { createClientOrderBook } from "./createClientOrderBook";
import { INR_BALANCES, ORDERBOOK, STOCK_BALANCES } from "../data/data";
import { publishDataToPubSub } from "./publishDataToPubSub";

const sellStock = (
  userId: string,
  stockSymbol: string,
  stockType: string,
  price: number,
  requiredQuantity: number
) => {
  if (!(stockType === "yes" || stockType === "no")) {
    return;
  }
  let quantity = requiredQuantity;

  //first check if there is any requrst for the opposite stock type in the orderbook
  //because if there is a record for the opposite stock type in the orderbook for the price (1000-price )
  // then there is a user who bought the stock at the price seller is selling and waiting for a match.
  //All we need to do is award the buyers locked money to the seller and reward the buyer with the sellers stock.
  const oppositeStockType = stockType === "yes" ? "no" : "yes";
  const oppositeStockPrice = 1000 - price;
  if (
    ORDERBOOK[stockSymbol][oppositeStockType][oppositeStockPrice] &&
    ORDERBOOK[stockSymbol][oppositeStockType][oppositeStockPrice].orders.req
  ) {
    while (
      ORDERBOOK[stockSymbol][oppositeStockType][oppositeStockPrice].orders
        .req &&
      quantity > 0
    ) {
      const requestOrders =
        ORDERBOOK[stockSymbol][oppositeStockType][oppositeStockPrice].orders
          .req;
      if (Object.keys(requestOrders).length > 0) {
        const userRequestingTheStock = Object.keys(requestOrders)[0];
        const matchingStocksCount = Math.min(
          quantity,
          requestOrders[userRequestingTheStock]
        );
        //remove the request from order book
        requestOrders[userRequestingTheStock] -= matchingStocksCount;
        //decrease the total
        ORDERBOOK[stockSymbol][oppositeStockType][oppositeStockPrice].total -=
          matchingStocksCount;

        if (quantity >= matchingStocksCount) {
          delete requestOrders[userRequestingTheStock];
        }

        quantity -= matchingStocksCount;
        //now deduct the locked money from the user requesting the stock and award it to the seller.
        INR_BALANCES[userRequestingTheStock].locked -=
          matchingStocksCount * price;

        INR_BALANCES[userId].balance += matchingStocksCount * price;

        //deduct the stocks sold from the locked stage of the seller
        if (
          STOCK_BALANCES[userId] &&
          STOCK_BALANCES[userId][stockSymbol] &&
          STOCK_BALANCES[userId][stockSymbol][stockType]
        ) {
          STOCK_BALANCES[userId][stockSymbol][stockType].locked -=
            matchingStocksCount;
          if (
            STOCK_BALANCES[userId][stockSymbol][stockType].locked === 0 &&
            STOCK_BALANCES[userId][stockSymbol][stockType].quantity == 0
          ) {
            delete STOCK_BALANCES[userId][stockSymbol][stockType];
            if (Object.keys(STOCK_BALANCES[userId][stockSymbol]).length <= 0) {
              delete STOCK_BALANCES[userId][stockSymbol];
            }
          }

          // add the stock to the user requesting the stock
          if (!STOCK_BALANCES[userRequestingTheStock]) {
            STOCK_BALANCES[userRequestingTheStock] = {};
          }
          if (!STOCK_BALANCES[userRequestingTheStock][stockSymbol]) {
            STOCK_BALANCES[userRequestingTheStock][stockSymbol] = {};
          }
          if (!STOCK_BALANCES[userRequestingTheStock][stockSymbol][stockType]) {
            STOCK_BALANCES[userRequestingTheStock][stockSymbol][stockType] = {
              quantity: 0,
              locked: 0,
            };
          }
          STOCK_BALANCES[userRequestingTheStock][stockSymbol][
            stockType
          ].quantity += matchingStocksCount;
        }
        if (
          ORDERBOOK[stockSymbol][oppositeStockType][oppositeStockPrice]
            .total === 0
        ) {
          delete ORDERBOOK[stockSymbol][oppositeStockType][oppositeStockPrice];
          break;
        }
      } else {
        break;
      }
    }
    //deduct the stock request
  }
  if (quantity > 0) {
    if (!ORDERBOOK[stockSymbol][stockType][price]) {
      ORDERBOOK[stockSymbol][stockType][price] = {
        total: 0,
        orders: {
          sell: {},
          req: {},
        },
      };
    }
    ORDERBOOK[stockSymbol][stockType][price].total += quantity;
    if (!ORDERBOOK[stockSymbol][stockType][price].orders.sell[userId]) {
      ORDERBOOK[stockSymbol][stockType][price].orders.sell[userId] = quantity;
    } else {
      ORDERBOOK[stockSymbol][stockType][price].orders.sell[userId] += quantity;
    }
  }
  const clientOrderBook = createClientOrderBook(ORDERBOOK[stockSymbol]);
  publishDataToPubSub(clientOrderBook, stockSymbol);
};

export { sellStock };
