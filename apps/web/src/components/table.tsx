import * as React from "react"

import { cn } from "@/src/lib/utils"

interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {}
interface TableSectionProps extends React.HTMLAttributes<HTMLTableSectionElement> {}
interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {}
interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {}
interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {}

export function Table({ className, ...props }: TableProps) {
  return (
    <table className={cn("w-full text-sm", className)} {...props} />
  )
}

export function TableHeader({ className, ...props }: TableSectionProps) {
  return (
    <thead className={cn("bg-muted/50", className)} {...props} />
  )
}

export function TableBody({ className, ...props }: TableSectionProps) {
  return (
    <tbody className={className} {...props} />
  )
}

export function TableRow({ className, ...props }: TableRowProps) {
  return (
    <tr
      className={cn(
        "border-b border-border/50 last:border-0 hover:bg-muted/40 transition-colors",
        className,
      )}
      {...props}
    />
  )
}

export function TableHead({ className, ...props }: TableHeadProps) {
  return (
    <th
      className={cn(
        "h-12 px-4 text-left align-middle font-medium text-muted-foreground",
        className,
      )}
      {...props}
    />
  )
}

export function TableCell({ className, ...props }: TableCellProps) {
  return (
    <td className={cn("h-12 px-4 align-middle", className)} {...props} />
  )
}
