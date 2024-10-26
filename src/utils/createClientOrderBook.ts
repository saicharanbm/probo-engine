const createClientOrderBook = (data: {
  yes: {
    [key: number]: {
      total: number;
      orders?: {
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
      orders?: {
        sell: {
          [key: string]: number;
        };
        req: {
          [key: string]: number;
        };
      };
    };
  };
}) => {
  const clientOrderBook = JSON.parse(JSON.stringify(data));
  let yesStocks: number[] = [];
  let noStocks: number[] = [];

  // Populate yesStocks array and remove 'orders' from yes items
  Object.keys(clientOrderBook.yes).forEach((key) => {
    delete clientOrderBook.yes[key].orders;
    yesStocks.push(clientOrderBook.yes[key].total);
  });

  // Populate noStocks array and remove 'orders' from no items
  Object.keys(clientOrderBook.no).forEach((key) => {
    delete clientOrderBook.no[key].orders;
    noStocks.push(clientOrderBook.no[key].total);
  });

  // Sort the stocks arrays in ascending order
  yesStocks.sort((a, b) => a - b);
  noStocks.sort((a, b) => a - b);

  // Keep only the top 5 totals for yes
  if (yesStocks.length > 5) {
    yesStocks = yesStocks.slice(0, 5);
    Object.keys(clientOrderBook.yes).forEach((key) => {
      if (!yesStocks.includes(clientOrderBook.yes[key].total)) {
        delete clientOrderBook.yes[key];
      }
    });
  }

  // Keep only the top 5 totals for no
  if (noStocks.length > 5) {
    noStocks = noStocks.slice(0, 5);
    Object.keys(clientOrderBook.no).forEach((key) => {
      if (!noStocks.includes(clientOrderBook.no[key].total)) {
        delete clientOrderBook.no[key];
      }
    });
  }

  return clientOrderBook;
};

export { createClientOrderBook };
