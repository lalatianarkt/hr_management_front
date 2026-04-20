import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import { SidebarProvider, useSidebar } from "./components/SidebarContext";
import LoginPage from "./pages/Authentification/Login";
import RouterRH from "./pages/router/RH";
import RouterInscription from "./pages/router/inscription";
import RouterManager from "./pages/router/Manager";
import RouterIT from "./pages/router/IT";
import RouterEmploye from "./pages/router/employe";
import SelectRolePage from "./pages/Authentification/SelectRolePage";

// CSS
import "bootstrap/dist/css/bootstrap.min.css";
import "admin-lte/dist/css/adminlte.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./index.css";
import "./App.css";
import "./assets/css/modale.css";
import "./assets/css/StatEmp.css";
import "./assets/css/ValidationRH.css";
import "./assets/css/DemandeAbsence.css";
import "./assets/css/DashboardRH.css";
import "./assets/css/no-hover.css";
import './assets/css/RubriquePaie.css';
import './assets/css/Notifications.css';
import "./assets/css/ManagerDashboard.css";
import "./assets/css/RubriquePaie.css";

function App() {
  return (
    <SidebarProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/select-role" element={<SelectRolePage />} />
          <Route path="/dashboard-RH/*" element={<RouterRH />} />
          <Route path="/inscription/*" element={<RouterInscription />} />
          <Route path="/dashboard-Manager/*" element={<RouterManager />} />
          <Route path="/dashboard-IT/*" element={<RouterIT />} />
          <Route path="/emp/*" element={<RouterEmploye />} />
        </Routes>
      </BrowserRouter>
    </SidebarProvider>
  );
}

export default App;
