import { Schema, model } from "mongoose";
import { hash, compare } from "bcryptjs";

const patientSchema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String },
  googleId: { type: String },
}, { timestamps: true });

patientSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await hash(this.password, 10);
  next();
});

patientSchema.methods.comparePassword = async function (enteredPassword) {
  return await compare(enteredPassword, this.password);
};

export default model("Patient", patientSchema);
