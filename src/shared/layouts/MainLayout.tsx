import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { useAuth } from "../../features/auth/hooks/useAuth";
import { RoleSelector } from "../../features/auth/components/RoleSelector";
import { ProfileCompletionGuard } from "../../features/auth/components/ProfileCompletionGuard";
import { Loader } from "../components/ui/Loader";

export const MainLayout = () => {
  const { activeRole, isLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (isLoading) return <Loader />;

  if (!activeRole) {
    return <RoleSelector />;
  }

  const toggleSidebar = () => setSidebarOpen(prev => !prev);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <>
      {/* Modal overlay: completar perfil OAuth si phone/address vacíos */}
      <ProfileCompletionGuard />

      <div className="admin-layout">
        <div
          className={`sidebar-overlay ${sidebarOpen ? 'visible' : ''}`}
          onClick={closeSidebar}
        />
        <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
        <div className="main-content">
          <Navbar onToggleSidebar={toggleSidebar} />
          <main className="page-container fade-in">
            <Outlet />
          </main>
          <Footer />
        </div>
      </div>
    </>
  );
};

export default MainLayout;
