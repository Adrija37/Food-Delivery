import Razorpay from "razorpay";
import crypto from "crypto";
import orderModel from "../models/orderModel.js";
import userModel from "../models/userModels.js";

const placeOrder = async (req, res) => {

    const frontend_url = "http://localhost:5174";
    try {
        const { items, amount, address } = req.body;

        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            return res.json({ success: false, message: "Razorpay keys are missing" });
        }

        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        });

        const newOrder = new orderModel({
            userId: req.userId,
            items,
            amount,
            address
        });

        await newOrder.save();

        const razorpayOrder = await razorpay.orders.create({
            amount: Math.round(Number(amount) * 100),
            currency: "INR",
            receipt: newOrder._id.toString()
        });

        await orderModel.findByIdAndUpdate(newOrder._id, {
            razorpayOrderId: razorpayOrder.id
        });

        res.json({
            success: true,
            orderId: newOrder._id,
            razorpayOrderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            key: process.env.RAZORPAY_KEY_ID
        });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
};

const verifyOrder = async (req, res) => {
    try {
        const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        if (!process.env.RAZORPAY_KEY_SECRET) {
            return res.json({ success: false, message: "Razorpay secret is missing" });
        }

        const generatedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest("hex");

        if (generatedSignature !== razorpay_signature) {
            return res.json({ success: false, message: "Payment verification failed" });
        }

        const updatedOrder = await orderModel.findOneAndUpdate(
            { _id: orderId, userId: req.userId, razorpayOrderId: razorpay_order_id },
            {
                payment: true,
                razorpayPaymentId: razorpay_payment_id
            }
        );

        if (!updatedOrder) {
            return res.json({ success: false, message: "Order not found" });
        }

        await userModel.findByIdAndUpdate(req.userId, { cartData: {} });

        res.json({ success: true, message: "Payment verified" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
};
const userOrders = async (req, res) => {
    try {

        const orders = await orderModel.find({
            userId: req.userId
        });

        res.json({
            success: true,
            data: orders
        });

    } catch (error) {
        console.log(error);

        res.json({
            success: false,
            message: "Error"
        });
    }
};
// listing orders for admin panel
const listOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({});
        res.json({ success: true, data: orders });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
}

// API for updating order status
const updateStatus = async (req, res) => {
    try {
        await orderModel.findByIdAndUpdate(req.body.orderId, { status: req.body.status });
        res.json({ success: true, message: "Status Updated" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
}
export { placeOrder, verifyOrder, userOrders, listOrders,updateStatus };
