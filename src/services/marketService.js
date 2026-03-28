const FINNHUB_API_KEY = 'd740k8hr01qno4pvvvu0d740k8hr01qno4pvvvug' // <-- Pon tu clave aquí

export const getMarketPrice = async (ticker, moneda = 'EUR') => {
  try {
    let cleanTicker = ticker.trim().toUpperCase()
    
    // Auto-corrector: Si metes SPY.US, lo deja en SPY para que Finnhub lo entienda
    if (cleanTicker.endsWith('.US')) {
      cleanTicker = cleanTicker.replace('.US', '')
    }
    
    const resStock = await fetch(`https://finnhub.io/api/v1/quote?symbol=${cleanTicker}&token=${FINNHUB_API_KEY}`)
    if (!resStock.ok) throw new Error("Fallo al conectar con Finnhub")
    
    const dataStock = await resStock.json()
    
    // Si Finnhub no encuentra el ticker, devuelve c: 0
    if (!dataStock.c || dataStock.c === 0) {
      console.warn(`Finnhub no encontró datos para el ticker: ${cleanTicker}`)
      return null
    }
    
    const precioRaw = dataStock.c

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