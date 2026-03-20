import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { useAuth } from "../../features/auth/hooks/useAuth";
import { RoleSelector } from "../../features/auth/components/RoleSelector";
import { Loader } from "../components/ui/Loader";

export const MainLayout = () => {
  const { activeRole, isLoading } = useAuth();

  if (isLoading) return <Loader />;

  // Gate: Asegurar que activeRole esté definido antes de renderizar cualquier contenido protegido
  if (!activeRole) {
    return <RoleSelector />;
  }

  return (
    <div className="admin-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar />
        <main className="page-container fade-in">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default MainLayout;
