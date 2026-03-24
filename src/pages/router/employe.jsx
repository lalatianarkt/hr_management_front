import React from "react";
import { Routes, Route } from "react-router-dom";
import DemandeConge from "../Employe/Demandes/demande_conge";
import DemandeAbsence from "../Employe/Demandes/demande_absence";
import AbsenceListPage from "../Employe/Demandes/ListeAbsence";
import HeaderEmploye from "../Employe/Header/HeaderEmploye";
import Pointage from "../Employe/presence/pointage";
import EmployeeInfosPro from "../Employe/informations_personnelles/fiche-personnel";

const RouterEmploye = () => {
    return (
        <Routes>
            <Route path="" element={<HeaderEmploye />}>
                <Route path="conge/demande" element={<DemandeConge />} />
                <Route path="absence/demande" element={<DemandeAbsence />} />
                <Route path="absence/liste/demande" element={<AbsenceListPage /> } />
                <Route path="presence/pointage" element={<Pointage />} />
                <Route path="infos/fiche-perso" element={<EmployeeInfosPro />} />
            </Route>
        </Routes>
    );
}

export default RouterEmploye;
