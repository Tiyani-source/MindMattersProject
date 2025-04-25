import Patient from "../models/patientModel.js";
import jwt from "jsonwebtoken";
const { sign, verify } = jwt;

import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (id) => {
  return sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

export async function signup(req, res) {
  try {
    const { email, password } = req.body;

    const existing = await findOne({ email });
    if (existing) return res.status(400).json({ success: false, message: "Email already exists." });

    const patient = new Patient({ email, password });
    await patient.save();

    res.status(201).json({ success: true, message: "Signup successful!" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Signup failed", error: err.message });
  }
}

export async function googleAuth(req, res) {
  try {
    const { token } = req.body;
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    let patient = await findOne({ email: payload.email });

    if (!patient) {
      patient = await create({
        email: payload.email,
        googleId: payload.sub,
      });
    }

    const jwtToken = generateToken(patient._id);
    res.status(200).json({ success: true, token: jwtToken });
  } catch (err) {
    res.status(401).json({ success: false, message: "Google auth failed", error: err.message });
  }
}
