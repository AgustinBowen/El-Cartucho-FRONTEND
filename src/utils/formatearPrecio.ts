export function formatearPrecio(precio: number | string): string {
  if (!precio) return '$0,00';
  
  const numeroLimpio = typeof precio === 'string' ? parseFloat(precio) : precio;
  
  if (isNaN(numeroLimpio)) return '$0,00';
  
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2  
  }).format(numeroLimpio);
}