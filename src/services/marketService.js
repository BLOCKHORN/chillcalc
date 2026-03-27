export const getMarketPrice = async (ticker) => {
  try {
    const cleanTicker = ticker.trim().toUpperCase()
    const stooqSymbol = cleanTicker === 'SPY' ? 'SPY.US' : cleanTicker
    
    const resStock = await fetch(`https://stooq.com/q/l/?s=${stooqSymbol}&f=sd2t2ohlcv&h&e=json`)
    const dataStock = await resStock.json()
    
    if (!dataStock.symbols || !dataStock.symbols[0]) return null
    const precioUSD = parseFloat(dataStock.symbols[0].close)

    const resForex = await fetch('https://api.frankfurter.dev/v1/latest?base=USD&symbols=EUR')
    const dataForex = await resForex.json()
    const tasa = dataForex.rates.EUR

    const precioFinalEUR = precioUSD * tasa
    
    return precioFinalEUR
  } catch (error) {
    console.error("Fallo en servicio:", error.message)
    return null
  }
}