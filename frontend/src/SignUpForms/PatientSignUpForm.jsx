import { useState } from "react";
import PatientImage from "../pages/Images/patient.avif";
import p1 from "../pages/Images/p1.jpeg";
import p2 from "../pages/Images/p2.jpeg";
import p3 from "../pages/Images/p3.jpeg";
import p4 from "../pages/Images/p4.jpeg";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import axios from "axios";
import { GoogleLogin } from '@react-oauth/google';

export default function PatientSignUp() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: ""
  });

  const [errors, setErrors] = useState({});

  const reviews = [
    { name: "Dr. Smith", text: "This platform helped me find the right care in minutes!", rating: 5, profileImage: p1 },
    { name: "Patel", text: "Easy to use and patient-friendly. Signing up was simple!", rating: 4, profileImage: p2 },
    { name: "Dr. Lee", text: "Great for managing appointments efficiently.", rating: 5, profileImage: p3 },
    { name: "Johnson", text: "Fast, secure, and supportive experience.", rating: 4, profileImage: p4 },
  ];

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = "Required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Invalid email";
    if (!formData.password) newErrors.password = "Required";
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const response = await axios.post("http://localhost:4000/api/patients/signup", formData);
      if (response.data.success) {
        alert("Registration successful!");
        setFormData({ email: "", password: "", confirmPassword: "" });
      } else {
        alert("Error: " + response.data.message);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("An error occurred while signing up.");
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const token = credentialResponse.credential;
      const res = await axios.post("http://localhost:4000/api/patients/google-auth", { token });
      if (res.data.success) {
        alert("Logged in with Google!");
      }
    } catch (err) {
      console.error(err);
      alert("Google login failed");
    }
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-200 p-6">
      <div className="bg-white min-h-[600px] p-6 rounded-lg shadow-lg flex w-full max-w-5xl">
        <div className="w-1/2 p-4">
          <img src={PatientImage} alt="Patient" className="w-full h-full object-cover rounded-lg" />
        </div>
        <div className="w-1/2 p-4 overflow-auto flex flex-col justify-between">
          <h2 className="text-2xl font-semibold mb-4 text-center">Join as a Patient!</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} className="border p-3 w-full" />
            {errors.email && <p className="text-red-500">{errors.email}</p>}
            <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} className="border p-3 w-full" />
            {errors.password && <p className="text-red-500">{errors.password}</p>}
            <input type="password" name="confirmPassword" placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleChange} className="border p-3 w-full" />
            {errors.confirmPassword && <p className="text-red-500">{errors.confirmPassword}</p>}
            <button type="submit" className="bg-green-500 text-white px-5 py-2">Sign Up</button>
            <div className="text-center mt-4">or</div>
            <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => console.log("Login Failed")}  />
          </form>

          <div className="mt-6 text-center h-40 overflow-hidden">
            <Swiper modules={[Autoplay]} spaceBetween={10} slidesPerView={1} autoplay={{ delay: 3000 }}>
              {reviews.map((review, index) => (
                <SwiperSlide key={index}>
                  <div className="p-4 bg-gray-100 rounded-lg shadow-md flex items-start space-x-4 text-left">
                    <img src={review.profileImage} alt={review.name} className="w-12 h-12 rounded-full object-cover" />
                    <div>
                      <p className="italic">"{review.text}"</p>
                      <p className="font-bold mt-2">- {review.name}</p>
                      <div className="flex mt-2">
                        {Array.from({ length: 5 }, (_, i) => (
                          <span key={i} className={`text-yellow-500 ${i < review.rating ? "fas fa-star" : "far fa-star"}`}></span>
                        ))}
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </div>
    </div>
  );
}
