import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import AdminContextProvider from './context/AdminContext.jsx'
import DoctorContextProvider from './context/DoctorContext.jsx'
import AppContextProvider from './context/AppContext.jsx'
import UniversityContextProvider from './context/UniversityContext.jsx'
import SupplyManagerProvider from './context/SupplyManagerContext.jsx';
import TherapistContextProvider from './context/TherapistContext.jsx';
import { TemplateProvider } from './context/TemplateContext';

console.log("In main.jsx..."),  // Debugging

  ReactDOM.createRoot(document.getElementById('root')).render(    //This initializes the React application inside the root div in index.html
    <BrowserRouter>
      <AdminContextProvider>
        <UniversityContextProvider>
          <DoctorContextProvider>
            <TherapistContextProvider>
              <SupplyManagerProvider>
                <AppContextProvider>
                  <TemplateProvider>
                    <App />
                  </TemplateProvider>
                </AppContextProvider>
              </SupplyManagerProvider>
            </TherapistContextProvider>
          </DoctorContextProvider>
        </UniversityContextProvider>
      </AdminContextProvider>
    </BrowserRouter>,
  )
