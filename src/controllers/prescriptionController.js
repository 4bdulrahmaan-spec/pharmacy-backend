import Prescription from '../models/Prescription.js';

// @desc    Upload a new prescription
// @route   POST /api/prescriptions
// @access  Private
export const uploadPrescription = async (req, res) => {
    if (!req.file) {
        res.status(400);
        throw new Error('No file uploaded');
    }

    const prescription = new Prescription({
        user: req.user._id,
        imageUrl: req.file.path // URL from Cloudinary via multer storage
    });

    const createdPrescription = await prescription.save();
    res.status(201).json(createdPrescription);
};

// @desc    Get all prescriptions (Admin)
// @route   GET /api/prescriptions
// @access  Private/Admin
export const getPrescriptions = async (req, res) => {
    const prescriptions = await Prescription.find({})
        .populate('user', 'name email')
        .populate('products.product', 'name price imageUrl brand stock');
    res.json(prescriptions);
};

// @desc    Get user's own prescriptions
// @route   GET /api/prescriptions/my
// @access  Private
export const getMyPrescriptions = async (req, res) => {
    const prescriptions = await Prescription.find({ user: req.user._id })
        .populate('products.product', 'name price imageUrl brand stock');
    res.json(prescriptions);
};

// @desc    Update prescription status (Approve/Reject)
// @route   PUT /api/prescriptions/:id
// @access  Private/Admin
export const updatePrescriptionStatus = async (req, res) => {
    const prescription = await Prescription.findById(req.params.id);

    if (prescription) {
        prescription.status = req.body.status || prescription.status;
        prescription.adminNotes = req.body.adminNotes || prescription.adminNotes;

        if (req.body.products) {
            prescription.products = req.body.products;
        }

        const updatedPrescription = await prescription.save();
        res.json(updatedPrescription);
    } else {
        res.status(404);
        throw new Error('Prescription not found');
    }
};
