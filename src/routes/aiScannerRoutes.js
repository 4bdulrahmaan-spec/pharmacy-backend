import express from 'express';
import multer from 'multer';
import { scanMedicineBox } from '../controllers/aiScannerController.js';
import { protect, admin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Configure multer to store files in memory as buffers so we can pass them directly to Gemini
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// Route: POST /api/scan
// Protected to admin only
router.post('/', protect, admin, upload.single('image'), scanMedicineBox);

export default router;
