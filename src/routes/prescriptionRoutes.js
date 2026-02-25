import express from 'express';
import {
    uploadPrescription,
    getPrescriptions,
    getMyPrescriptions,
    updatePrescriptionStatus
} from '../controllers/prescriptionController.js';
import { protect, admin } from '../middlewares/authMiddleware.js';
import upload from '../middlewares/uploadMiddleware.js';

const router = express.Router();

router.route('/')
    .post(protect, upload.single('image'), uploadPrescription)
    .get(protect, admin, getPrescriptions);

router.route('/my').get(protect, getMyPrescriptions);

router.route('/:id').put(protect, admin, updatePrescriptionStatus);

export default router;
