export function buildYearOptions(startYear = 2000) {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: currentYear - startYear + 2 }, (_, index) => String(startYear + index)).reverse();
}
