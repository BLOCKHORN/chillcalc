export const getMarketPrice = async (ticker, moneda = 'EUR') => {
  try {
    const cleanTicker = ticker.trim().toUpperCase()
    const stooqSymbol = cleanTicker === 'SPY' ? 'SPY.US' : cleanTicker
    
    // 1. Obtener precio del activo en USD
    const resStock = await fetch(`https://stooq.com/q/l/?s=${stooqSymbol}&f=sd2t2ohlcv&h&e=json`)
    const dataStock = await resStock.json()
    
    if (!dataStock.symbols || !dataStock.symbols[0]) return null
    const precioRaw = parseFloat(dataStock.symbols[0].close)

    // Si el usuario marcó USD, devolvemos el precio en crudo
    if (moneda === 'USD') return precioRaw

    // 2. Si marcó EUR, obtenemos el tipo de cambio y convertimos
    const resForex = await fetch('https://api.frankfurter.dev/v1/latest?base=USD&symbols=EUR')
    const dataForex = await resForex.json()
    const tasa = dataForex.rates.EUR

    return precioRaw * tasa
  } catch (error) {
    console.error("Fallo en servicio de mercado:", error.message)
    return null
  }
}