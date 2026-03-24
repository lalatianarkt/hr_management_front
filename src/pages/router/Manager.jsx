import React from "react";
import { Routes, Route } from "react-router-dom";
import ValidationConges from "../Manager/conge/validationConges";
import HeaderManager from "../Manager/Header/HeaderManager";
import EmployeesManager from "../Manager/employe/ListeEmploye";
// import EmployeesManager from "../Manager/employe/EmployeesManager";

const RouterManager = () => {
    return (
        <Routes>
            <Route path="" element={<HeaderManager />}>
                {/* <Route path="employees" element={<Employees />} /> */}
                <Route path="conge/validation" element={<ValidationConges />} />
                <Route path="emp/liste" element={<EmployeesManager />} />
           </Route>
        </Routes>
    );
}

export default RouterManager;
