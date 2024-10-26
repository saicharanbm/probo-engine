import {
  ADMIN_Balance,
  INR_BALANCES,
  ORDERBOOK,
  STOCK_BALANCES,
  STOCK_DETAILS,
} from "./data/data";
import { buyAndSellStocks } from "./utils/buyAndSelStocks";
import { cancelOrder } from "./utils/cancelOrder";
import { connectToRedis, publisherClient } from "./utils/createPublisherClient";
import { createStockSymbol } from "./utils/createStockSymbol";
import { getInrBalance } from "./utils/getInrBalance";
import { getStockBalance } from "./utils/getStockBalance";
import { ResponseStatus } from "./utils/types";

connectToRedis();

const getDataFromQueue = async () => {
  while (true) {
    try {
      const request = await publisherClient.brPop("requests", 0);
      const { id, type, data } = JSON.parse(request.element);
      console.log(id, type, data);
      switch (type) {
        case "getOrderBook":
          const orderbook = JSON.stringify({
            statusCode: 200,
            response: ORDERBOOK,
          });
          await publisherClient.publish(id, orderbook);
          break;
        case "getUserBalance":
          await publisherClient.publish(id, getInrBalance(data.userId));
          break;
        case "balance":
          await publisherClient.publish(id, getInrBalance());
          break;
        case "getUserStockBalance":
          await publisherClient.publish(id, getStockBalance(data.userId));
          break;
        case "getStockBalance":
          await publisherClient.publish(id, getStockBalance());
          break;
        case "getStockDetails":
          await publisherClient.publish(
            id,
            JSON.stringify({
              statusCode: 200,
              response: STOCK_DETAILS,
            })
          );
          break;
        case "getAdminBalance":
          await publisherClient.publish(
            id,
            JSON.stringify({
              statusCode: 200,
              response: ADMIN_Balance,
            })
          );
          break;
        case "createUser":
          if (INR_BALANCES[data.userId]) {
            await publisherClient.publish(
              id,
              JSON.stringify({
                statusCode: ResponseStatus.Conflict,
                response: { error: "User with this id already exists." },
              })
            );
          } else {
            INR_BALANCES[data.userId] = {
              balance: 0,
              locked: 0,
            };
            STOCK_BALANCES[data.userId] = {};
            await publisherClient.publish(
              id,
              JSON.stringify({
                statusCode: ResponseStatus.Success,
                response: { message: "New user created." },
              })
            );
          }
          break;
        case "createSymbol":
          await publisherClient.publish(
            id,
            createStockSymbol(
              data.stockSymbol,
              data.userId,
              data.description,
              data.endTime
            )
          );
          break;
        case "addMoney":
          if (!INR_BALANCES[data.userId]) {
            await publisherClient.publish(
              id,
              JSON.stringify({
                statusCode: ResponseStatus.BadRequest,
                response: {
                  error: "User with the provided userId does not exist.",
                },
              })
            );
          } else {
            INR_BALANCES[data.userId].balance += data.amount;
            await publisherClient.publish(
              id,
              JSON.stringify({
                statusCode: ResponseStatus.Success,
                response: {
                  message: `Balance updated successfully for the user ${data.userId}.`,
                },
              })
            );
          }

          break;
        case "cancelOrder":
          await publisherClient.publish(
            id,
            cancelOrder(
              data.userId,
              data.stockSymbol,
              data.quantity,
              data.price,
              data.oppositeStockPrice,
              data.oppositeStockType
            )
          );
          break;
        case "buyStock":
          await publisherClient.publish(
            id,
            buyAndSellStocks(
              "buy",
              data.userId,
              data.stockSymbol,
              data.price,
              data.quantity,
              data.stockType
            )
          );
          break;
        case "sellStock":
          await publisherClient.publish(
            id,
            buyAndSellStocks(
              "sell",
              data.userId,
              data.stockSymbol,
              data.price,
              data.quantity,
              data.stockType
            )
          );
          break;
        default:
          break;
      }
    } catch (error) {
      console.error("Error while getting data from queue:", error);
      // Optionally, add a delay before retrying to prevent hammering Redis in case of failure
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
};

getDataFromQueue();
