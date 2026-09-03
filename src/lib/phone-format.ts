export function formatPhoneInput(value: string): string {
  let digits = value.replace(/\D/g, "");
  if (digits.length === 11 && (digits[0] === "7" || digits[0] === "8")) {
    digits = digits.slice(1);
  }
  digits = digits.slice(0, 10);

  let out = "+7";
  if (digits.length > 0) out += " " + digits.slice(0, 3);
  if (digits.length > 3) out += " " + digits.slice(3, 6);
  if (digits.length > 6) out += " " + digits.slice(6, 8);
  if (digits.length > 8) out += " " + digits.slice(8, 10);
  return out;
}
