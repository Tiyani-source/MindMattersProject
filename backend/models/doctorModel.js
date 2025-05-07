import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema({

  name: { type: String, required: true }, // full name (can be composed of first + last)
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // will hash later


  profilePicture: { type: String, default: "" }, // cloudinary or local URL


  speciality: { type: String, required: true },
  degree: { type: String, required: true },
  experience: { type: String, required: true },
  qualifications: { type: String }, // optional extra field
  about: { type: String, required: true },
  universityId: { type: String, required: true },
  doctorId: { type: String, required: true, unique: true },


  available: { type: Boolean, default: true },
  fees: { type: Number, required: true },
  slots_booked: {
    type: Map,
    of: {
      type: Map,
      of: Boolean
    },
    default: new Map()
  },


  address: { type: Object, required: true }, // full address object: street, city, etc.
  gender: { type: String }, // optional if desired
  phone: { type: String },


  documents: { type: String }, // cloudinary doc url


  date: { type: Number, default: () => Date.now() },


  // Google Calendar Integration Fields
  googleCalendarToken: { type: String, default: null },
  googleCalendarRefreshToken: { type: String, default: null },
  googleCalendarConnected: { type: Boolean, default: false }
}, { minimize: false });

const doctorModel = mongoose.models.doctor || mongoose.model("doctor", doctorSchema);
export default doctorModel;
