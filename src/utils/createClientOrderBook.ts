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
  // Helper function to process each side (yes/no)
  const processEntries = (entries: {
    [key: number]: { total: number; orders?: any };
  }) => {
    // Create array of [price, total] pairs
    const priceEntries = Object.entries(entries).map(([price, data]) => ({
      price: parseInt(price),
      total: data.total,
    }));
    console.log("Before", priceEntries);

    // Sort by total in descending order
    priceEntries.sort((a, b) => b.total - a.total);
    console.log("After", priceEntries);
    // Take top 5 entries
    const topEntries = priceEntries.slice(0, 5);
    console.log("Sliced", topEntries);
    return topEntries;
    // Convert back to required format
    // return topEntries.reduce((acc, { price, total }) => {
    //   acc[price] = { total };
    //   return acc;
    // }, {} as { [key: number]: { total: number } });
  };

  return {
    yes: processEntries(data.yes),
    no: processEntries(data.no),
  };
};

export { createClientOrderBook };
