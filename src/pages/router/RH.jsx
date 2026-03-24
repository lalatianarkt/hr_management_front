import React from "react";
import { Routes, Route } from "react-router-dom";
import HeaderRH from "../RH/Employe/Header/HeaderRH";
import Employees from "../RH/Employe/FicheEmploye/Employees";
import EmployeeInfo from "../RH/Employe/FicheEmploye/EmployeeInfo";
import EmployeeDocuments from "../RH/Employe/FicheEmploye/EmployeeDocuments";
import AddEmployee from "../RH/Employe/FicheEmploye/AddEmployee";
import AssignEmployee from "../RH/Employe/Organisation_Hierarchie/AssingEmployee";
import DepartmentsManagers from "../RH/Employe/Organisation_Hierarchie/DepartmentsManagers";
import OrgChart from "../RH/Employe/Organisation_Hierarchie/OrgChart";
import CalendrierPresence from "../RH/Employe/Presence/Calendrier_presence";
import PointageManuel from "../RH/Employe/Presence/Pointage";
import HeureTravaillee from "../RH/Paie/HeureTravaillee";
import HistoriquePointage from "../RH/Employe/Presence/HistoriquePointage";
import GestionRetards from "../RH/Employe/Presence/GestionRetards";
import StatistiquesPresence from "../RH/Employe/Presence/StatistiquesPresence";
import HistoriqueMouvements from "../RH/Employe/Mouvements/HistoriqueMouvements";
import InventaireMouvements from "../RH/Employe/Mouvements/InventaireMouvements";
import ArchivesMouvements from "../RH/Employe/Mouvements/ArchivesMouvements";
import AddManager from "../RH/Employe/Organisation_Hierarchie/AddManager";
import ManagerList from "../RH/Employe/Organisation_Hierarchie/ManagerList";
import ManagerDetails from "../RH/Employe/Organisation_Hierarchie/ManagerDetails";
import Manager from "../RH/Employe/FicheEmploye/Manager";
import ValidationMouvements from "../RH/Employe/Mouvements/ValidationMouvements";
import SoldeAnnuelRH from "../RH/Employe/Conges/SoldeAnnuelRH";
import ReglesConges from "../RH/Employe/Conges/ReglesConges";
import ValidationRH from "../RH/Employe/Conges/Conges";
import DepartementsActifs from "../RH/Employe/FicheEmploye/DepartementsActifs";
import PointagePage from "../RH/Employe/FicheEmploye/Pointage";
import ReglementHoraire from "../RH/Paramétrage/ReglementHoraire";
import RubriquesPaiePage from "../RH/Paramétrage/paie/rubriques";
import PresenceDuJourPage from "../RH/Employe/FicheEmploye/PresenceDuJour";
import EditionPaie from "../RH/Paie/edition/EditionPaie";
import RubriquesList from "../RH/Paie/rubrique/RubriqueList";
import BulletinDepartementPage from "../RH/Paie/bulletin/BulletinPaie";
import BulletinDetails from "../RH/Paie/bulletin/BulletinParDep";
import BulletinEmployeDetail from "../RH/Paie/bulletin/BulletinEmployeDetails";
import PostesList from "../RH/Employe/FicheEmploye/Poste";
import ManagerInfoModal from "../RH/Employe/FicheEmploye/ManagerInfoPage";
import EmployeeDetailsTable from "../RH/Employe/FicheEmploye/EmployeeDetailsTable";
import DerniersMouvementsPage from "../RH/Employe/Conges/DerniersMouvementsPage";
import TableauBordGlobale from "../RH/Dashboard/TableauBordGlobale";
import MouvementsList from "../RH/Employe/Mouvements/MouvementsEmploye";
import CalendrierAbsences from "../RH/Employe/Conges/AbsenceConge";
import EmployesArchives from "../RH/Employe/FicheEmploye/EmployesArchives";
import DerniereInfoProfessionnelle from "../RH/Employe/FicheEmploye/DerniereInfoProfessionnelle";
import PeriodesPaie from "../RH/Paie/periode/PeriodesPaie";
import NouvelleEditionPaie from "../RH/Paie/edition/NouvelleEditionPaie";
import ParametrageGlobal from "../RH/Paramétrage/ParametrageGobal";
import ExportConfiguration from "../RH/Employe/FicheEmploye/export/ExportConfiguration";


