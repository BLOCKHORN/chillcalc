export const getMarketPrice = async (ticker, moneda = 'EUR') => {
  try {
    const cleanTicker = ticker.trim().toUpperCase()
    const stooqSymbol = cleanTicker === 'SPY' ? 'SPY.US' : cleanTicker
    
    const targetUrl = `https://stooq.com/q/l/?s=${stooqSymbol}&f=sd2t2ohlcv&h&e=json`
    
    // 1. Proxy principal (rápido y estable)
    let resStock = await fetch(`https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(targetUrl)}`)
    
    // 2. Si el primero falla por saturación, usamos el de respaldo automáticamente
    if (!resStock.ok) {
        resStock = await fetch(`https://corsproxy.io/?${encodeURIComponent(targetUrl)}`)
    }

    if (!resStock.ok) throw new Error("Proxys de mercado saturados")
    
    const dataStock = await resStock.json()
    
    if (!dataStock.symbols || !dataStock.symbols[0]) return null
    const precioRaw = parseFloat(dataStock.symbols[0].close)

    if (moneda === 'USD') return precioRaw

    const resForex = await fetch('https://api.frankfurter.dev/v1/latest?base=USD&symbols=EUR')
    if (!resForex.ok) throw new Error("Fallo en API de divisas")
    
    const dataForex = await resForex.json()
    const tasa = dataForex.rates.EUR

    return precioRaw * tasa
  } catch (error) {
    console.error("Fallo en servicio de mercado:", error.message)
    return null
  }
}