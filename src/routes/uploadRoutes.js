import express from 'express';
import upload from '../middlewares/uploadMiddleware.js';
import { protect, admin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', protect, admin, upload.single('image'), (req, res) => {
    if (req.file) {
        res.send({ imageUrl: req.file.path });
    } else {
        res.status(400).send({ message: 'No image file provided' });
    }
});

export default router;
