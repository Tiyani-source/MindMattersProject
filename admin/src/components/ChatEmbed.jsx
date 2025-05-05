import React from "react";
import { useLocation } from "react-router-dom";

const ChatEmbed = () => {
  const searchParams = new URLSearchParams(useLocation().search);
  const email = searchParams.get("email");
  const userType = searchParams.get("userType");
  console.log("Email:", email);
    console.log("User Type:", userType);


  const iframeSrc  = `http://localhost:5173/login?email=${email}&userType=Doctor`;


  return (
    <div className="w-full flex justify-center items-start pt-20 px-4">
      <div className="w-full max-w-7xl h-[88vh] shadow-lg rounded-md overflow-hidden border">
        <iframe
          src={iframeSrc}
          title="Chat App"
          className="w-full h-full border-0"
        />
      </div>
    </div>
  );
};

export default ChatEmbed;