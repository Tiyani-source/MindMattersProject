import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";
import userModel from "../models/userModel.js";
import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";
import appointmentsModel from "../models/appointmentsModel.js";
import therapistModel from '../models/therapistModel.js';
import therapistAvailabilityModel from "../models/therapistAvailabilityModel.js";
import clientModel from "../models/clientModel.js";
import { v2 as cloudinary } from 'cloudinary'
import stripe from "stripe";
import razorpay from 'razorpay';






// Gateway Initialize
const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY)
const razorpayInstance = new razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
})

// API to register user
const registerUser = async (req, res) => {

    try {
        const { name, email, password } = req.body;

        // checking for all data to register user
        if (!name || !email || !password) {
            return res.json({ success: false, message: 'Missing Details' })
        }

        // validating email format
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please enter a valid email" })
        }

        // validating strong password
        if (password.length < 8) {
            return res.json({ success: false, message: "Please enter a strong password" })
        }

        // hashing user password
        const salt = await bcrypt.genSalt(10); // the more no. round the more time it will take
        const hashedPassword = await bcrypt.hash(password, salt)

        const userData = {
            name,
            email,
            password: hashedPassword,
        }

        const newUser = new userModel(userData)
        const user = await newUser.save()
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)

        res.json({ success: true, token })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to login user
