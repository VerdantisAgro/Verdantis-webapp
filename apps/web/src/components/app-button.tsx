import * as React from "react"

import { Button } from "@/src/components/ui/button"

type ButtonVariant = "primary" | "secondary" | "tertiary"
type ButtonSize = "sm" | "md" | "lg"

export interface AppButtonProps {
  variant: ButtonVariant
  size: ButtonSize
  children: React.ReactNode
  onClick?: () => void
  type?: "button" | "submit" | "reset"
  disabled?: boolean
  className?: string
}

type BaseButtonProps = React.ComponentProps<typeof Button>

const variantMap: Record<ButtonVariant, NonNullable<BaseButtonProps["variant"]>> = {
  primary: "default",
  secondary: "outline",
  tertiary: "ghost",
}

const sizeMap: Record<ButtonSize, NonNullable<BaseButtonProps["size"]>> = {
  sm: "sm",
  md: "default",
  lg: "lg",
}

export function AppButton({
  variant,
  size,
  children,
  onClick,
  type = "button",
  disabled,
  className,
}: AppButtonProps) {
  return (
    <Button
      type={type}
      variant={variantMap[variant]}
      size={sizeMap[size]}
      onClick={onClick}
      disabled={disabled}
      className={className}
    >
      {children}
    </Button>
  )
}
