/** Store money as integer paise. API may accept rupees and convert. */

export function rupeesToPaise(rupees) {
  if (rupees === null || rupees === undefined || rupees === '') return null;
  const n = Number(rupees);
  if (Number.isNaN(n)) throw new Error('Invalid money amount');
  return Math.round(n * 100);
}

export function paiseToRupees(paise) {
  if (paise === null || paise === undefined) return null;
  return Number(paise) / 100;
}

export function formatInrFromPaise(paise) {
  const rupees = paiseToRupees(paise);
  if (rupees === null) return null;
  return rupees.toFixed(2);
}
