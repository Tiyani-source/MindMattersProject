import { useState } from "react";
import StudentImage from "../pages/Images/uniStudent2.jpg";
import p1 from "../pages/Images/p1.jpeg";
import p2 from "../pages/Images/p2.jpeg";
import p3 from "../pages/Images/p3.jpeg";
import p4 from "../pages/Images/p4.jpeg";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import axios from "axios";

export default function StudentSignUp() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    universityId: "",
    universityName: "",
    year: "",
    semester: "",
    address: "",
    gender: "",
    email: "",
    phone: "",
    documents: "",
    degree: "",
  });

  const [errors, setErrors] = useState({});

  const reviews = [
    { name: "Dr. Smith", text: "This platform has helped me streamline my practice like never before! Highly recommended.", rating: 5, profileImage: p1 },
    { name: "Patel", text: "Easy to use and efficient. Signing up was a breeze!", rating: 4, profileImage: p2 },
    { name: "Dr. Lee", text: "A great way to connect with patients and manage appointments effortlessly.", rating: 5, profileImage: p3 },
    { name: "Johnson", text: "Amazing support and seamless experience.", rating: 4, profileImage: p4 },
  ];

  const validateStep = () => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.firstName) newErrors.firstName = "Required";
      if (!formData.lastName) newErrors.lastName = "Required";
      if (!formData.universityId) newErrors.universityId = "Required";
      if (!formData.universityName) newErrors.universityName = "Required";
    } else if (step === 2) {
      if (!formData.degree) newErrors.degree = "Required";
      if (!formData.year) newErrors.year = "Required";
      if (!formData.semester) newErrors.semester = "Required";
      if (!formData.gender) newErrors.gender = "Required";
    } else if (step === 3) {
      if (!formData.email) newErrors.email = "Required";
      else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Invalid email";
      if (!formData.phone) newErrors.phone = "Required";
      else if (!/^\d{10}$/.test(formData.phone)) newErrors.phone = "Must be 10 digits";
      if (!formData.documents) newErrors.documents = "Required";
    } else if (step === 4) {
      if (!formData.address) newErrors.address = "Required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, documents: e.target.files[0] });
    setErrors({ ...errors, documents: "" });
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep((prev) => Math.min(prev + 1, 5));
    }
  };

  const handlePrevious = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep()) return;

    try {
      const form = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        form.append(key, value);
      });

      const response = await axios.post(
        "http://localhost:4000/api/student-request/submit",
        form,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (response.data.success) {
        setStep(5);
      } else {
        alert("Error: " + response.data.message);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("An error occurred while submitting your request.");
    }
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-200 p-6">
      <div className="bg-white min-h-[600px] p-6 rounded-lg shadow-lg flex w-full max-w-5xl transition-all duration-500 ease-in-out">
        <div className="w-1/2 p-4">
          <img src={StudentImage} alt="Student" className="w-full h-full object-cover rounded-lg" />
        </div>

        <div className="w-1/2 p-4 overflow-auto flex flex-col justify-between">
          {step !== 5 && <h2 className="text-2xl font-semibold mb-4 text-center">Student Registration Form</h2>}
          <form onSubmit={handleSubmit} className="flex-grow">
            {step === 1 && (
              <div>
                <input name="firstName" placeholder="First name" value={formData.firstName} onChange={handleChange} className="border p-3 w-full" />
                {errors.firstName && <p className="text-red-500">{errors.firstName}</p>}

                <input name="lastName" placeholder="Last name" value={formData.lastName} onChange={handleChange} className="border p-3 w-full mt-2" />
                {errors.lastName && <p className="text-red-500">{errors.lastName}</p>}

                <input name="universityId" placeholder="University ID" value={formData.universityId} onChange={handleChange} className="border p-3 w-full mt-2" />
                {errors.universityId && <p className="text-red-500">{errors.universityId}</p>}

                <input name="universityName" placeholder="What's Your University?" value={formData.universityName} onChange={handleChange} className="border p-3 w-full mt-2" />
                {errors.universityName && <p className="text-red-500">{errors.universityName}</p>}

                <div className="flex justify-between mt-4">
                  <button type="button" onClick={handleNext} className="bg-blue-500 text-white px-5 py-2">Next</button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <input name="degree" placeholder="Degree" value={formData.degree} onChange={handleChange} className="border p-3 w-full" />
                {errors.degree && <p className="text-red-500">{errors.degree}</p>}

                <input type="number" name="year" placeholder="Current Year" value={formData.year} onChange={handleChange} className="border p-3 w-full mt-2" />
                {errors.year && <p className="text-red-500">{errors.year}</p>}

                <input type="number" name="semester" placeholder="Current Semester" value={formData.semester} onChange={handleChange} className="border p-3 w-full mt-2" />
                {errors.semester && <p className="text-red-500">{errors.semester}</p>}

                <div className="mt-3">
                  <p className="mb-2">Gender:</p>
                  <label className="mr-6"><input type="radio" name="gender" value="Male" checked={formData.gender === "Male"} onChange={handleChange} /> Male</label>
                  <label className="mr-6"><input type="radio" name="gender" value="Female" checked={formData.gender === "Female"} onChange={handleChange} /> Female</label>
                  {errors.gender && <p className="text-red-500">{errors.gender}</p>}
                </div>

                <div className="flex justify-between mt-4">
                  <button type="button" onClick={handlePrevious} className="bg-gray-400 text-white px-5 py-2">Back</button>
                  <button type="button" onClick={handleNext} className="bg-blue-500 text-white px-5 py-2">Next</button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <input type="email" name="email" placeholder="Email ID" value={formData.email} onChange={handleChange} className="border p-3 w-full" />
                {errors.email && <p className="text-red-500">{errors.email}</p>}

                <input type="tel" name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} className="border p-3 w-full mt-2" />
                {errors.phone && <p className="text-red-500">{errors.phone}</p>}

                <div className="mt-3">
                  <label className="block mb-2">Upload Documents:</label>
                  <input type="file" name="documents" onChange={handleFileChange} className="border p-3 w-full" />
                  {errors.documents && <p className="text-red-500">{errors.documents}</p>}
                </div>

                <div className="flex justify-between mt-4">
                  <button type="button" onClick={handlePrevious} className="bg-gray-400 text-white px-5 py-2">Back</button>
                  <button type="button" onClick={handleNext} className="bg-blue-500 text-white px-5 py-2">Next</button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div>
                <input type="text" name="address" placeholder="Address" value={formData.address} onChange={handleChange} className="border p-3 w-full" />
                {errors.address && <p className="text-red-500">{errors.address}</p>}

                <div className="flex justify-between mt-4">
                  <button type="button" onClick={handlePrevious} className="bg-gray-400 text-white px-5 py-2">Back</button>
                  <button type="submit" className="bg-green-500 text-white px-5 py-2">Submit</button>
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="text-center animate-fade-in">
                <h2 className="text-2xl font-semibold mb-4">Thank you {formData.firstName} {formData.lastName}!</h2>
                <p className="mb-6">Your registration has been submitted successfully.</p>
                <button className="bg-blue-500 text-white px-5 py-2" onClick={() => {
                  setStep(1);
                  setFormData({
                    firstName: "", lastName: "", universityId: "", universityName: "",
                    address: "", gender: "", year: "", semester: "", email: "",
                    phone: "", documents: "", degree: ""
                  });
                  setErrors({});
                }}>
                  Back to Home
                </button>
              </div>
            )}
          </form>

          <div className="flex justify-center mt-6">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className={`w-3 h-3 rounded-full mx-1 ${step === s ? "bg-blue-600" : "bg-gray-300"}`}></div>
            ))}
          </div>

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
