export const getMarketPrice = async (ticker, moneda = 'EUR') => {
  try {
    const cleanTicker = ticker.trim().toUpperCase()
    // Si el usuario pone SPY o VUSA.L, Yahoo Finance normalmente los lee tal cual o con sus sufijos estándar.
    
    // Usamos query2.finance.yahoo.com a través de un proxy robusto de YQL
    const targetUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${cleanTicker}?interval=1d&range=1d`
    
    // Utilizamos allorigins pero con el endpoint /get (que devuelve JSON parseable en lugar de raw)
    // Esto evita el bloqueo estricto que vimos en el primer intento.
    const resStock = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`)
    
    if (!resStock.ok) throw new Error("Fallo de red al obtener datos de Yahoo")
    
    const proxyData = await resStock.json()
    const dataStock = JSON.parse(proxyData.contents)
    
    // Navegamos por la estructura JSON de Yahoo Finance
    const result = dataStock.chart.result
    if (!result || !result[0] || !result[0].meta || !result[0].meta.regularMarketPrice) {
       console.error("No se encontró el precio para el ticker:", cleanTicker)
       return null
    }

    const precioRaw = parseFloat(result[0].meta.regularMarketPrice)

    if (moneda === 'USD') return precioRaw

    const resForex = await fetch('https://api.frankfurter.dev/v1/latest?base=USD&symbols=EUR')
    if (!resForex.ok) throw new Error("Fallo en API de divisas")
    
    const dataForex = await resForex.json()
    const tasa = dataForex.rates.EUR

    return precioRaw * tasa
  } catch (error) {
    console.error("Fallo en servicio de mercado (Yahoo):", error.message)
    return null
  }
}