import { lazy, Suspense } from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"

import Login from "../features/auth/pages/Login"
import Dashboard from "../features/dashboard/pages/Dashboard"
import AdminRoles from "../features/roles/pages/AdminRoles"
import Landing from "../features/landing/pages/Landing"
import MainLayout from "../shared/layouts/MainLayout"
import { ProtectedRoute } from "./ProtectedRoute"
import { PrivateRoute } from "../routes/PrivateRoute"
import { PublicOnlyRoute } from "../routes/PublicOnlyRoute"
import { MODULES } from "../shared/config/modules"
import { GenericModulePlaceholder } from "../shared/components/layouts/GenericModulePlaceholder"
import AdminUsers from "../features/users/pages/AdminUsers"
import VerifyCode from "../features/auth/pages/VerifyCode"
import ForgotPassword from "../features/auth/pages/ForgotPassword"
import ResetPassword from "../features/auth/pages/ResetPassword"
import { AuthFlowGuard } from "../features/auth/components/AuthFlowGuard"
import AuthSuccess from "../features/auth/pages/AuthSuccess"
import CompleteProfile from "../features/auth/pages/CompleteProfile"
import ProfilePage from "../features/profile/pages/ProfilePage"
import { Loader } from "../shared/components/ui/Loader"
import AdminIncidentsPage from "../modules/incidents/pages/AdminIncidentsPage"

// ================================================================
// LAZY IMPORTS — Módulos de Negocio (Fase 2-6)
// Se cargan solo cuando el usuario navega a esa ruta.
// ================================================================

// --- Rutas (HU-001) ---
const RoutesPage = lazy(() => import("../modules/routes/pages/RoutesPage"))
const RouteDetailPage = lazy(() => import("../modules/routes/pages/RouteDetailPage"))

// --- Paraderos (HU-002) ---
const StopsPage = lazy(() => import("../modules/stops/pages/StopsPage"))
const NearbyStopsPage = lazy(() => import("../modules/stops/pages/NearbyStopsPage"))

// --- Boletos (HU-003) ---
const TicketsPage = lazy(() => import("../modules/tickets/pages/TicketsPage"))
const AbordajePage = lazy(() => import("../modules/tickets/pages/AbordajePage"))
const TicketSuccessPage = lazy(() => import("../modules/tickets/pages/TicketSuccessPage"))

// --- Viajes (HU-004 + HU-005) ---
const FinishTripPage = lazy(() => import("../modules/trips/pages/FinishTripPage"))
const TripCompletedPage = lazy(() => import("../modules/trips/pages/TripCompletedPage"))
const TripHistoryPage = lazy(() => import("../modules/trips/pages/TripHistoryPage"))
const TripDetailPage = lazy(() => import("../modules/trips/pages/TripDetailPage"))

// --- Conductores / Turnos (HU-006) ---
const TurnoActualPage = lazy(() => import("../modules/drivers/pages/TurnoActualPage"))

// --- Incidentes (HU-007 + HU-008) ---
const CreateIncidentPage = lazy(() => import("../modules/incidents/pages/CreateIncidentPage"))
const IncidentsMonitorPage = lazy(() => import("../modules/incidents/pages/IncidentsMonitorPage"))
const IncidentsHistoryPage = lazy(() => import("../modules/incidents/pages/IncidentsHistoryPage"))
const IncidentsByBusPage = lazy(() => import("../modules/incidents/pages/IncidentsByBusPage"))

// --- Admin: Rutas (HU-009) ---
const AdminRoutesPage = lazy(() => import("../modules/admin/routes/pages/AdminRoutesPage"))
const CreateRoutePage = lazy(() => import("../modules/admin/routes/pages/CreateRoutePage"))

// --- Admin: Conductores ---
const AdminDriversPage = lazy(() => import("../modules/admin/drivers/pages/AdminDriversPage"))

