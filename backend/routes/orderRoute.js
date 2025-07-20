import express from 'express';
import {
verifyRazorpay,  verifyStripe, placeOrder, placeOrderRazorpay, placeOrderStripe, allOrders, userOrders, updateStatus} from '../controllers/orderController.js';
import adminAuth from '../middleware/adminAuth.js';
import authUser from '../middleware/auth.js';

const orderRouter = express.Router();
//Admin Features
orderRouter.post('/list', adminAuth, allOrders);
orderRouter.post('/status', adminAuth, updateStatus);
orderRouter.post('/place', authUser, placeOrder);
orderRouter.post('/razorpay', authUser, placeOrderRazorpay);
orderRouter.post('/stripe', authUser, placeOrderStripe);
orderRouter.post('/userorders', authUser, userOrders);

//verify payment
orderRouter.post('/verifyStripe', authUser, verifyStripe);
orderRouter.post('/verifyRazorpay', authUser, verifyRazorpay);


export default orderRouter;