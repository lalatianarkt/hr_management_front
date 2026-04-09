import React from "react";
import { Routes, Route } from "react-router-dom";
import ValidationConges from "../Manager/conge/validationConges";
import HeaderManager from "../Manager/Header/HeaderManager";
import EmployeesManager from "../Manager/employe/ListeEmploye";
import HierarchieManager from "../Manager/organisation/HierarchieManager";
import ValidationMouvement from "../Manager/mouvements/validationMouvement";
import TableauBordManager from "../Manager/dashboard/tableauBord";
// import EmployeesManager from "../Manager/employe/EmployeesManager";

const RouterManager = () => {
    return (
        <Routes>
            <Route path="" element={<HeaderManager />}>
                <Route index element={<TableauBordManager />} />
                {/* <Route path="employees" element={<Employees />} /> */}
                <Route path="conge/validation" element={<ValidationConges />} />
                <Route path="emp/liste" element={<EmployeesManager />} />
                <Route path="organisation/hierarchie" element={<HierarchieManager />} />
                <Route path="mouvements/validation" element={<ValidationMouvement />} />
           </Route>
        </Routes>
    );
}

export default RouterManager;
