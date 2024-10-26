import { ResponseStatus } from "./types";
import { buyStock } from "./buyStock";
import { sellStock } from "./sellStock";
import {
  INR_BALANCES,
  ORDERBOOK,
  STOCK_DETAILS,
  STOCK_BALANCES,
} from "../data/data";
export const buyAndSellStocks = (
  type: "buy" | "sell",
  userId: string,
  stockSymbol: string,
  price: number,
  quantity: number,
  stockType: "yes" | "no"
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
        error: `Stock Symbol: ${stockSymbol} is either expired or does not exist.`,
      },
    });
  }
  if (!STOCK_DETAILS[stockSymbol].isActive) {
    return JSON.stringify({
      statusCode: ResponseStatus.BadRequest,
      response: {
        error: "Results for this stock is already announced.",
      },
    });
  }
  if (type === "buy") {
    //chech if user has enough balance
    if (INR_BALANCES[userId].balance < price * quantity) {
      return JSON.stringify({
        statusCode: ResponseStatus.BadRequest,
        response: { error: "User does not have enough balance." },
      });
    }

    if (stockType === "yes") {
      buyStock(userId, stockSymbol, "yes", "no", quantity, price);

      return JSON.stringify({
        statusCode: ResponseStatus.Success,
        response: { message: "Yes Stock bought successfully." },
      });
    } else {
      buyStock(userId, stockSymbol, "no", "yes", quantity, price);

      return JSON.stringify({
        statusCode: ResponseStatus.Success,
        response: { message: "No Stock bought successfully." },
      });
    }
  } else {
    if (!STOCK_BALANCES[userId][stockSymbol][stockType]) {
      return JSON.stringify({
        statusCode: ResponseStatus.BadRequest,
        response: {
          error: `User ${userId} does not have any stock of type ${stockType} to sell .`,
        },
      });
    }

    if (STOCK_BALANCES[userId][stockSymbol][stockType].quantity < quantity) {
      return JSON.stringify({
        statusCode: ResponseStatus.BadRequest,
        response: {
          error: "You dont have enought quantity of stocks to sell.",
        },
      });
    }
    STOCK_BALANCES[userId][stockSymbol][stockType].quantity -= quantity;
    STOCK_BALANCES[userId][stockSymbol][stockType].locked += quantity;

    sellStock(userId, stockSymbol, stockType, price, quantity);
    return JSON.stringify({
      statusCode: ResponseStatus.Success,
      response: {
        message: "Stock Sold successfully.",
      },
    });
  }
};
