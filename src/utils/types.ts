interface balance {
  [key: string]: {
    balance: number;
    locked: number;
  };
}

interface orderBook {
  [key: string]: {
    yes: {
      [key: number]: {
        total: number;
        orders: {
          sell: {
            [key: string]: number;
          };
          req: {
            [key: string]: number;
          };
        };
      };
    };
    no: {
      [key: number]: {
        total: number;
        orders: {
          sell: {
            [key: string]: number;
          };
          req: {
            [key: string]: number;
          };
        };
      };
    };
  };
}

interface stockBalance {
  [key: string]: {
    [key: string]: {
      yes?: {
        quantity: number;
        locked: number;
      };
      no?: {
        quantity: number;
        locked: number;
      };
    };
  };
}

interface StockDetails {
  [key: string]: {
    owner: string;
    description: string;
    createdAt: string;
    endTime: string;
    isActive: boolean;
  };
}

enum ResponseStatus {
  Success = 200,
  NotFound = 404,
  Error = 500,
  BadRequest = 400,
  Unauthorized = 401,
  Conflict = 409,
}
type currentPrice = {
  [key: string]: {
    yes: number;
    no: number;
  };
};

export {
  balance,
  orderBook,
  stockBalance,
  StockDetails,
  ResponseStatus,
  currentPrice,
};
