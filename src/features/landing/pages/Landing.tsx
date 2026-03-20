import { useNavigate } from "react-router-dom";
import RotatingText from "../../../shared/components/ui/RotatingText";
import { Button } from "../../../shared/components/ui/Button";
import Grainient from "../../../shared/components/ui/Grainient";

export const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      {/* Background Layer */}
      <div className="landing-background">
        <Grainient
          color1="#1760cf"
          color2="#1e293b"
          color3="#0f172a"
          timeSpeed={0.15}
          colorBalance={0}
          warpStrength={1}
          warpFrequency={5}
          warpSpeed={1}
          warpAmplitude={50}
          blendAngle={0}
          blendSoftness={0.05}
          rotationAmount={500}
          noiseScale={2}
          grainAmount={0.05}
          grainScale={2}
          grainAnimated={false}
          contrast={1.2}
          gamma={1}
          saturation={1}
          centerX={0}
          centerY={0}
          zoom={0.9}
        />
      </div>

      <nav className="landing-nav glass">
        <div className="logo">Buses Manizales</div>
        <Button label="Acceder" onClick={() => navigate("/login")} className="btn-primary btn-sm" />
      </nav>

      <main className="landing-hero">
        <div className="hero-content fade-in">
          <h1>
            La forma más fácil de <br />
            <span className="hero-rotating-text">
              <RotatingText
                texts={['Viajar', 'Trabajar', 'Gestionar', 'Organizar', 'Crecer']}
                mainClassName="rotating-text-segment"
                staggerFrom={"last"}
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: "-120%", opacity: 0 }}
                staggerDuration={0.025}
                transition={{ type: "spring", damping: 30, stiffness: 400 }}
                rotationInterval={2000}
              />
            </span>
          </h1>
          <p className="hero-subtitle">
            Plataforma integral para la gestión Inteligente de flotas y transporte. 
            Control total en tiempo real, desde cualquier lugar.
          </p>
          <div className="hero-actions">
            <Button label="Comenzar Ahora" onClick={() => navigate("/dashboard")} className="btn-primary btn-lg" />
            <Button label="Saber Más" onClick={() => {}} className="btn-ghost btn-lg" />
          </div>
        </div>
      </main>

      <section className="features-preview">
        <div className="feature-card glass">
          <h3>Rutas Inteligentes</h3>
          <p>Optimización algoritma de trayectos para ahorro de combustible.</p>
        </div>
        <div className="feature-card glass">
          <h3>Gestión de Flota</h3>
          <p>Mantenimiento preventivo y monitoreo de estado de unidades.</p>
        </div>
        <div className="feature-card glass">
          <h3>Pasajeros Felices</h3>
          <p>App dedicada para usuarios con seguimiento en vivo del bus.</p>
        </div>
      </section>
    </div>
  );
};

export default Landing;
