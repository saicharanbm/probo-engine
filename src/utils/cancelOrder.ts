import { INR_BALANCES, ORDERBOOK } from "../data/data";
import { ResponseStatus } from "./types";
import { createClientOrderBook } from "./createClientOrderBook";
import { publishDataToPubSub } from "./publishDataToPubSub";
export const cancelOrder = (
  userId: string,
  stockSymbol: "yes" | "no",
  quantity: number,
  price: number,
  oppositeStockPrice: number,
  oppositeStockType: "yes" | "no"
) => {
  if (!INR_BALANCES[userId]) {
    return JSON.stringify({
      statusCode: ResponseStatus.BadRequest,
      response: { error: `User with this userID: ${userId} does not exist.` },
    });
  }
  if (!ORDERBOOK[stockSymbol]) {
    return JSON.stringify({
      statusCode: ResponseStatus.BadRequest,
      response: {
        error: `Stock Symbol: ${stockSymbol} is either expired or not present.`,
      },
    });
  }

  if (
    !ORDERBOOK[stockSymbol][oppositeStockType] ||
    !ORDERBOOK[stockSymbol][oppositeStockType][oppositeStockPrice] ||
    !ORDERBOOK[stockSymbol][oppositeStockType][oppositeStockPrice].orders.req
  ) {
    return JSON.stringify({
      statusCode: ResponseStatus.BadRequest,
      response: { error: "There is no Unmatched stocks for this stock." },
    });
  }
  if (
    !ORDERBOOK[stockSymbol][oppositeStockType][oppositeStockPrice].orders.req[
      userId
    ]
  ) {
    return JSON.stringify({
      statusCode: ResponseStatus.BadRequest,
      response: {
        error: `User ${userId} does not have any stocks at this price to sell.`,
      },
    });
  }
  if (
    ORDERBOOK[stockSymbol][oppositeStockType][oppositeStockPrice].orders.req[
      userId
    ] < quantity
  ) {
    return JSON.stringify({
      statusCode: ResponseStatus.BadRequest,
      response: {
        error: `User ${userId} does not have the suffecient stocks.`,
      },
    });
  }
  ORDERBOOK[stockSymbol][oppositeStockType][oppositeStockPrice].orders.req[
    userId
  ] -= quantity;

  ORDERBOOK[stockSymbol][oppositeStockType][oppositeStockPrice].total -=
    quantity;
  if (
    ORDERBOOK[stockSymbol][oppositeStockType][oppositeStockPrice].orders.req[
      userId
    ] === 0
  ) {
    delete ORDERBOOK[stockSymbol][oppositeStockType][oppositeStockPrice].orders
      .req[userId];
  }
  if (
    ORDERBOOK[stockSymbol][oppositeStockType][oppositeStockPrice].total === 0
  ) {
    delete ORDERBOOK[stockSymbol][oppositeStockType][oppositeStockPrice];
  }
  // relese the locked amount to the users balance
  INR_BALANCES[userId].locked -= quantity * price;
  INR_BALANCES[userId].balance += quantity * price;

  //
  const clientOrderBook = createClientOrderBook(ORDERBOOK[stockSymbol]);
  publishDataToPubSub(clientOrderBook, stockSymbol);
  return JSON.stringify({
    statusCode: ResponseStatus.Success,
    response: { message: "Requested stocks cancelled successfully." },
  });
};
