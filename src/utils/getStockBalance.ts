import { INR_BALANCES, STOCK_BALANCES } from "../data/data";
import { ResponseStatus } from "./types";

export const getStockBalance = (userId?: string) => {
  if (userId) {
    if (!INR_BALANCES[userId]) {
      return JSON.stringify({
        statusCode: ResponseStatus.BadRequest,
        response: { error: "User with the provided userId does not exist." },
      });
    }
    if (Object.keys(STOCK_BALANCES[userId]).length === 0) {
      return JSON.stringify({
        statusCode: ResponseStatus.Success,
        response: { message: "User has not bought any stocks." },
      });
    }
    return JSON.stringify({
      statusCode: ResponseStatus.Success,
      response: STOCK_BALANCES[userId],
    });
  } else {
    return JSON.stringify({
      statusCode: ResponseStatus.Success,
      response: STOCK_BALANCES,
    });
  }
};
