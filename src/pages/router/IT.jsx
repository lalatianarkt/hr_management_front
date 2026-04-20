import React from "react";
import { Routes, Route } from "react-router-dom";
import HeaderIT from "../Admin/Header/HeaderIt";
import UserListe from "../Admin/user/list";

const RouterIT = () => {
  return (
    <Routes>
      <Route path="" element={<HeaderIT />}>
        <Route index element={<UserListe />} />
        <Route path="users" element={<UserListe />} />
        <Route path="users/list" element={<UserListe />} />
      </Route>
    </Routes>
  );
};

export default RouterIT;
