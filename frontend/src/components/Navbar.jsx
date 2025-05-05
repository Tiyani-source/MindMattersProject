import React, { useContext, useState } from "react";
import { assets } from "../assets/assets";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart as faHeartRegular } from "@fortawesome/free-regular-svg-icons";
import { faShoppingCart } from "@fortawesome/free-solid-svg-icons";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showMenu, setShowMenu] = useState(false);
  const { token: contextToken, setToken, userData } = useContext(AppContext);
  const token = contextToken || localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
    window.location.reload();
  };

  return (
    <div className="flex items-center justify-between md:justify-end text-sm py-4 mb-5 border-b border-b-gray-400">
      <img
        onClick={() => navigate("/")}
        className="w-44 max-h-12 object-contain cursor-pointer"
        src={assets.logo11}
        alt="logo"
      />

      {/* Main navigation links */}
      <ul className="md:flex items-start gap-5 font-medium hidden ml-auto">
        <NavLink to="/">
          <li className="py-1">HOME</li>
        </NavLink>
        <NavLink to="/doctors">
          <li className="py-1">ALL THERAPISTS</li>
        </NavLink>
        <NavLink to="/store">
          <li className="py-1">ONLINE STORE</li>
        </NavLink>
        <NavLink to="/about">
          <li className="py-1">ABOUT</li>
        </NavLink>
        <NavLink to="/contact">
          <li className="py-1">CONTACT</li>
        </NavLink>
      </ul>

      {/* Right Side: Icons */}
      <div className="flex items-center gap-4 ml-auto">
        {token ? (
          <>
            {/* Wishlist Icon */}
            <FontAwesomeIcon
              icon={faHeartRegular}
              className="text-black text-xl cursor-pointer transition duration-300 hover:text-gray-600"
              onClick={() => navigate("/wishlist")}
            />

            {/* Cart Icon */}
            <FontAwesomeIcon
              icon={faShoppingCart}
              className="text-black text-xl cursor-pointer transition duration-300 hover:text-gray-600"
              onClick={() => navigate("/cart")}
            />

            {/* User Avatar & Dropdown */}
            <div className="flex items-center gap-2 cursor-pointer group relative">
              <img
                className="w-8 rounded-full"
                src={assets.profile_pic}
                alt="profile"
              />
              <img
                className="w-2.5"
                src={assets.dropdown_icon}
                alt="dropdown"
              />
              <div className="absolute top-0 right-0 pt-14 text-base font-medium text-gray-600 z-20 hidden group-hover:block">
                <div className="min-w-48 bg-stone-100 rounded flex flex-col gap-4 p-4">
                  <p
                    onClick={() => navigate("/my-profile")}
                    className="hover:text-black cursor-pointer"
                  >
                    My Profile
                  </p>
                  <p
                    onClick={() => navigate("/my-orders")}
                    className="hover:text-black cursor-pointer"
                  >
                    My Orders
                  </p>
                  <p
                    onClick={() => navigate("/my-appointments")}
                    className="hover:text-black cursor-pointer"
                  >
                    My Appointments
                  </p>
                  <p
                    onClick={() => navigate("/my-schedule")}
                    className="hover:text-black cursor-pointer"
                  >
                    My Schedule
                  </p>
                  <p
                    onClick={() => navigate("/support-desk")}
                    className="hover:text-black cursor-pointer"
                  >
                    Tickets
                  </p>
                  <p
                    onClick={() =>
                      window.open(
                        `http://localhost:5173/login?email=${userData?.email}&userType=Student`,
                        "_blank"
                      )
                    }
                    className="hover:text-black cursor-pointer"
                  >
                    MindConnect
                  </p>
                  <p
                    onClick={handleLogout}
                    className="hover:text-black cursor-pointer"
                  >
                    Logout
                  </p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <button
            onClick={() => navigate("/login")}
            className="bg-primary text-white px-8 py-3 rounded-full font-light hidden md:block"
          >
            Create account
          </button>
        )}

        {/* Mobile cart icon (for non-logged-in users maybe) */}
        <img className="w-8" src={assets.shopping_cart} alt="cart" />

        {/* Hamburger Menu Icon for mobile */}
        <img
          onClick={() => setShowMenu(true)}
          className="w-6 md:hidden"
          src={assets.menu_icon}
          alt="menu"
        />
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden fixed top-0 right-0 bottom-0 bg-white overflow-hidden z-30 transition-all duration-300 ${
          showMenu ? "w-3/4" : "w-0"
        }`}
      >
        <div className="flex items-center justify-between p-5">
          <img src={assets.logo} className="w-36" alt="logo" />
          <img
            onClick={() => setShowMenu(false)}
            src={assets.cross_icon}
            className="w-7"
            alt="close"
          />
        </div>
        <ul className="flex flex-col gap-2 mt-5 px-5 text-lg font-medium">
          <NavLink onClick={() => setShowMenu(false)} to="/">
            <p className="px-4 py-2">HOME</p>
          </NavLink>
          <NavLink onClick={() => setShowMenu(false)} to="/doctors">
            <p className="px-4 py-2">ALL DOCTORS</p>
          </NavLink>
          <NavLink onClick={() => setShowMenu(false)} to="/store">
            <p className="px-4 py-2">ONLINE STORE</p>
          </NavLink>
          <NavLink onClick={() => setShowMenu(false)} to="/about">
            <p className="px-4 py-2">ABOUT</p>
          </NavLink>
          <NavLink onClick={() => setShowMenu(false)} to="/contact">
            <p className="px-4 py-2">CONTACT</p>
          </NavLink>
        </ul>
      </div>
    </div>
  );
};

export default Navbar;
