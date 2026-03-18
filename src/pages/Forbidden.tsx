import { useNavigate } from "react-router-dom"

export const Forbidden = () => {
  const navigate = useNavigate()

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1 style={{ fontSize: "80px", margin: "0" }}>403</h1>
      <h2>Acceso denegado</h2>
      <p>No tienes permiso para ver esta página.</p>
      <button onClick={() => navigate("/dashboard")}>
        Volver al inicio
      </button>
    </div>
  )
}

export default Forbidden