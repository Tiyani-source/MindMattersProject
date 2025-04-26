import React, { useContext, useState } from "react";
import { DoctorContext } from "../context/DoctorContext";
import { AdminContext } from "../context/AdminContext";
import { UniversityContext } from "../context/UniversityContext";
import { SupplyManagerContext } from '../context/SupplyManagerContext.jsx';
import { toast } from 'react-toastify';
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaUserMd, FaUserShield } from "react-icons/fa";
import axios from "axios";

const Login = () => {
  const [state, setState] = useState("Admin");
  const [adminType, setAdminType] = useState("System Admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();

  const { setDToken } = useContext(DoctorContext);
  const { setAToken } = useContext(AdminContext);
  const { setUToken } = useContext(UniversityContext);
  const { setSMToken } = useContext(SupplyManagerContext);

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    try {
      if (state === "Admin") {
        if (adminType === "University Admin") {
          const fakeToken = "dummy_token_1234567";
          setUToken(fakeToken);
          localStorage.setItem("uToken", fakeToken);
          toast.success("University Admin login successful");
          navigate("/uni-dashboard");
        }
        else if (adminType === "Supply Manager") {
          const { data } = await axios.post(backendUrl + "/api/supplymanager/login", { email, password });

          if (data.success) {
            setSMToken(data.token);
            localStorage.setItem("smToken", data.token);
            toast.success("Supply Manager login successful");
            navigate("/supplier-dashboard");
          } else {
            toast.error(data.message || "Login failed");
          }
        }
        else { // System Admin
          const res = await fetch(backendUrl + "/api/admin/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          });

          const data = await res.json();

          if (!res.ok) {
            toast.error(data.message || "Login failed");
            return;
          }

          setAToken(data.token);
          localStorage.setItem("aToken", data.token);
          localStorage.setItem("adminType", adminType);
          toast.success("System Admin login successful");
          navigate("/admin-dashboard");
        }
      }
      else if (state === "Doctor") {
        const res = await fetch(backendUrl + "/api/doctor/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (!res.ok) {
          toast.error(data.message || "Login failed");
          return;
        }

        setDToken(data.token);
        localStorage.setItem("dToken", data.token);
        toast.success("Doctor login successful");
        navigate("/doctor-dashboard");
      }
    } catch (err) {
      console.error("Login error:", err);
      toast.error("Something went wrong!");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-pink-100 flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute w-[600px] h-[600px] bg-purple-300 rounded-full opacity-30 blur-3xl -top-40 -left-40 z-0"></div>

      <motion.form
        onSubmit={onSubmitHandler}
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 bg-white p-8 rounded-3xl shadow-xl w-full max-w-md space-y-6"
      >
        <div className="text-center">
          <div className="flex justify-center mb-2 text-4xl text-primary">
            {state === "Admin" ? <FaUserShield /> : <FaUserMd />}
          </div>
          <h2 className="text-2xl font-bold text-gray-800">
            {state} Login
          </h2>
        </div>

        <div>
          <label className="text-gray-700 text-sm">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full mt-1 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition"
            placeholder="Enter your email"
          />
        </div>

        <div>
          <label className="text-gray-700 text-sm">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full mt-1 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition"
            placeholder="Enter your password"
          />
        </div>

        {/* Admin Type Selection */}
        {state === "Admin" && (
          <div className="text-sm text-gray-700">
            <p>Select Admin Type:</p>
            <div className="flex flex-row flex-wrap gap-4 mt-2">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="adminType"
                  value="System Admin"
                  checked={adminType === "System Admin"}
                  onChange={(e) => setAdminType(e.target.value)}
                />
                System Admin
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="adminType"
                  value="University Admin"
                  checked={adminType === "University Admin"}
                  onChange={(e) => setAdminType(e.target.value)}
                />
                University Admin
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="adminType"
                  value="Supply Manager"
                  checked={adminType === "Supply Manager"}
                  onChange={(e) => setAdminType(e.target.value)}
                />
                Supply Lead
              </label>
            </div>
          </div>
        )}

        {/* Login Button */}
        <button
          type="submit"
          className="w-full py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary-dark transition"
        >
          Login
        </button>

        {/* Switch Login Type */}
        <div className="text-center text-sm text-gray-500 flex flex-col gap-1">
          {state !== "Admin" && (
            <p>Admin Login?{" "}
              <span
                onClick={() => setState("Admin")}
                className="text-primary underline cursor-pointer"
              >
                Click here
              </span>
            </p>
          )}
          {state !== "Doctor" && (
            <p>Doctor Login?{" "}
              <span
                onClick={() => setState("Doctor")}
                className="text-primary underline cursor-pointer"
              >
                Click here
              </span>
            </p>
          )}
        </div>
      </motion.form>
    </div>
  );
};

export default Login;