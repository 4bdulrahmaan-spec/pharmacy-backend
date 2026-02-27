import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please add a product name'],
            trim: true
        },
        description: {
            type: String,
            required: [true, 'Please add a description']
        },
        price: {
            type: Number,
            required: [true, 'Please add a price']
        },
        discount: {
            type: Number,
            default: 0
        },
        stock: {
            type: Number,
            required: [true, 'Please add stock quantity'],
            default: 0
        },
        category: {
            type: mongoose.Schema.ObjectId,
            ref: 'Category',
            required: true
        },
        requiresPrescription: {
            type: Boolean,
            default: false
        },
        imageUrl: {
            type: String,
            default: 'no-photo.jpg'
        },
        brand: {
            type: String,
            required: false
        },
        type: {
            type: String,
            enum: ['medicine', 'pet'],
            required: true
        },
        barcode: {
            type: String,
            trim: true,
            sparse: true,
            unique: true
        }
    },
    {
        timestamps: true
    }
);

const Product = mongoose.model('Product', productSchema);

export default Product;
