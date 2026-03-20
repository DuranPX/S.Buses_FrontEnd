// import { loginWithOAuth } from "../services/auth.service";
import googleLogo from "../../../assets/images/google_provider.png";
import azureLogo from "../../../assets/images/azure provider.png";
import githubLogo from "../../../assets/images/github_provider.png";

export const OAuthButtons = () => {
  
  const handleOAuth = async (provider: string) => {
    console.log(`Iniciando flujo OAuth con: ${provider}`);
    // Aquí iría la lógica de redirección al proveedor
    // loginWithOAuth(provider, "token");
  };

  return (
    <div className="btn-oauth-grid">
      <button 
        type="button"
        className="btn-oauth-reactive" 
        onClick={() => handleOAuth('google')}
        title="Continuar con Google"
      >
        <img src={googleLogo} alt="Google" />
      </button>

      <button 
        type="button"
        className="btn-oauth-reactive" 
        onClick={() => handleOAuth('microsoft')}
        title="Continuar con Microsoft Azure"
      >
        <img src={azureLogo} alt="Azure" />
      </button>

      <button 
        type="button"
        className="btn-oauth-reactive" 
        onClick={() => handleOAuth('github')}
        title="Continuar con GitHub"
      >
        <img src={githubLogo} alt="GitHub" />
      </button>
    </div>
  );
};
