// import React from 'react';
// import ReactDOM from 'react-dom/client';
// import './index.css';
// import App from './App';
// import reportWebVitals from './reportWebVitals';
// import 'bootstrap/dist/css/bootstrap.min.css';
// import 'admin-lte/dist/css/adminlte.min.css';
// import '@fortawesome/fontawesome-free/css/all.min.css';
// import 'admin-lte/dist/js/adminlte.min.js';


// const root = ReactDOM.createRoot(document.getElementById('root'));
// root.render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>
// );

// // If you want to start measuring performance in your app, pass a function
// // to log results (for example: reportWebVitals(console.log))
// // or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // <-- ajouter ça
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'admin-lte/dist/css/adminlte.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import 'admin-lte/dist/js/adminlte.min.js';
// import 'css/OrgChart.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* <-- envelopper App */}
      <App />
    
  </React.StrictMode>
);

reportWebVitals();
