import React, { useContext, useEffect, useState } from "react";
import { assets } from '../assets/assets';
import { NavLink } from "react-router-dom";
import {
  Home,
  CalendarCheck,
  Calendar,
  University as UniversityIcon,
  UserPlus,
  UserCircle,
  ClipboardList,
  FileText,
  CreditCard,
  BarChart4,
  Truck,
  MessageCircle,
} from "lucide-react";
import { jwtDecode } from "jwt-decode";
import { DoctorContext } from "../context/DoctorContext";
import { AdminContext } from "../context/AdminContext";
import { UniversityContext } from "../context/UniversityContext";
import { SupplyManagerContext } from '../context/SupplyManagerContext';
import { TherapistContext } from '../context/TherapistContext';

export default function Sidebar() {
  const { dToken } = useContext(DoctorContext);
  const { tToken } = useContext(TherapistContext);
  const { aToken } = useContext(AdminContext);
  const { uToken } = useContext(UniversityContext);
  const { smToken } = useContext(SupplyManagerContext);

  const [doctorEmail, setDoctorEmail] = useState("");

  useEffect(() => {
    if (dToken) {
      try {
        const decoded = jwtDecode(dToken);
        setDoctorEmail(decoded?.email || "");
      } catch (err) {
        console.error("Failed to decode token:", err);
      }
    }
  }, [dToken]);

  const chatUrl = `/doctor-chat?email=${encodeURIComponent(doctorEmail)}&userType=Doctor`;
  return (
    <div className="min-h-screen w-64 bg-white border-r -mt-4 fixed">
      {aToken && (
        <ul className="text-[#515151] mt-5 space-y-1">
          <NavItem to="/admin-dashboard" label="Dashboard" Icon={Home} />
          <NavItem to="/all-appointments" label="Appointments" Icon={CalendarCheck} />
          <NavItem to="/add-uni" label="Add University" Icon={UniversityIcon} />
          <NavItem to="/doctor-list" label="Doctors List" Icon={UserPlus} />
          <NavItem to="/admin-profile" label="Profile" Icon={UserCircle} />
          <NavItem to="/requests" label="Requests" Icon={ClipboardList} />
          <NavItem to="/payment-dashboard" label="Payment List" Icon={CreditCard} />
          <NavItem to="/order-payment-dashboard" label="Order Payment" Icon={CreditCard} />
          <NavItem to="/order-insights" label="Order Insights" Icon={BarChart4} />
          <NavItem to="/delivery-partners" label="Delivery Partners" Icon={Truck} />
        </ul>
      )}

      {dToken && (
        <ul className="text-[#515151] mt-5 space-y-1">
          <NavItem to="/doctor-dashboard" label="Dashboard" Icon={Home} />
          <NavItem to="/therapist-appointments" label="Appointments" Icon={CalendarCheck} />
          <NavItem to="/online-link-upload" label="Upload Online Links" Icon={FileText} />
          <NavItem to="/my-schedule" label="My Availability" Icon={Calendar} />
          <NavItem to="/therapist-schedule" label="My Schedule" Icon={Calendar} />
          <NavItem to="/client-view" label="Client Management" Icon={ClipboardList} />
          <NavItem to={chatUrl} label="MindConnect" Icon={MessageCircle} />
          <NavItem to="/patient-feedback" label="Patient Feedback" Icon={FileText} />
          <NavItem to="/patient-requests" label="Requests" Icon={ClipboardList} />
          <NavItem to="/doctor-user-profile" label="Profile" Icon={UserCircle} />
          <NavItem to="/student-list" label="Student List" Icon={UserPlus} />
          

        </ul>
      )}

      {tToken && (
        <ul className="text-[#515151] mt-5 space-y-1">
          <NavItem to="/therapist-appointments" label="Appointments" Icon={CalendarCheck} />
          <NavItem to="/online-link-upload" label="Upload Online Links" Icon={FileText} />
          <NavItem to="/my-schedule" label="My Availability" Icon={Calendar} />
          <NavItem to="/therapist-schedule" label="My Schedule" Icon={Calendar} />
          <NavItem to="/clients" label="Clients" Icon={UserCircle} />
          <NavItem to="/client-notes" label="Client Notes" Icon={ClipboardList} />
        </ul>
      )}

      {uToken && !aToken && !dToken && (
        <ul className="text-[#515151] mt-5 space-y-1">
          <NavItem to="/uni-dashboard" label="Dashboard" Icon={Home} />
          <NavItem to="/university-appointments" label="Appointments" Icon={CalendarCheck} />
        </ul>
      )}

      {smToken && (
        <ul className="text-[#515151] mt-5 space-y-1">
          <NavItem to="/supplier-dashboard" label="Dashboard" Icon={Home} />
          <NavItem to="/product-management" label="Product Management" Icon={ClipboardList} />
          <NavItem to="/supplier-profile" label="Profile" Icon={UserCircle} />
        </ul>
      )}
    </div>
  );
}

function NavItem({ to, label, Icon }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-4 py-3 px-4 md:px-6 transition-colors duration-200 w-full ${isActive
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