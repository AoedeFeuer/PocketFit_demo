export const fmtDate = (d) => d.toISOString().slice(0, 10);
export const todayStr = () => fmtDate(new Date());
export const startOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1);
export const endOfMonth   = (date) => new Date(date.getFullYear(), date.getMonth()+1, 0);
export const addMonths    = (date, n) => new Date(date.getFullYear(), date.getMonth()+n, 1);
export const addDays      = (date, n) => { const dd = new Date(date); dd.setDate(dd.getDate()+n); return dd; };
export const getMonthCells = (base) => {
  const s = startOfMonth(base), e = endOfMonth(base), cells = [];
  for (let i=0;i<s.getDay();i++) cells.push(null);
  for (let d=1; d<=e.getDate(); d++) cells.push(new Date(base.getFullYear(), base.getMonth(), d));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
};
export const clamp = (n, min=0, max=100) => Math.max(min, Math.min(max, n));
