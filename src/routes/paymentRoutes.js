import express from 'express';
import razorpay from 'razorpay';
import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

let instance;
try {
    instance = new razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
} catch (error) {
    console.error("Razorpay Initialization Error. Make sure keys are present in .env");
}

// @desc    Create a Razorpay Order
// @route   POST /api/payment/create-order
// @access  Private
router.post('/create-order', async (req, res) => {
    try {
        if (!instance) {
            return res.status(500).json({ message: "Razorpay instance not initialized on backend." });
        }

        const { amount } = req.body;

        // Amount must be in the smallest currency unit (paise for INR)
        const options = {
            amount: Math.round(amount * 100),
            currency: "INR",
            receipt: `receipt_order_${Date.now()}`
        };

        const order = await instance.orders.create(options);

        if (!order) return res.status(500).send("Some error occurred generating razorpay order");

        res.status(200).json(order);
    } catch (error) {
        console.error("Razorpay create-order error", error);
        res.status(500).json({ message: error.message || "Failed to create order" });
    }
});

// @desc    Verify Payment Signature from Razorpay
// @route   POST /api/payment/verify
// @access  Private
router.post('/verify', async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        // Create the expected signature using Crypto
        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(sign.toString())
            .digest("hex");

        if (razorpay_signature === expectedSign) {
            return res.status(200).json({ message: "Payment verified successfully", verified: true });
        } else {
            return res.status(400).json({ message: "Invalid signature sent! Payment verification failed.", verified: false });
        }
    } catch (error) {
        console.error("Razorpay verify error", error);
        res.status(500).json({ message: error.message || "Failed to verify signature" });
    }
});

export default router;
