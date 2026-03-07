import type { ReactNode } from "react"

interface FormCardProps {
  title: string
  children: ReactNode
}

export const FormCard = ({ title, children }: FormCardProps) => {
  return (
    <div className="form-card">
      <h2>{title}</h2>
      {children}
    </div>
  )
}