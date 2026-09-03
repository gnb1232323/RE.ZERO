export function formatMoney(amount: number | string) {
  const n = typeof amount === "string" ? Number(amount) : amount;
  return `${n.toLocaleString("ru-RU")} ₸`;
}
