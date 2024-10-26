import { INR_BALANCES, ORDERBOOK, STOCK_DETAILS } from "../data/data";
import { ResponseStatus } from "./types";
export const createStockSymbol = (
  stockSymbol: string,
  userId: string,
  description: string,
  endTime: string
) => {
  if (!INR_BALANCES[userId]) {
    return JSON.stringify({
      statusCode: ResponseStatus.BadRequest,
      response: { error: "User with this id does not exists." },
    });
  }
  if (ORDERBOOK[stockSymbol] || STOCK_DETAILS[stockSymbol]) {
    return JSON.stringify({
      statusCode: ResponseStatus.Conflict,
      response: { error: "Stock with this symbol already exist." },
    });
  }
  ORDERBOOK[stockSymbol] = {
    yes: {},
    no: {},
  };
  const time = new Date();
  const minute = time.getMinutes();
  const hour = time.getHours();
  const day = time.getDate();
  const month = time.getMonth() + 1;
  const year = time.getFullYear();
  const createdAt = `${day}-${month}-${year}T${hour}:${minute} `;

  STOCK_DETAILS[stockSymbol] = {
    owner: userId,

    description,
    createdAt,
    endTime,

    isActive: true,
  };
  //   createSchedule(endTime, stockSymbol);
  return JSON.stringify({
    statusCode: ResponseStatus.Success,
    response: { message: "Stock symbol created successfully." },
  });
};
