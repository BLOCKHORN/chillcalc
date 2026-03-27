export const initialData = {
  cuentas: [
    { id: 1, nombre: 'BBVA', tipo: 'normal', icono: 'bank', saldo: 0 },
    { id: 2, nombre: 'Revolut', tipo: 'normal', icono: 'card', saldo: 0 },
    { id: 4, nombre: 'Efectivo', tipo: 'normal', icono: 'cash', saldo: 0 },
    { id: 1774426371606, nombre: 'Bankinter', icono: 'card', tipo: 'remunerada', saldo: 0, tasa: 0.015 },
    { id: 1774449820387, nombre: 'XTB', icono: 'card', tipo: 'inversion', saldo: 0, capitalInvertido: 0, precioPromedio: 0, precioActual: 0, ticker: 'SPY' }
  ],
  transacciones: [],
  categorias: [
    "Transporte",
    "Entretenimiento",
    "Supermercado",
    "Salud",
    "Otros",
    "Ejemplo"
  ],
  objetivos: [
    { id: 1774438976099, nombre: 'Esquiar todos los dias', icono: 'target', meta: 500000, aportacionExtra: 700, tasa: 7 },
    { id: 1774439014274, nombre: '100K', icono: 'target', meta: 100000, aportacionExtra: 700, tasa: 7 },
    { id: 1774439045786, nombre: '50K', icono: 'target', meta: 50000, aportacionExtra: 700, tasa: 7 }
  ]
}