const loginUser = async (req, res) => {

    try {
        const { email, password } = req.body;
        const user = await userModel.findOne({ email })

        if (!user) {
            return res.json({ success: false, message: "User does not exist" })
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if (isMatch) {
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)
            res.json({ success: true, token })
        }
        else {
            res.json({ success: false, message: "Invalid credentials" })
        }
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}
const getUserTherapistAppointments = async (req, res) => {
    try {
      const { token } = req.headers;
      if (!token) return res.status(401).json({ success: false, message: "Unauthorized" });
  
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.id;
  
      const appointments = await appointmentsModel
        .find({ clientID: userId, statusOfAppointment: { $ne: "cancelled" } })
        .populate("therapistID", "name image address speciality")
  
      res.status(200).json({ success: true, appointments });
    } catch (err) {
      console.error("Error fetching user appointments:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  };
  
  export { getUserTherapistAppointments };



// Book Therapist Appointment
export const bookTherapist = async (req, res) => {
    try {
        const { clientID, therapistID, date, time, typeOfAppointment, meetingLink } = req.body;
  
        const therapist = await therapistModel.findById(therapistID);
        if (!therapist) return res.json({ success: false, message: "Therapist not found" });
  
        const amount = therapist.fees;
  
        // 🕒 Calculate endTime +1 hour
        const [hour, minute] = time.split(":").map(Number);
        const endHour = (hour + 1) % 24;
        const endTime = `${endHour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
  
        // Save appointment
        const appointment = new appointmentsModel({
            clientID,
            therapistID,
            typeOfAppointment,
            meetingLink,
            date,
            timeSlot: {
                startTime: time,
                endTime: endTime // ✅ Proper value instead of empty string
            },
            amount
        });
        await appointment.save();
  
        // Mark availability as booked
        await therapistAvailabilityModel.updateOne(
            { therapistId: therapistID, date, time, type: typeOfAppointment === 'online' ? 'Online' : 'In-Person' },
            { $set: { isBooked: true } }
        );
  
        // Create client-therapist relationship if doesn't exist
        const existingRelation = await clientModel.findOne({ therapistID, clientID });
        if (!existingRelation) {
            await clientModel.create({ therapistID, clientID, clientStatus: "ongoing" });
        }
  
        res.json({ success: true, message: "Appointment booked successfully" });
    } catch (err) {
        console.error("Booking error:", err);
        res.json({ success: false, message: err.message });
    }
  };

// Reschedule Therapist Appointment
export const rescheduleAppointment = async (req, res) => {
  try {
      const { appointmentId, newDate, newTime, typeOfAppointment } = req.body;

      const updated = await appointmentsModel.findByIdAndUpdate(appointmentId, {
          date: newDate,
          timeSlot: { startTime: newTime, endTime: "" },
          typeOfAppointment
      }, { new: true });

      if (!updated) return res.json({ success: false, message: "Appointment not found" });

      res.json({ success: true, message: "Appointment rescheduled" });
  } catch (err) {
      res.json({ success: false, message: err.message });
  }
};

// Cancel Therapist Appointment
export const cancelTherapistAppointment = async (req, res) => {
  try {
      const { appointmentId } = req.body;

      const appointment = await appointmentsModel.findByIdAndUpdate(appointmentId, {
          statusOfAppointment: "cancelled",
          cancelledBy: "client"
      });

      if (!appointment) return res.json({ success: false, message: "Appointment not found" });

      res.json({ success: true, message: "Appointment cancelled" });
  } catch (err) {
      res.json({ success: false, message: err.message });
  }
};

// Get Therapist Meeting Link
export const getMeetingLink = async (req, res) => {
  try {
      const { appointmentId } = req.body;

      const appointment = await appointmentsModel.findById(appointmentId).populate("therapistID", "name");
      if (!appointment || appointment.statusOfAppointment === "cancelled") {
          return res.json({ success: false, message: "Invalid or cancelled appointment" });
      }

      res.json({ success: true, meetingLink: appointment.meetingLink });
  } catch (err) {
      res.json({ success: false, message: err.message });
  }
};

// API to get user profile data
const getProfile = async (req, res) => {

    try {
        const { userId } = req.body
        const userData = await userModel.findById(userId).select('-password')

        res.json({ success: true, userData })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to update user profile
const updateProfile = async (req, res) => {

    try {

        const { userId, name, phone, address, dob, gender } = req.body
        const imageFile = req.file

        if (!name || !phone || !dob || !gender) {
            return res.json({ success: false, message: "Data Missing" })
        }

        await userModel.findByIdAndUpdate(userId, { name, phone, address: JSON.parse(address), dob, gender })

        if (imageFile) {

            // upload image to cloudinary
            const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" })
            const imageURL = imageUpload.secure_url

            await userModel.findByIdAndUpdate(userId, { image: imageURL })
        }

        res.json({ success: true, message: 'Profile Updated' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to book appointment 
const bookAppointment = async (req, res) => {

    try {

        const { userId, docId, slotDate, slotTime } = req.body
        const docData = await doctorModel.findById(docId).select("-password")

        if (!docData.available) {
            return res.json({ success: false, message: 'Doctor Not Available' })
        }

        let slots_booked = docData.slots_booked

        // checking for slot availablity 
        if (slots_booked[slotDate]) {
            if (slots_booked[slotDate].includes(slotTime)) {
                return res.json({ success: false, message: 'Slot Not Available' })
            }
            else {
                slots_booked[slotDate].push(slotTime)
            }
        } else {
            slots_booked[slotDate] = []
            slots_booked[slotDate].push(slotTime)
        }

        const userData = await userModel.findById(userId).select("-password")

        delete docData.slots_booked

        const appointmentData = {
            userId,
            docId,
            userData,
            docData,
            amount: docData.fees,
            slotTime,
            slotDate,
            date: Date.now()
        }

        const newAppointment = new appointmentModel(appointmentData)
        await newAppointment.save()

        // save new slots data in docData
        await doctorModel.findByIdAndUpdate(docId, { slots_booked })

        res.json({ success: true, message: 'Appointment Booked' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}

// API to cancel appointment
const cancelAppointment = async (req, res) => {
    try {

        const { userId, appointmentId } = req.body
        const appointmentData = await appointmentModel.findById(appointmentId)

        // verify appointment user 
        if (appointmentData.userId !== userId) {
            return res.json({ success: false, message: 'Unauthorized action' })
        }

        await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true })

        // releasing doctor slot 
        const { docId, slotDate, slotTime } = appointmentData

        const doctorData = await doctorModel.findById(docId)

        let slots_booked = doctorData.slots_booked

        slots_booked[slotDate] = slots_booked[slotDate].filter(e => e !== slotTime)

        await doctorModel.findByIdAndUpdate(docId, { slots_booked })

        res.json({ success: true, message: 'Appointment Cancelled' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to get user appointments for frontend my-appointments page
const listAppointment = async (req, res) => {
    try {

        const { userId } = req.body
        const appointments = await appointmentModel.find({ userId })

        res.json({ success: true, appointments })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to make payment of appointment using razorpay
const paymentRazorpay = async (req, res) => {
    try {

        const { appointmentId } = req.body
        const appointmentData = await appointmentModel.findById(appointmentId)

        if (!appointmentData || appointmentData.cancelled) {
            return res.json({ success: false, message: 'Appointment Cancelled or not found' })
        }

        // creating options for razorpay payment
        const options = {
            amount: appointmentData.amount * 100,
            currency: process.env.CURRENCY,
            receipt: appointmentId,
        }

        // creation of an order
        const order = await razorpayInstance.orders.create(options)

        res.json({ success: true, order })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to verify payment of razorpay
const verifyRazorpay = async (req, res) => {
    try {
        const { razorpay_order_id } = req.body
        const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id)

        if (orderInfo.status === 'paid') {
            await appointmentModel.findByIdAndUpdate(orderInfo.receipt, { payment: true })
            res.json({ success: true, message: "Payment Successful" })
        }
        else {
            res.json({ success: false, message: 'Payment Failed' })
        }
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to make payment of appointment using Stripe
const paymentStripe = async (req, res) => {
    try {

        const { appointmentId } = req.body
        const { origin } = req.headers

        const appointmentData = await appointmentModel.findById(appointmentId)

        if (!appointmentData || appointmentData.cancelled) {
            return res.json({ success: false, message: 'Appointment Cancelled or not found' })
        }

        const currency = process.env.CURRENCY.toLocaleLowerCase()

        const line_items = [{
            price_data: {
                currency,
                product_data: {
                    name: "Appointment Fees"
                },
                unit_amount: appointmentData.amount * 100
            },
            quantity: 1
        }]

        const session = await stripeInstance.checkout.sessions.create({
            success_url: `${origin}/verify?success=true&appointmentId=${appointmentData._id}`,
            cancel_url: `${origin}/verify?success=false&appointmentId=${appointmentData._id}`,
            line_items: line_items,
            mode: 'payment',
        })

        res.json({ success: true, session_url: session.url });

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

const verifyStripe = async (req, res) => {
    try {

        const { appointmentId, success } = req.body

        if (success === "true") {
            await appointmentModel.findByIdAndUpdate(appointmentId, { payment: true })
            return res.json({ success: true, message: 'Payment Successful' })
        }

        res.json({ success: false, message: 'Payment Failed' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}

export {
    loginUser,
    registerUser,
    getProfile,
    updateProfile,
    bookAppointment,
    listAppointment,
    cancelAppointment,
    paymentRazorpay,
    verifyRazorpay,
    paymentStripe,
    verifyStripe
}
