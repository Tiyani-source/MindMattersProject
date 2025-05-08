import stripe from "stripe";
import Payment from "../models/Payment.js";
import appointmentModel from "../models/appointmentModel.js";
import dotenv from "dotenv";

dotenv.config();

const stripeInstance = stripe(process.env.STRIPE_SECRET_KEY);

// Process Payment
export const processPayment = async (req, res) => {
    try {
        const { name, email, amount, appointmentId, currency = "LKR" } = req.body;

        // Create Stripe Payment Intent
        // const paymentIntent = await stripeInstance.paymentIntents.create({
        //     amount: amount * 100, // Convert amount to cents
        //     currency,
        //     payment_method_types: ["card"],
        // });

        // Store payment in DB with "pending" status
        const payment = new Payment({
            name,
            email,
            amount,
            currency,
            paymentIntentId: appointmentId,
            status: "successs",
        });

        await payment.save();
        await appointmentModel.findByIdAndUpdate(appointmentId, { payment: true })
        
        res.status(201).json({
            message: "Payment Success",
            payment,
        });
    } catch (error) {
        res.status(500).json({ message: "Payment failed", error });
    }
};

// Handle Stripe Webhook (Payment Success)
export const stripeWebhook = async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
        event = stripeInstance.webhooks.constructEvent(
            req.rawBody, 
            sig, 
            process.env.STRIPE_WEBHOOK_SECRET
        );

        // Handle the event
        if (event.type === "payment_intent.succeeded") {
            const paymentIntent = event.data.object;

            // Update payment status in DB
            await Payment.findOneAndUpdate(
                { paymentIntentId: paymentIntent.id },
                { status: "succeeded" }
            );

            console.log("Payment successful:", paymentIntent.id);
        }

        res.json({ received: true });
    } catch (err) {
        console.error("Webhook error:", err);
        res.status(400).json({ message: "Webhook error", error: err.message });
    }
};


// Get Payment Dashboard Data
export const getPaymentDashboard = async (req, res) => {
    try {
        const totalEarnings = await Payment.aggregate([{ $match: { status: "succeeded" } }, { $group: { _id: null, total: { $sum: "$amount" } } }]);
        const totalTransactions = await Payment.countDocuments();
        const pendingPayments = await Payment.countDocuments({ status: "pending" });
        const latestPayments = await Payment.find({removed: false}).sort({ createdAt: -1 }).limit(5);

        res.status(200).json({
            totalEarnings: totalEarnings[0]?.total || 0,
            totalTransactions,
            pendingPayments,
            latestPayments
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching payment dashboard", error });
    }
};

// Mark Payment as Completed
export const completePayment = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedPayment = await Payment.findByIdAndUpdate(id, { therapyCompleted: true });

        if (!updatedPayment) {
            return res.status(404).json({ message: "Payment not found" });
        }

        res.status(200).json({ message: "Payment marked as completed", updatedPayment });
    } catch (error) {
        res.status(500).json({ message: "Error updating payment status", error });
    }
};