export const formatCurrency = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })

export const formatDate = (value: string | Date) => {
  const date = typeof value === "string" ? new Date(value) : value
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString("pt-BR")
}

const MONTHS = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"]

// "2026-03" -> "mar/26"
export const formatMonth = (yearMonth: string) => {
  const [year, month] = yearMonth.split("-")
  const label = MONTHS[Number(month) - 1]
  return label && year ? `${label}/${year.slice(2)}` : yearMonth
}
