export const getMarketPrice = async (ticker, moneda = 'EUR') => {
  try {
    const cleanTicker = ticker.trim().toUpperCase()
    const stooqSymbol = cleanTicker === 'SPY' ? 'SPY.US' : cleanTicker
    
    const targetUrl = `https://stooq.com/q/l/?s=${stooqSymbol}&f=sd2t2ohlcv&h&e=json`
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`
    
    const resStock = await fetch(proxyUrl)
    if (!resStock.ok) throw new Error("Fallo al conectar con el proxy de mercado")
    
    const dataStock = await resStock.json()
    
    if (!dataStock.symbols || !dataStock.symbols[0]) return null
    const precioRaw = parseFloat(dataStock.symbols[0].close)

    if (moneda === 'USD') return precioRaw

    const resForex = await fetch('https://api.frankfurter.dev/v1/latest?base=USD&symbols=EUR')
    if (!resForex.ok) throw new Error("Fallo al conectar con la API de divisas")
    
    const dataForex = await resForex.json()
    const tasa = dataForex.rates.EUR

    return precioRaw * tasa
  } catch (error) {
    console.error("Fallo en servicio de mercado:", error.message)
    return null
  }
}