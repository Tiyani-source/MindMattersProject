import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter } from 'react-router-dom'
import AdminContextProvider from './context/AdminContext.jsx'
import DoctorContextProvider from './context/DoctorContext.jsx'
import AppContextProvider from './context/AppContext.jsx'
import SupplyManagerProvider from './context/SupplyManagerContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AdminContextProvider>
      <DoctorContextProvider>
      <SupplyManagerProvider>
          <AppContextProvider>
            <App />
          </AppContextProvider>
        </SupplyManagerProvider>
      </DoctorContextProvider>
    </AdminContextProvider>
  </BrowserRouter>,
)
