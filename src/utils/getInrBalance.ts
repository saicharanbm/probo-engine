import { INR_BALANCES } from "../data/data";
import { ResponseStatus } from "./types";

export const getInrBalance = (userId?: string) => {
  if (userId) {
    if (!INR_BALANCES[userId]) {
      return JSON.stringify({
        statusCode: ResponseStatus.BadRequest,
        response: { error: "User with the provided userId does not exist." },
      });
    }
    return JSON.stringify({
      statusCode: ResponseStatus.Success,
      response: INR_BALANCES[userId],
    });
  } else {
    return JSON.stringify({
      statusCode: ResponseStatus.Success,
      response: INR_BALANCES,
    });
  }
};
