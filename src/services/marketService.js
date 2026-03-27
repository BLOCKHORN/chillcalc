export const getMarketPrice = async (ticker) => {
  try {
    const cleanTicker = ticker.trim().toUpperCase()
    // Stooq usa el formato TICKER.US para acciones de EEUU
    const stooqSymbol = cleanTicker === 'SPY' ? 'SPY.US' : cleanTicker
    
    // 1. Obtener precio del activo (Stooq JSON)
    const urlStock = `/api-stooq/q/l/?s=${stooqSymbol}&f=sd2t2ohlcv&h&e=json`
    const resStock = await fetch(urlStock)
    const dataStock = await resStock.json()
    
    if (!dataStock.symbols || !dataStock.symbols[0]) return null
    const precioUSD = parseFloat(dataStock.symbols[0].close)

    // 2. Obtener cambio USD/EUR (Frankfurter - API Abierta)
    const resForex = await fetch('/api-forex/latest?from=USD&to=EUR')
    const dataForex = await resForex.json()
    const tasa = dataForex.rates.EUR

    const precioFinalEUR = precioUSD * tasa
    
    console.log(`✅ Sincronizado vía Stooq: ${cleanTicker} a ${precioFinalEUR.toFixed(2)}€`)
    return precioFinalEUR

  } catch (error) {
    console.error("Fallo en servicio guerrilla:", error.message)
    return null
  }
}