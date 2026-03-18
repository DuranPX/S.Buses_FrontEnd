import type { ButtonHTMLAttributes } from "react"

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string
}

export const Button = ({ label, ...props }: Props) => {
  return (
    <button className="btn-primary" {...props}>
      {label}
    </button>
  )
}

export default Button
