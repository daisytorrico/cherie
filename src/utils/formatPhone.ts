export function normalizarTelefono(telefono: string): string {
  if (!telefono) return '';
  // Elimina todos los caracteres que no sean dígitos
  let digits = telefono.replace(/\D/g, '');

  // Si empieza con 549 y tiene 13 dígitos, sacar el 549 (código Arg)
  if (digits.startsWith('549') && digits.length === 13) {
    digits = digits.slice(3);
  }
  // Si empieza con 54 y tiene 12 dígitos, sacar el 54
  else if (digits.startsWith('54') && digits.length === 12) {
    digits = digits.slice(2);
  }

  return digits;
}
