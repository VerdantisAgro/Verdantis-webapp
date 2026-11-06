import * as React from "react"

interface FormFieldProps {
  label: string
  htmlFor?: string
  helperText?: string
  children: React.ReactNode
}

export function FormField({ label, htmlFor, helperText, children }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
      {helperText && <p className="text-xs text-muted-foreground">{helperText}</p>}
    </div>
  )
}
