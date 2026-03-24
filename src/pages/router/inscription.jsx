import { Routes, Route } from "react-router-dom";
import ValidationInscription from "../inscription_user/validation-inscription";
import Inscription from "../inscription_user/Inscription";

const RouterInscription = () => {
  return (
    <Routes>
        <Route path="" element={<Inscription />} />
        <Route path="validation" element={<ValidationInscription />} />
        {/* </Route>> */}
    </Routes>
  );
};

export default RouterInscription;
