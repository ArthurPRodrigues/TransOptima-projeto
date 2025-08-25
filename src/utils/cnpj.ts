export function onlyDigits(cnpj: string) {
  return (cnpj || "").replace(/\D+/g, "");
}
