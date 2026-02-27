import express from 'express';
import multer from 'multer';
import csvParser from 'csv-parser';
import stream from 'stream';
import upload from '../middlewares/uploadMiddleware.js';
import { protect, admin } from '../middlewares/authMiddleware.js';
import Product from '../models/Product.js';
import Category from '../models/Category.js';

const router = express.Router();

// Existing Cloudinary image upload
router.post('/', protect, admin, upload.single('image'), (req, res) => {
    if (req.file) {
        res.send({ imageUrl: req.file.path });
    } else {
        res.status(400).send({ message: 'No image file provided' });
    }
});

// Configure a simple memory storage for CSV files
const csvUpload = multer({ storage: multer.memoryStorage() });

// --- Bulk CSV Importer ---
router.post('/csv', protect, admin, csvUpload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send({ message: 'No CSV file provided' });
    }

    const results = [];
    const bufferStream = new stream.PassThrough();
    bufferStream.end(req.file.buffer);

    try {
        // Find default category to tie new products to if they don't have one
        const defaultCategory = await Category.findOne({});
        if (!defaultCategory) {
            return res.status(400).send({ message: 'No categories exist in DB. Please create one first.' });
        }

        bufferStream
            .pipe(csvParser({
                mapHeaders: ({ header }) => header.trim().replace(/^[\u200B\u200C\u200D\u200E\u200F\uFEFF]/, '')
            }))
            .on('data', (data) => {
                // Map the raw CSV rows into Mongoose Product schemas
                if (data.name && data.price) {
                    results.push({
                        name: data.name,
                        price: Number(data.price) || 0,
                        description: data.description || 'No description provided',
                        stock: Number(data.stock) || 0,
                        brand: data.brand || 'Generic',
                        imageUrl: data.imageUrl || 'no-photo.jpg',
                        category: defaultCategory._id, // Ideally, you would lookup Category by name here, keep it simple for now
                        type: data.type || 'medicine',
                        requiresPrescription: String(data.requiresPrescription).toLowerCase() === 'true'
                    });
                }
            })
            .on('end', async () => {
                try {
                    if (results.length === 0) {
                        return res.status(400).send({ message: 'The CSV file was empty or improperly formatted.' });
                    }

                    // Bulk insert all products
                    const insertedProducts = await Product.insertMany(results);
                    res.status(201).send({
                        message: `Successfully imported ${insertedProducts.length} products!`,
                        count: insertedProducts.length
                    });
                } catch (dbError) {
                    console.error("Bulk Insert Error:", dbError);
                    res.status(500).send({ message: 'Database error storing CSV products.' });
                }
            })
            .on('error', (err) => {
                console.error("CSV Parse Error", err);
                res.status(500).send({ message: 'Error parsing the CSV file.' });
            });

    } catch (error) {
        console.error('CSV Upload Route Error:', error);
        res.status(500).send({ message: 'Server error processing CSV.' });
    }
});

export default router;
