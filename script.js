async function trendingStocks(n) {
    // Fetch the top 500 symbols
    const symbolsResponse = await fetch('https://api.frontendexpert.io/api/fe/stock-symbols');
    const symbolsData = await symbolsResponse.json();

    // Get the top n symbols
    const topNSymbols = symbolsData.slice(0, n).map(stock => stock.symbol);

    // Fetch prices and market caps concurrently
    const [pricesResponse, marketCapsResponse] = await Promise.all([
        fetch(`https://api.frontendexpert.io/api/fe/stock-prices?symbols=${JSON.stringify(topNSymbols)}`),
        fetch('https://api.frontendexpert.io/api/fe/stock-market-caps')
    ]);

    const pricesData = await pricesResponse.json();
    const marketCapsData = await marketCapsResponse.json();

    // Create a dictionary for market caps for quick lookup
    const marketCapsDict = marketCapsData.reduce((acc, stock) => {
        acc[stock.symbol] = stock['market-cap'];
        return acc;
    }, {});

    // Merge the data from all APIs
    const result = topNSymbols.map(symbol => {
        const stockSymbolData = symbolsData.find(stock => stock.symbol === symbol);
        const stockPriceData = pricesData.find(stock => stock.symbol === symbol);
        const stockMarketCapData = marketCapsDict[symbol];

        return {
            name: stockSymbolData.name,
            symbol: stockSymbolData.symbol,
            price: stockPriceData.price,
            "market-cap": stockMarketCapData,
            "52-week-high": stockPriceData['52-week-high'],
            "52-week-low": stockPriceData['52-week-low']
        };
    });

    return result;
}

// Sample Usage
(async () => {
    console.log(await trendingStocks(0)); // []
    console.log(await trendingStocks(2)); // Top 2 stocks by market cap
})();

module.exports=trendingStocks;  
