import { publisherClient } from "./createPublisherClient";
const publishDataToPubSub = async (
  data: {
    yes: {
      [key: number]: {
        total: number;
      };
    };
    no: {
      [key: number]: {
        total: number;
      };
    };
  },
  stockSymbol: string
) => {
  const orderBook = JSON.stringify(data);
  try {
    await publisherClient.set(`lastMessage:${stockSymbol}`, orderBook);
    await publisherClient.publish(stockSymbol, orderBook);
  } catch (error) {
    console.log(`Error publishing data: ${error}`);
  }
};

export { publishDataToPubSub };
