export const NOMBRES_MES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Setiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

/**
 * Convierte una fecha a YYYY-MM-DD usando la zona horaria local.
 * No se usa toISOString() porque en Lima (UTC-5) devolveria el dia siguiente.
 */
export function aClave(fecha: Date): string {
  const mes = `${fecha.getMonth() + 1}`.padStart(2, '0');
  const dia = `${fecha.getDate()}`.padStart(2, '0');
  return `${fecha.getFullYear()}-${mes}-${dia}`;
}

/** Clave YYYY-MM-DD del dia de hoy. */
export function claveHoy(): string {
  return aClave(new Date());
}

/** Convierte "2026-09-20" en "20 de setiembre de 2026". */
export function fechaLegible(clave: string): string {
  const [anio, mes, dia] = clave.split('-').map(Number);
  return `${dia} de ${NOMBRES_MES[mes - 1].toLowerCase()} de ${anio}`;
}

/** Convierte "10:30" en "10:30 AM". */
export function enAmPm(hora: string): string {
  const [horas, minutos] = hora.split(':').map(Number);
  const sufijo = horas < 12 ? 'AM' : 'PM';
  const doce = horas % 12 === 0 ? 12 : horas % 12;
  return `${doce}:${`${minutos}`.padStart(2, '0')} ${sufijo}`;
}
