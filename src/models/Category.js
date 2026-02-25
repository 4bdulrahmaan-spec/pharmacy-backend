import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please add a category name'],
            unique: true,
            trim: true
        },
        description: {
            type: String,
            required: false
        },
        type: {
            type: String,
            enum: ['medicine', 'pet'],
            required: true
        }
    },
    {
        timestamps: true
    }
);

const Category = mongoose.model('Category', categorySchema);

export default Category;
