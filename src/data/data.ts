import { balance, orderBook, stockBalance, StockDetails } from "../utils/types";

const INR_BALANCES: balance = {
  user1: {
    balance: 10000,
    locked: 1300,
  },
  user2: {
    balance: 20,
    locked: 2750,
  },
  user3: {
    balance: 20,
    locked: 0,
  },
};
// for v1 make stock price as number
const ORDERBOOK: orderBook = {
  BTC_USDT_10_Oct_2024_9_30: {
    yes: {
      950: {
        total: 12,
        orders: {
          sell: {},
          req: { user1: 2, user2: 10 },
        },
      },
      850: {
        total: 6,
        orders: {
          sell: {},
          req: { user1: 3, user2: 3 },
        },
      },
      400: {
        total: 3,
        orders: {
          sell: {},
          req: { user2: 3 },
        },
      },
    },
    no: {
      100: {
        total: 1,
        orders: {
          sell: {},
          req: { user1: 1 },
        },
      },
    },
  },
};

const STOCK_BALANCES: stockBalance = {
  user1: {
    BTC_USDT_10_Oct_2024_9_30: {
      yes: {
        quantity: 1,
        locked: 0,
      },

      no: {
        quantity: 3,
        locked: 0,
      },
    },
  },

  user2: {
    BTC_USDT_10_Oct_2024_9_30: {
      no: {
        quantity: 3,
        locked: 4,
      },
    },
  },
};

const STOCK_DETAILS: StockDetails = {
  BTC_USDT_10_Oct_2024_9_30: {
    owner: "user1", // Owner of the stock symbol

    description: "This is a description",
    createdAt: "2024-10-10T09:30:00Z",
    endTime: "2024-10-10T09:30:00Z", // Time of result announcement
    isActive: true,
  },
};
const ADMIN_Balance: Record<string, number> = {
  balance: 4000,
};

export {
  INR_BALANCES,
  ORDERBOOK,
  STOCK_BALANCES,
  STOCK_DETAILS,
  ADMIN_Balance,
};
