import React, { useState } from "react";

export default function AddUni() {
  const [formData, setFormData] = useState({
    universityName: "",
    email: "",
    password: "",
    establishedYear: "",
    fees: "",
    specialty: "",
    topDegree: "",
    about: "",
    addressLine1: "",
    addressLine2: "",
    image: null,
  });

  const [step, setStep] = useState(1);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateYear = (year) => {
    const currentYear = new Date().getFullYear();
    return /^\d{4}$/.test(year) && parseInt(year) <= currentYear && parseInt(year) > 1800;
  };

  const validateStep = () => {
    if (step === 1) {
      if (!formData.universityName || !formData.email || !formData.password || !formData.image) {
        alert("Please fill all required fields in Step 1.");
        return false;
      }
      if (!validateEmail(formData.email)) {
        alert("Please enter a valid email address.");
        return false;
      }
    }

    if (step === 2) {
      if (!formData.establishedYear || !formData.fees || !formData.specialty || !formData.topDegree || !formData.about) {
        alert("Please fill all required fields in Step 2.");
        return false;
      }
      if (!validateYear(formData.establishedYear)) {
        alert("Please enter a valid established year (e.g., 1990).");
        return false;
      }
    }

    if (step === 3) {
      if (!formData.addressLine1) {
        alert("Please provide the university's street address.");
        return false;
      }
    }

    return true;
  };

  const nextStep = () => {
    if (step < 4 && validateStep()) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const submitUniversity = async () => {
    const form = new FormData();
    form.append("universityName", formData.universityName);
    form.append("email", formData.email);
    form.append("password", formData.password);
    form.append("establishedYear", formData.establishedYear);
    form.append("fees", formData.fees);
    form.append("specialty", formData.specialty);
    form.append("topDegree", formData.topDegree);
    form.append("about", formData.about);
    form.append("addressLine1", formData.addressLine1);
    form.append("addressLine2", formData.addressLine2);
    form.append("image", formData.image);

    try {
      const response = await fetch("http://localhost:4000/api/university/add", {
        method: "POST",
        body: form,
      });

      const result = await response.json();

      if (result.success) {
        alert("University added successfully!");
        setStep(1);
        setFormData({
          universityName: "",
          email: "",
          password: "",
          establishedYear: "",
          fees: "",
          specialty: "",
          topDegree: "",
          about: "",
          addressLine1: "",
          addressLine2: "",
          image: null,
        });
      } else {
        alert(`Failed: ${result.message}`);
      }
    } catch (err) {
      console.error("Error submitting university:", err);
      alert("Something went wrong while submitting.");
    }
  };

  return (
    <div className="max-w-4/5 mx-auto p-6 min-h-[80vh] mt-20">
      <h1 className="text-3xl font-bold mb-2">Add University</h1>
      <p className="text-gray-500 mb-6">Complete the form below to add a new university to the platform</p>

      <div className="relative flex justify-between items-center mb-8">
        <div className="absolute top-4 left-4 right-4 h-0.5 bg-gray-300 z-0">
          <div
            className="h-0.5 bg-blue-600 absolute top-0 left-0 z-10 transition-all duration-300"
            style={{ width: `${(step - 1) * 33}%` }}
          ></div>
        </div>
        {["Basic Info", "Details", "Location", "Preview"].map((label, index) => (
          <div
            key={index}
            className={`relative z-20 flex flex-col items-center ${step >= index + 1 ? "text-blue-600" : "text-gray-400"}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= index + 1 ? "border-blue-600 bg-white" : "border-gray-300 bg-white"}`}>{index + 1}</div>
            <span className="text-sm mt-1">{label}</span>
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <div className="border-2 border-dashed p-6 text-center">
            <label htmlFor="image" className="cursor-pointer">
              <div className="text-blue-500">Upload university image</div>
              <div className="text-sm text-gray-400">Drag and drop or click to upload</div>
              <input type="file" id="image" name="image" className="hidden" onChange={handleChange} />
              <div className="mt-2 text-sm text-gray-500">{formData.image?.name}</div>
            </label>
          </div>
          <input name="universityName" placeholder="Enter university name" className="w-full p-2 border rounded" onChange={handleChange} />
          <input name="email" placeholder="admin@university.edu" className="w-full p-2 border rounded" onChange={handleChange} />
          <input type="password" name="password" placeholder="Create a secure password" className="w-full p-2 border rounded" onChange={handleChange} />
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <input name="establishedYear" placeholder="Established Year" className="w-full p-2 border rounded" onChange={handleChange} />
          <input name="fees" placeholder="Annual tuition fees" className="w-full p-2 border rounded" onChange={handleChange} />
          <input name="specialty" placeholder="Speciality" className="w-full p-2 border rounded" onChange={handleChange} />
          <input name="topDegree" placeholder="Flagship degree program" className="w-full p-2 border rounded" onChange={handleChange} />
          <textarea name="about" placeholder="Write a description about the university" className="w-full p-2 border rounded" rows={4} onChange={handleChange} />
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <input name="addressLine1" placeholder="Street address" className="w-full p-2 border rounded" onChange={handleChange} />
          <input name="addressLine2" placeholder="Suite, building, etc. (optional)" className="w-full p-2 border rounded" onChange={handleChange} />
          <div className="text-sm text-gray-500 border p-4 rounded bg-gray-50">
            <strong>Location Benefits:</strong> Adding precise location details helps prospective students find your university and enhances visibility in search results.
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="bg-white p-6 border rounded shadow-sm">
          <h2 className="text-xl font-semibold mb-1 text-center">University Preview</h2>
          <p className="text-gray-500 text-center mb-6">Here's how your university will appear to students</p>
          <div className="max-w-md mx-auto border rounded overflow-hidden shadow">
            {formData.image && (
              <img
                src={URL.createObjectURL(formData.image)}
                alt="University"
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-1 rounded-full">{formData.specialty}</span>
                <span className="text-sm text-gray-500">Est. {formData.establishedYear}</span>
              </div>
              <h3 className="text-lg font-bold mb-1">{formData.universityName}</h3>
              <p className="text-sm text-gray-600 mb-2">📍 {formData.addressLine1}, {formData.addressLine2}</p>
              <p className="text-sm text-gray-700 mb-2">{formData.about}</p>
              <div className="flex justify-between items-center mt-4">
                <div className="flex items-center gap-1 text-sm text-blue-600">
                  <span>📘</span> <span>Top Programs</span>
                </div>
                <button className="text-sm text-blue-600 border border-blue-600 px-3 py-1 rounded hover:bg-blue-50">Details</button>
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-400 text-center mt-4">You can always edit these details later from your dashboard</p>
        </div>
      )}

      <div className="flex justify-between mt-8">
        <button onClick={prevStep} className="px-4 py-2 border rounded text-gray-600" disabled={step === 1}>Back</button>
        {step < 4 ? (
          <button onClick={nextStep} className="px-4 py-2 bg-blue-500 text-white rounded">Next</button>
        ) : (
          <button onClick={submitUniversity} className="px-4 py-2 bg-blue-500 text-white rounded">Submit</button>
        )}
      </div>
    </div>
  );
}
