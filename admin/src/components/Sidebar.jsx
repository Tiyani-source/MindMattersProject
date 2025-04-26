import React, { useContext } from "react";
import { assets } from '../assets/assets'
import { NavLink } from "react-router-dom";
import {
  Home,
  CalendarCheck,
  University as UniversityIcon,
  UserPlus,
  UserCircle,
  ClipboardList,
  FileText,
} from "lucide-react";
import { DoctorContext } from "../context/DoctorContext";
import { AdminContext } from "../context/AdminContext";
import { UniversityContext } from "../context/UniversityContext";
import { SupplyManagerContext } from '../context/SupplyManagerContext'

export default function Sidebar() {
  const { dToken } = useContext(DoctorContext);
  const { aToken } = useContext(AdminContext);
  const { uToken } = useContext(UniversityContext);
  const { smToken } = useContext(SupplyManagerContext)

  return (
    <div className="min-h-screen w-64 bg-white border-r fixed">
      {aToken && (
        <ul className="text-[#515151] mt-5 space-y-1">
          <NavItem to="/admin-dashboard" label="Dashboard" Icon={Home} />
          <NavItem to="/all-appointments" label="Appointments" Icon={CalendarCheck} />
          <NavItem to="/add-uni" label="Add University" Icon={UniversityIcon} />
          <NavItem to="/doctor-list" label="Doctors List" Icon={UserPlus} />
          <NavItem to="/admin-profile" label="Profile" Icon={UserCircle} />
          <NavItem to="/requests" label="Requests" Icon={ClipboardList} />
          <NavLink to={'/payment-dashboard'} className={({ isActive }) => `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''}`}>
          <img className='min-w-5' src={assets.list_icon} alt='' />
          <p className='hidden md:block'>Payment List</p>
        </NavLink>
        <NavLink to={'/order-insights'} className={({ isActive }) => `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''}`}>
          <img className='min-w-5' src={assets.order_icon} alt='' />
          <p className='hidden md:block'>Order Insights & Actions</p>
        </NavLink>
        </ul>
      )}

      {dToken && (
        <ul className="text-[#515151] mt-5 space-y-1">
          <NavItem to="/doctor-dashboard" label="Dashboard" Icon={Home} />
          <NavItem to="/doctor-appointments" label="Appointments" Icon={CalendarCheck} />
          <NavItem to="/patient-feedback" label="Patient Feedback" Icon={FileText} />
          <NavItem to="/patient-requests" label="Requests" Icon={ClipboardList} />
          <NavItem to="/doctor-user-profile" label="Profile" Icon={UserCircle} />
          <NavItem to="/student-list" label="Student List" Icon={UserPlus} />
        </ul>
      )}

      {uToken && !aToken && !dToken && (
        <ul className="text-[#515151] mt-5 space-y-1">
          <NavItem to="/uni-dashboard" label="Dashboard" Icon={Home} />
          <NavItem to="/university-appointments" label="Appointments" Icon={CalendarCheck} />
        </ul>
      )}



{smToken && <ul className='text-[#515151] mt-5'>
        <NavLink to={'/supplier-dashboard'} className={({ isActive }) => `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''}`}>
          <img className='min-w-5' src={assets.home_icon} alt='' />
          <p className='hidden md:block'>Dashboard</p>
        </NavLink>
        <NavLink to={'/product-management'} className={({ isActive }) => `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''}`}>
          <img className='min-w-5' src={assets.appointment_icon} alt='' />
          <p className='hidden md:block'>Product Management</p>
        </NavLink>
        <NavLink to={'/supplier-profile'} className={({ isActive }) => `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''}`}>
          <img className='min-w-5' src={assets.people_icon} alt='' />
          <p className='hidden md:block'>Profile</p>
        </NavLink>
      </ul>}



    </div>
  );
}

function NavItem({ to, label, Icon }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-4 py-3 px-4 md:px-6 transition-colors duration-200 w-full ${
          isActive
            ? "bg-indigo-100 text-indigo-700 font-medium rounded-none"
            : "hover:bg-gray-100 hover:text-indigo-600 hover:rounded-none"
        }`
      }
    >
      <Icon size={20} className="min-w-[20px]" />
      <span className="hidden md:block">{label}</span>
    </NavLink>
  );
}
