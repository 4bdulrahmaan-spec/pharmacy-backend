import mongoose from 'mongoose';

const prescriptionSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: true
        },
        imageUrl: {
            type: String,
            required: [true, 'Please upload a prescription image or pdf']
        },
        status: {
            type: String,
            enum: ['Pending', 'Approved', 'Rejected'],
            default: 'Pending'
        },
        adminNotes: {
            type: String
        }
    },
    {
        timestamps: true
    }
);

const Prescription = mongoose.model('Prescription', prescriptionSchema);

export default Prescription;