const RouterRH = () => {
    return (
        <Routes>
            <Route path="" element={<HeaderRH />}> 
                <Route index element={<TableauBordGlobale />} />
                <Route path="employees" element={<Employees />} />
                <Route path="employees/:id/personnel" element={< EmployeeInfo />} />
                <Route path="employees/:id/documents" element={<EmployeeDocuments />} />
                <Route path="employees/add" element={<AddEmployee />} />
                <Route path="employees/:idEmploye/archived" element={<DerniereInfoProfessionnelle />} />
                <Route path="employees/pointage" element={<PointagePage />} />
                <Route path="paramétrage/horaire" element={<ReglementHoraire />} />
                <Route path="paramétrage/rubriques" element={<RubriquesPaiePage />} /> 
                <Route path="présence" element={<PresenceDuJourPage />} />
                <Route path="archives" element={<EmployesArchives />} />

                <Route path="/employees/employe/manager/:idManager" element={<ManagerInfoModal />} />
                <Route path="/manager/employe/:id" element={<EmployeeDetailsTable /> } />

                <Route path="/employees/:id/soldesConges" element={<DerniersMouvementsPage /> } />

                {/* <Route path="/" element= {<TableauBordGlobale />} /> */}
                <Route path="/employees/:id/mouvements" element= {<MouvementsList />} />
                <Route path="departements" element={<DepartementsActifs />} />
                <Route path="managers" element={<Manager />} />

                <Route path="organisation/assignEmp" element={<AssignEmployee />} />
                <Route path="organisation/addManager" element={<AddManager />}/>
                <Route path="organisation/listManager" element={<ManagerList />}/>
                <Route path="organisation/managerDetails/:id" element={<ManagerDetails />}/>
                <Route path="organisation/department" element={<DepartmentsManagers />} />
                <Route path="organisation/hierarchie" element={<OrgChart />} />
                <Route path="organisation/mouvement" element={<HistoriqueMouvements />} />
                <Route path="organisation/mouvement/validation" element={<ValidationMouvements />}/> 
                <Route path="employees/:id/absences" element={<CalendrierAbsences />} />
                <Route path="presence/calendrier" element={<CalendrierPresence />} />
                <Route path="presence/pointage" element={<PointageManuel />} />
                <Route path="presence/calendrier_presence_v1" element={<CalendrierPresence />} />
                <Route path="presence/historiquePointage" element={<HistoriquePointage />} />
                <Route path="presence/retard" element={<GestionRetards/>} />
                <Route path="presence/stat" element={<StatistiquesPresence />} />
                <Route path="mouvement/historique" element={<HistoriqueMouvements />} />
                <Route path="mouvement/inventaire" element={<InventaireMouvements />} />
                <Route path="mouvement/archive" element={<ArchivesMouvements />} />
                <Route path="conge/soldeAnnuel" element={<SoldeAnnuelRH />} />   
                <Route path="conge/regle" element={<ReglesConges />} /> 
                <Route path="conge" element={<ValidationRH />} />   
                <Route path="paie/edition" element={<NouvelleEditionPaie />} />
                <Route path="paie/periodes" element={<PeriodesPaie />} />
                <Route path="paie/edition/rubrique" element={<RubriquesList />} />
                <Route path="paie/bulletin/departement" element={<BulletinDepartementPage />} /> 
                <Route path="paie/bulletin/departement/:id" element={< BulletinDetails />} />
                <Route path="paie/bulletin/departement/employe/:paieId" element={<BulletinEmployeDetail />} /> 
                <Route path="paie/heureTravaillee" element={<HeureTravaillee />} />
                <Route path="liste/poste" element={<PostesList />} />

                <Route path="paramétrage/conger-irsa" element={<ParametrageGlobal />} />
                <Route path="paramétrage/pointage" element={<PointagePage />} />
                <Route path="paramétrage/export" element={<ExportConfiguration /> } />
            </Route>
        </Routes>
    );
}

export default RouterRH;
