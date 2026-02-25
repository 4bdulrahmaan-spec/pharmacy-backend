import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema(
    {
        code: {
            type: String,
            required: [true, 'Please enter a coupon code'],
            unique: true,
            trim: true,
            uppercase: true
        },
        discount: {
            type: Number,
            required: [true, 'Please enter discount percentage or fixed amount']
        },
        discountType: {
            type: String,
            enum: ['percentage', 'fixed'],
            default: 'percentage'
        },
        expiryDate: {
            type: Date,
            required: [true, 'Please enter expiry date']
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

const Coupon = mongoose.model('Coupon', couponSchema);

export default Coupon;
