import type { ReactNode } from "react"

interface FormCardProps {
  title: string
  children: ReactNode
}

export const FormCard = ({ title, children }: FormCardProps) => {
  return (
    <div className="form-card glass">
      <h2>{title}</h2>
      <div className="form-card-content">
        {children}
      </div>
    </div>
  )
}

export default FormCard