// --- Admin: Turnos ---
const AdminTurnosPage = lazy(() => import("../modules/admin/turnos/pages/AdminTurnosPage"))
const CreateTurnoPage = lazy(() => import("../modules/admin/turnos/pages/CreateTurnoPage"))

// --- Admin: Paraderos (HU-010) ---
const AdminStopsPage = lazy(() => import("../modules/admin/stops/pages/AdminStopsPage"))
const CreateStopPage = lazy(() => import("../modules/admin/stops/pages/CreateStopPage"))

// --- Admin: Programaciones (HU-011) ---
const SchedulesPage = lazy(() => import("../modules/admin/schedules/pages/SchedulesPage"))
const CreateSchedulePage = lazy(() => import("../modules/admin/schedules/pages/CreateSchedulePage"))
const SchedulesPublicPage = lazy(() => import("../modules/schedules/pages/SchedulesPublicPage"))

// --- Admin: Buses (HU-012) ---
const BusesPage = lazy(() => import("../modules/admin/buses/pages/BusesPage"))
const CreateBusPage = lazy(() => import("../modules/admin/buses/pages/CreateBusPage"))

// --- Admin: Empresas ---
const EmpresasPage = lazy(() => import("../modules/admin/empresas/pages/EmpresasPage"))
const CreateEmpresaPage = lazy(() => import("../modules/admin/empresas/pages/CreateEmpresaPage"))

// --- Cartera (HU-013) ---
const RechargePage = lazy(() => import("../modules/wallet/pages/RechargePage"))
const PaymentPage = lazy(() => import("../modules/wallet/pages/PaymentPage"))
const EpaycoResponsePage = lazy(() => import("../modules/admin/pagos/pages/EpaycoResponsePage"))

// --- Analíticas (HU-014/015/016) ---
const IncomeAnalyticsPage = lazy(() => import("../modules/analytics/pages/IncomeAnalyticsPage"))
const AgeAnalyticsPage = lazy(() => import("../modules/analytics/pages/AgeAnalyticsPage"))
const IncidentAnalyticsPage = lazy(() => import("../modules/analytics/pages/IncidentAnalyticsPage"))

// --- Social: Grupos (HU-ENTR-3-006/009/010/011) ---
const GruposPage = lazy(() => import("../modules/social/pages/GruposPage"))
const GrupoDetailPage = lazy(() => import("../modules/social/pages/GrupoDetailPage"))

// --- Alertas Masivas (HU-ENTR-3-007) ---
const AlertasMasivasPage = lazy(() => import("../modules/admin/alertas/pages/AlertasMasivasPage"))
// --- Atención al Usuario ---
const PQRSPage            = lazy(() => import("../modules/pqrs/pages/PQRSPage"))
const PqrsManagementPage  = lazy(() => import("../modules/pqrs/pages/PqrsManagementPage"))
const AsesoriasPage       = lazy(() => import("../modules/asesorias/pages/AsesoriasPage"))

// --- Messages ---
const MessagesPage = lazy(
  () => import("../modules/messages/pages/MessagesPage")
);

// ================================================================

