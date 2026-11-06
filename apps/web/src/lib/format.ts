export const formatCurrency = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })

export const formatDate = (value: string | Date) => {
  const date = typeof value === "string" ? new Date(value) : value
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString("pt-BR")
}
