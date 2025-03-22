import React, { useContext, useState } from "react";
import { assets } from "../../assets/assets";
import { toast } from "react-toastify";
import axios from "axios";
import { AdminContext } from "../../context/AdminContext";
import { AppContext } from "../../context/AppContext";

const AddUni = () => {
  const [uniImg, setUniImg] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [established, setEstablished] = useState("2000");
  const [fees, setFees] = useState("");
  const [about, setAbout] = useState("");
  const [speciality, setSpeciality] = useState("Engineering");
  const [degree, setDegree] = useState("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [uploadedFile, setUploadedFile] = useState("");

  const { backendUrl } = useContext(AppContext);
  const { aToken } = useContext(AdminContext);

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    try {
      if (!uniImg) {
        return toast.error("Image Not Selected");
      }

      const formData = new FormData();
      formData.append("image", uniImg);
      formData.append("name", name);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("established", established);
      formData.append("fees", Number(fees));
      formData.append("about", about);
      formData.append("speciality", speciality);
      formData.append("degree", degree);
      formData.append("address", JSON.stringify({ line1: address1, line2: address2 }));
      if (uploadedFile) {
        formData.append("file", uploadedFile);
      }

      const { data } = await axios.post(
        backendUrl + "/api/admin/add-university",
        formData,
        { headers: { aToken } }
      );
      if (data.success) {
        toast.success(data.message);
        setUniImg(false);
        setName("");
        setPassword("");
        setEmail("");
        setAddress1("");
        setAddress2("");
        setDegree("");
        setAbout("");
        setFees("");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
      console.log(error);
    }
  };

  return (
    <form onSubmit={onSubmitHandler} className="w-full">
      <h2 className="mb-3 text-2xl font-medium mt-5 ml-4 pt-5">Add University</h2>
      <div className="m-4">
        <div className="bg-white px-8 py-8 border rounded w-full max-h-[80vh] overflow-y-scroll">
          <div className="flex items-center gap-4 mb-8 text-gray-500">
            <label htmlFor="uni-img">
              <img
                className="w-16 bg-gray-100 rounded-full cursor-pointer"
                src={uniImg ? URL.createObjectURL(uniImg) : assets.upload_area}
                alt="University Logo"
              />
            </label>
            <input
              onChange={(e) => setUniImg(e.target.files[0])}
              type="file"
              id="uni-img"
              hidden
            />
            <p className="text-gray-500">Upload University Logo</p>
          </div>

          <div className="flex flex-col lg:flex-row items-start gap-10 text-gray-600">
            <div className="w-full lg:flex-1 flex flex-col gap-4">
              <p>University Name</p>
              <input onChange={(e) => setName(e.target.value)} value={name} className="border rounded px-3 py-2" type="text" placeholder="University Name" required />
              <p>Email</p>
              <input onChange={(e) => setEmail(e.target.value)} value={email} className="border rounded px-3 py-2" type="email" placeholder="Email" required />
              <p>Password</p>
              <input onChange={(e) => setPassword(e.target.value)} value={password} className="border rounded px-3 py-2" type="password" placeholder="Password" required />
              <p>Established Year</p>
              <input onChange={(e) => setEstablished(e.target.value)} value={established} className="border rounded px-3 py-2" type="number" placeholder="Established Year" required />
              <p>University Fees</p>
              <input onChange={(e) => setFees(e.target.value)} value={fees} className="border rounded px-3 py-2" type="number" placeholder="University Fees" required />
            </div>
            <div className="w-full lg:flex-1 flex flex-col gap-4">
              <p>Speciality</p>
              <select onChange={(e) => setSpeciality(e.target.value)} value={speciality} className="border rounded px-2 py-2">
                <option value="Engineering">Engineering</option>
                <option value="Medical">Medical</option>
                <option value="Arts">Arts</option>
                <option value="Science">Science</option>
                <option value="Business">Business</option>
              </select>
              <p>Degree Offered</p>
              <input onChange={(e) => setDegree(e.target.value)} value={degree} className="border rounded px-3 py-2" type="text" placeholder="Degree Offered" required />
              <p>Address Line 1</p>
              <input onChange={(e) => setAddress1(e.target.value)} value={address1} className="border rounded px-3 py-2" type="text" placeholder="Address 1" required />
              <p>Address Line 2</p>
              <input onChange={(e) => setAddress2(e.target.value)} value={address2} className="border rounded px-3 py-2" type="text" placeholder="Address 2" required />
              <p>Upload Documents</p>
              <input type="file" onChange={(e) => setUploadedFile(e.target.files[0])} className="border rounded px-3 py-2 text-gray-400 opacity-75" accept=".pdf,.doc,.docx,.txt" required />
            </div>
          </div>
          <p>About University</p>
          <textarea onChange={(e) => setAbout(e.target.value)} value={about} className="w-full px-1 pt-1 border rounded" rows={5} placeholder="Write about university"></textarea>
          <button type="submit" className="bg-primary px-10 py-3 mt-4 text-white rounded-full">Add University</button>
        </div>
      </div>
    </form>
  );
};

export default AddUni;