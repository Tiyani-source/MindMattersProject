import React from "react";

export function Button({ children, onClick, variant = "default" }) {
  const baseStyles = "px-4 py-2 font-medium rounded-lg focus:outline-none transition";
  const variants = {
    default: "bg-primary text-white hover:bg-blue-600",
    outline: "border border-gray-300 text-gray-700 hover:bg-gray-100",
  };

  return (
    <button onClick={onClick} className={`${baseStyles} ${variants[variant]}`}>
      {children}
    </button>
  );
}

