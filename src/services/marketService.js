const FINNHUB_API_KEY = 'd740k8hr01qno4pvvvu0d740k8hr01qno4pvvvug'

export const getMarketPrice = async (ticker, moneda = 'EUR') => {
  try {
    const cleanTicker = ticker.trim().toUpperCase()
    
    // 1. Llamada oficial a Finnhub (Sin proxies, sin bloqueos)
    const resStock = await fetch(`https://finnhub.io/api/v1/quote?symbol=${cleanTicker}&token=${FINNHUB_API_KEY}`)
    
    if (!resStock.ok) throw new Error("Fallo al conectar con Finnhub")
    
    const dataStock = await resStock.json()
    
    // Finnhub devuelve 'c' como el precio actual de cotización
    if (!dataStock.c || dataStock.c === 0) return null
    const precioRaw = dataStock.c

    if (moneda === 'USD') return precioRaw

    // 2. Conversión a Euros (La API de Frankfurter no tiene bloqueos)
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