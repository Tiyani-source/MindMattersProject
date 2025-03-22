import React, { useContext } from "react";
import { assets } from "../assets/assets";
import { NavLink } from "react-router-dom";
import { DoctorContext } from "../context/DoctorContext";
import { AdminContext } from "../context/AdminContext";
import { UniversityContext } from "../context/UniversityContext";

const Sidebar = () => {
  const { dToken } = useContext(DoctorContext);
  const { aToken } = useContext(AdminContext);
  const { uToken } = useContext(UniversityContext);

 

  return (
    console.log("In sidebar.jsx..."), // Debugging
    console.log("Admin Token:", aToken),  // Log Admin Token
    console.log("Doctor Token:", dToken), // Log Doctor Token
    console.log("University Token:", uToken),  // Log University Token

    (
      <div className="min-h-screen bg-white border-r fixed">
        {aToken && (
          <ul className="text-[#515151] mt-5">
            <NavLink
              to={"/admin-dashboard"}
              className={({ isActive }) =>
                `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${
                  isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""
                }`
              }
            >
              <img className="min-w-5" src={assets.home_icon} alt="" />
              <p className="hidden md:block">Dashboard</p>
            </NavLink>
            <NavLink
              to={"/all-appointments"}
              className={({ isActive }) =>
                `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${
                  isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""
                }`
              }
            >
              <img className="min-w-5" src={assets.appointment_icon} alt="" />
              <p className="hidden md:block">Appointments</p>
            </NavLink>
            <NavLink
              to={"/add-doctor"}
              className={({ isActive }) =>
                `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${
                  isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""
                }`
              }
            >
              <img className="min-w-5" src={assets.add_icon} alt="" />
              <p className="hidden md:block">Add Doctor</p>
            </NavLink>
            <NavLink
              to={"/add-uni"}
              className={({ isActive }) =>
                `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${
                  isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""
                }`
              }
            >
              <img className="min-w-5" src={assets.add_icon} alt="" />
              <p className="hidden md:block">Add University</p>
            </NavLink>
            <NavLink
              to={"/doctor-list"}
              className={({ isActive }) =>
                `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${
                  isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""
                }`
              }
            >
              <img className="min-w-5" src={assets.people_icon} alt="" />
              <p className="hidden md:block">Doctors List</p>
            </NavLink>
            <NavLink
              to={"/admin-profile"}
              className={({ isActive }) =>
                `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${
                  isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""
                }`
              }
            >
              <img className="min-w-5" src={assets.people_icon} alt="" />
              <p className="hidden md:block">Profile</p>
            </NavLink>
            <NavLink
              to={"/requests"}
              className={({ isActive }) =>
                `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${
                  isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""
                }`
              }
            >
              <img className="min-w-5" src={assets.people_icon} alt="" />
              <p className="hidden md:block">Requests</p>
            </NavLink>
          </ul>
        )}

        {dToken && (
          <ul className="text-[#515151] mt-5">
            <NavLink
              to={"/doctor-dashboard"}
              className={({ isActive }) =>
                `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${
                  isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""
                }`
              }
            >
              <img className="min-w-5" src={assets.home_icon} alt="" />
              <p className="hidden md:block">Dashboard</p>
            </NavLink>
            <NavLink
              to={"/doctor-appointments"}
              className={({ isActive }) =>
                `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${
                  isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""
                }`
              }
            >
              <img className="min-w-5" src={assets.appointment_icon} alt="" />
              <p className="hidden md:block">Appointments</p>
            </NavLink>
            <NavLink
              to={"/patient-feedback"}
              className={({ isActive }) =>
                `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${
                  isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""
                }`
              }
            >
              <img className="min-w-5" src={assets.people_icon} alt="" />
              <p className="hidden md:block">Patient FeedBack</p>
            </NavLink>
            <NavLink
              to={"/patient-requests"}
              className={({ isActive }) =>
                `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${
                  isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""
                }`
              }
            >
              <img className="min-w-5" src={assets.people_icon} alt="" />
              <p className="hidden md:block">Requests</p>
            </NavLink>
            <NavLink
              to={"/doctor-user-profile"}
              className={({ isActive }) =>
                `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${
                  isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""
                }`
              }
            >
              <img className="min-w-5" src={assets.people_icon} alt="" />
              <p className="hidden md:block">Profile</p>
            </NavLink>
          </ul>
        )}

        {uToken && !aToken && !dToken &&(
          console.log("In university sidebar..."), // Debugging
          <ul className="text-[#515151] mt-5">
            <NavLink
              to={"/uni-dashboard"}
              className={({ isActive }) =>
                `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${
                  isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""
                }`
              }
            >
              <img className="min-w-5" src={assets.home_icon} alt="" />
              <p className="hidden md:block">Dashboard</p>
            </NavLink>
            <NavLink
              to={"/university-appointments"}
              className={({ isActive }) =>
                `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${
                  isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""
                }`
              }
            >
              <img className="min-w-5" src={assets.appointment_icon} alt="" />
              <p className="hidden md:block">Appointments</p>
            </NavLink>
            
          </ul>
        )}
      </div>
    )
  );
};

export default Sidebar;