const SuspenseWrapper = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}><Loader /></div>}>
    {children}
  </Suspense>
)

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />

        <Route path="/auth/success" element={<AuthSuccess />} />
        <Route path="/auth/complete-profile" element={<CompleteProfile />} />

        <Route path="/login" element={
          <PublicOnlyRoute><Login /></PublicOnlyRoute>
        } />

        <Route path="/forgot-password" element={
          <PublicOnlyRoute><ForgotPassword /></PublicOnlyRoute>
        } />

        <Route path="/reset-password" element={
          <PublicOnlyRoute>
            <AuthFlowGuard><ResetPassword /></AuthFlowGuard>
          </PublicOnlyRoute>
        } />

        <Route path="/verify-code" element={
          <PublicOnlyRoute>
            <AuthFlowGuard><VerifyCode /></AuthFlowGuard>
          </PublicOnlyRoute>
        } />

        {/* ===== RUTAS PROTEGIDAS (dentro de MainLayout) ===== */}
        <Route element={
          <PrivateRoute><MainLayout /></PrivateRoute>
        }>
          {/* Dashboard y Perfil */}
          <Route path="/dashboard" element={
            <ProtectedRoute><Dashboard /></ProtectedRoute>
          } />

          <Route path="/perfil" element={
            <ProtectedRoute><ProfilePage /></ProtectedRoute>
          } />

          {/* ---- Administración ---- */}
          <Route path="/admin/roles" element={
            <ProtectedRoute permission={{ module: MODULES.ROLES, action: 'leer' }}>
              <AdminRoles />
            </ProtectedRoute>
          } />

          <Route path="/admin/usuarios" element={
            <ProtectedRoute permission={{ module: MODULES.USUARIOS, action: 'leer' }}>
              <AdminUsers />
            </ProtectedRoute>
          } />

          {/* ---- Admin: Rutas (HU-009) — ANTES de la ruta pública /rutas ---- */}
          <Route path="/admin/rutas" element={
            <ProtectedRoute permission={{ module: MODULES.RUTAS, action: 'leer' }}>
              <SuspenseWrapper><AdminRoutesPage /></SuspenseWrapper>
            </ProtectedRoute>
          } />

          <Route path="/admin/rutas/crear" element={
            <ProtectedRoute permission={{ module: MODULES.RUTAS, action: 'escribir' }}>
              <SuspenseWrapper><CreateRoutePage /></SuspenseWrapper>
            </ProtectedRoute>
          } />

          {/* ---- Admin: Conductores ---- */}
          <Route path="/admin/conductores" element={
            <ProtectedRoute permission={{ module: MODULES.CONDUCTORES, action: 'leer' }}>
              <SuspenseWrapper><AdminDriversPage /></SuspenseWrapper>
            </ProtectedRoute>
          } />

          {/* ---- Admin: Turnos (HU-006) ---- */}
          <Route path="/admin/turnos" element={
            <ProtectedRoute permission={{ module: MODULES.TURNOS, action: 'leer' }}>
              <SuspenseWrapper><AdminTurnosPage /></SuspenseWrapper>
            </ProtectedRoute>
          } />

          <Route path="/admin/turnos/crear" element={
            <ProtectedRoute permission={{ module: MODULES.TURNOS, action: 'escribir' }}>
              <SuspenseWrapper><CreateTurnoPage /></SuspenseWrapper>
            </ProtectedRoute>
          } />

          {/* ---- Admin: Paraderos (HU-010) ---- */}
          <Route path="/admin/paraderos" element={
            <ProtectedRoute permission={{ module: MODULES.PARADEROS, action: 'leer' }}>
              <SuspenseWrapper><AdminStopsPage /></SuspenseWrapper>
            </ProtectedRoute>
          } />

          <Route path="/admin/paraderos/crear" element={
            <ProtectedRoute permission={{ module: MODULES.PARADEROS, action: 'escribir' }}>
              <SuspenseWrapper><CreateStopPage /></SuspenseWrapper>
            </ProtectedRoute>
          } />

          {/* ---- Admin: Buses (HU-012) ---- */}
          <Route path="/admin/buses" element={
            <ProtectedRoute permission={{ module: MODULES.BUSES, action: 'leer' }}>
              <SuspenseWrapper><BusesPage /></SuspenseWrapper>
            </ProtectedRoute>
          } />

          <Route path="/admin/buses/crear" element={
            <ProtectedRoute permission={{ module: MODULES.BUSES, action: 'escribir' }}>
              <SuspenseWrapper><CreateBusPage /></SuspenseWrapper>
            </ProtectedRoute>
          } />

          {/* ---- Admin: Programaciones (HU-011) ---- */}
          <Route path="/admin/programaciones" element={
            <ProtectedRoute permission={{ module: MODULES.PROGRAMACIONES, action: 'leer' }}>
              <SuspenseWrapper><SchedulesPage /></SuspenseWrapper>
            </ProtectedRoute>
          } />

          <Route path="/admin/programaciones/crear" element={
            <ProtectedRoute permission={{ module: MODULES.PROGRAMACIONES, action: 'escribir' }}>
              <SuspenseWrapper><CreateSchedulePage /></SuspenseWrapper>
            </ProtectedRoute>
          } />

          {/* ---- Admin: Incidentes (HU-008) ---- */}
          <Route path="/admin/incidentes" element={
            <ProtectedRoute permission={{ module: MODULES.INCIDENTES, action: 'leer' }}>
              <SuspenseWrapper><IncidentsMonitorPage /></SuspenseWrapper>
            </ProtectedRoute>
          } />

          <Route path="/admin/supervisor" element={
            <ProtectedRoute permission={{ module: MODULES.INCIDENTES_MONITOR, action: 'leer' }}>
              <SuspenseWrapper><AdminIncidentsPage /></SuspenseWrapper>
            </ProtectedRoute>
          } />

          

          {/* ---- Admin: Empresas ---- */}
          <Route path="/admin/empresas" element={
            <ProtectedRoute permission={{ module: MODULES.EMPRESAS, action: 'leer' }}>
              <SuspenseWrapper><EmpresasPage /></SuspenseWrapper>
            </ProtectedRoute>
          } />

          <Route path="/admin/empresas/crear" element={
            <ProtectedRoute permission={{ module: MODULES.EMPRESAS, action: 'escribir' }}>
              <SuspenseWrapper><CreateEmpresaPage /></SuspenseWrapper>
            </ProtectedRoute>
          } />

          {/* Incidentes por bus */}
          <Route path="/admin/buses/incidencias/:id" element={
            <ProtectedRoute permission={{ module: MODULES.INCIDENTES, action: 'leer' }}>
              <SuspenseWrapper><IncidentsByBusPage /></SuspenseWrapper>
            </ProtectedRoute>
          } />

          {/* ---- Placeholders admin sin implementación aún ---- */}
          {[MODULES.CLIENTES].map(modulo => (
            <Route key={`admin-${modulo}`} path={`/admin/${modulo}`} element={
              <ProtectedRoute permission={{ module: modulo, action: 'leer' }}>
                <GenericModulePlaceholder moduleName={modulo} />
              </ProtectedRoute>
            } />
          ))}

          {/* ---- Rutas ciudadano (HU-001) ---- */}
          <Route path="/rutas" element={
            <ProtectedRoute permission={{ module: MODULES.RUTAS, action: 'leer' }}>
              <SuspenseWrapper><RoutesPage /></SuspenseWrapper>
            </ProtectedRoute>
          } />

          <Route path="/rutas/:id" element={
            <ProtectedRoute permission={{ module: MODULES.RUTAS, action: 'leer' }}>
              <SuspenseWrapper><RouteDetailPage /></SuspenseWrapper>
            </ProtectedRoute>
          } />

          {/* ---- Paraderos cercanos (HU-002) ---- */}
          <Route path="/paradero" element={
            <ProtectedRoute permission={{ module: MODULES.PARADEROS, action: 'leer' }}>
              <SuspenseWrapper><StopsPage /></SuspenseWrapper>
            </ProtectedRoute>
          } />

          <Route path="/paradero/actual" element={
            <ProtectedRoute permission={{ module: MODULES.PARADEROS, action: 'leer' }}>
              <SuspenseWrapper><NearbyStopsPage /></SuspenseWrapper>
            </ProtectedRoute>
          } />

          {/* ---- Horarios públicos (HU-011) ---- */}
          <Route path="/programaciones" element={
            <ProtectedRoute permission={{ module: MODULES.PROGRAMACIONES, action: 'leer' }}>
              <SuspenseWrapper><SchedulesPublicPage /></SuspenseWrapper>
            </ProtectedRoute>
          } />

          {/* ---- Boletos (HU-003) ---- */}
          <Route path="/boletos" element={
            <ProtectedRoute permission={{ module: MODULES.BOLETOS, action: 'leer' }}>
              <SuspenseWrapper><TicketsPage /></SuspenseWrapper>
            </ProtectedRoute>
          } />

          <Route path="/abordaje" element={
            <ProtectedRoute permission={{ module: MODULES.BOLETOS, action: 'leer' }}>
              <SuspenseWrapper><AbordajePage /></SuspenseWrapper>
            </ProtectedRoute>
          } />

          <Route path="/boletos/exito" element={
            <ProtectedRoute permission={{ module: MODULES.BOLETOS, action: 'leer' }}>
              <SuspenseWrapper><TicketSuccessPage /></SuspenseWrapper>
            </ProtectedRoute>
          } />

          {/* ---- Finalizar viaje (HU-004) ---- */}
          <Route path="/viaje/finalizar" element={
            <ProtectedRoute permission={{ module: MODULES.VIAJES, action: 'leer' }}>
              <SuspenseWrapper><FinishTripPage /></SuspenseWrapper>
            </ProtectedRoute>
          } />

          <Route path="/viaje/completado" element={
            <ProtectedRoute permission={{ module: MODULES.VIAJES, action: 'leer' }}>
              <SuspenseWrapper><TripCompletedPage /></SuspenseWrapper>
            </ProtectedRoute>
          } />

          {/* ---- Historial de viajes (HU-005) ---- */}
          <Route path="/viajes/historial" element={
            <ProtectedRoute permission={{ module: MODULES.VIAJES, action: 'leer' }}>
              <SuspenseWrapper><TripHistoryPage /></SuspenseWrapper>
            </ProtectedRoute>
          } />

          <Route path="/viajes/:id" element={
            <ProtectedRoute permission={{ module: MODULES.VIAJES, action: 'leer' }}>
              <SuspenseWrapper><TripDetailPage /></SuspenseWrapper>
            </ProtectedRoute>
          } />

          {/* ---- Conductor: Turno (HU-006) ---- */}
          <Route path="/conductor/turno" element={
            <ProtectedRoute permission={{ module: MODULES.TURNO_CONDUCTOR, action: 'leer' }}>
              <SuspenseWrapper><TurnoActualPage /></SuspenseWrapper>
            </ProtectedRoute>
          } />

          {/* ---- Reportar Incidente (HU-007) ---- */}
          <Route path="/incidentes/crear" element={
            <ProtectedRoute permission={{ module: MODULES.INCIDENTES, action: 'escribir' }}>
              <SuspenseWrapper><CreateIncidentPage /></SuspenseWrapper>
            </ProtectedRoute>
          } />

          <Route path="/incidentes/historial" element={
            <ProtectedRoute permission={{ module: MODULES.INCIDENTES, action: 'leer' }}>
              <SuspenseWrapper><IncidentsHistoryPage /></SuspenseWrapper>
            </ProtectedRoute>
          } />

          {/* ---- Cartera (HU-013) ---- */}
          <Route path="/cartera/recarga" element={
            <ProtectedRoute permission={{ module: MODULES.CARTERA, action: 'leer' }}>
              <SuspenseWrapper><RechargePage /></SuspenseWrapper>
            </ProtectedRoute>
          } />

          <Route path="/cartera/pago" element={
            <ProtectedRoute permission={{ module: MODULES.CARTERA, action: 'leer' }}>
              <SuspenseWrapper><PaymentPage /></SuspenseWrapper>
            </ProtectedRoute>
          } />

          <Route path="/admin/pagos/respuesta" element={
            <ProtectedRoute permission={{ module: MODULES.CARTERA, action: 'leer' }}>
              <SuspenseWrapper><EpaycoResponsePage /></SuspenseWrapper>
            </ProtectedRoute>
          } />

          {/* ---- Analíticas (HU-014/015/016) ---- */}
          <Route path="/analiticas/ingresos" element={
            <ProtectedRoute permission={{ module: MODULES.ANALITICAS, action: 'leer' }}>
              <SuspenseWrapper><IncomeAnalyticsPage /></SuspenseWrapper>
            </ProtectedRoute>
          } />

          <Route path="/analiticas/rango-etario" element={
            <ProtectedRoute permission={{ module: MODULES.ANALITICAS, action: 'leer' }}>
              <SuspenseWrapper><AgeAnalyticsPage /></SuspenseWrapper>
            </ProtectedRoute>
          } />

          <Route path="/analiticas/incidentes" element={
            <ProtectedRoute permission={{ module: MODULES.ANALITICAS, action: 'leer' }}>
              <SuspenseWrapper><IncidentAnalyticsPage /></SuspenseWrapper>
            </ProtectedRoute>
          } />

          <Route path="/pqrs" element={
            <ProtectedRoute permission={{ module: MODULES.PQRS, action: 'leer' }}>
              <SuspenseWrapper><PQRSPage /></SuspenseWrapper>
            </ProtectedRoute>
          } />

          <Route path="/admin/pqrs" element={
            <ProtectedRoute permission={{ module: MODULES.PQRS, action: 'leer' }}>
              <SuspenseWrapper><PqrsManagementPage /></SuspenseWrapper>
            </ProtectedRoute>
          } />

          <Route path="/asesorias" element={
            <ProtectedRoute permission={{ module: MODULES.ASESORIAS, action: 'leer' }}>
              <SuspenseWrapper><AsesoriasPage /></SuspenseWrapper>
            </ProtectedRoute>
          } />
          <Route
            path="/mensajes"
            element={
              <ProtectedRoute
                permission={{
                  module: MODULES.MENSAJES,
                  action: 'leer'
                }}
              >
                <SuspenseWrapper>
                  <MessagesPage />
                </SuspenseWrapper>
              </ProtectedRoute>
            }
          />

          {/* ---- Social: Grupos (HU-ENTR-3-006/009/010/011) ---- */}
          <Route path="/grupos" element={
            <ProtectedRoute permission={{ module: MODULES.GRUPOS, action: 'leer' }}>
              <SuspenseWrapper><GruposPage /></SuspenseWrapper>
            </ProtectedRoute>
          } />

          <Route path="/grupos/:id" element={
            <ProtectedRoute permission={{ module: MODULES.GRUPOS, action: 'leer' }}>
              <SuspenseWrapper><GrupoDetailPage /></SuspenseWrapper>
            </ProtectedRoute>
          } />

          {/* ---- Mensajes ---- */}
          <Route
            path="/mensajes"
            element={
              <ProtectedRoute
                permission={{
                  module: MODULES.MENSAJES,
                  action: 'leer'
                }}
              >
                <SuspenseWrapper>
                  <MessagesPage />
                </SuspenseWrapper>
              </ProtectedRoute>
            }
          />

          {/* ---- Placeholders restantes (Social) ---- */}
          {[
            MODULES.RESENAS,
            MODULES.PAGOS,
            MODULES.VALIDACIONES,
            MODULES.RECARGAS
          ].map(modulo => (
            <Route
              key={`public-${modulo}`}
              path={`/${modulo}`}
              element={
                <ProtectedRoute permission={{ module: modulo, action: 'leer' }}>
                  <GenericModulePlaceholder moduleName={modulo} />
                </ProtectedRoute>
              }
            />
          ))}

          <Route path="/admin/alertas" element={
            <ProtectedRoute permission={{ module: MODULES.ALERTAS, action: 'escribir' }}>
              <SuspenseWrapper><AlertasMasivasPage /></SuspenseWrapper>
            </ProtectedRoute>
          } />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}