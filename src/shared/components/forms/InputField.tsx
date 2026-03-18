import type { InputHTMLAttributes } from "react"

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: string
}

export const InputField = ({ label, ...props }: Props) => {
  return (
    <div className="input-group">
      <label>{label}</label>
      <input {...props} />
    </div>
  )
}

export default InputField
