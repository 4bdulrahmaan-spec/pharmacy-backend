import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import connectDB from './src/config/db.js';
import { notFound, errorHandler } from './src/middlewares/errorMiddleware.js';

import userRoutes from './src/routes/userRoutes.js';
import productRoutes from './src/routes/productRoutes.js';
import orderRoutes from './src/routes/orderRoutes.js';
import adminRoutes from './src/routes/adminRoutes.js';
import prescriptionRoutes from './src/routes/prescriptionRoutes.js';
import paymentRoutes from './src/routes/paymentRoutes.js';
import uploadRoutes from './src/routes/uploadRoutes.js';
import chatbotRoutes from './src/routes/chatbotRoutes.js';
import aiScannerRoutes from './src/routes/aiScannerRoutes.js';
import User from './src/models/User.js';
import Category from './src/models/Category.js';
import Product from './src/models/Product.js';
import Order from './src/models/Order.js';
import bcrypt from 'bcryptjs';

// Load env variables
dotenv.config();

// Connect to database and Start Server
const startServer = async () => {
    await connectDB();

    const app = express();
    const httpServer = http.createServer(app);

    // Configure Socket.IO
    const io = new Server(httpServer, {
        cors: {
            origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
            methods: ['GET', 'POST', 'PUT', 'DELETE'],
            credentials: true
        }
    });

    io.on('connection', (socket) => {
        console.log(`Socket Connected: ${socket.id}`);

        socket.on('join_order', (orderId) => {
            socket.join(orderId);
            console.log(`Socket ${socket.id} joined room ${orderId}`);
        });

        socket.on('disconnect', () => {
            console.log(`Socket Disconnected: ${socket.id}`);
        });
    });

    // Make io accessible in our routers
    app.set('io', io);

    // Middleware
    app.use(express.json());
    app.use(cors());
    app.use(helmet());
    app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
    app.use(morgan('dev'));

    // Routes
    app.use('/api/users', userRoutes);
    app.use('/api/products', productRoutes);
    app.use('/api/orders', orderRoutes);
    app.use('/api/admin', adminRoutes);
    app.use('/api/prescriptions', prescriptionRoutes);
    app.use('/api/payment', paymentRoutes);
    app.use('/api/upload', uploadRoutes);
    app.use('/api/chat', chatbotRoutes);
    app.use('/api/scan', aiScannerRoutes);

    app.get('/', (req, res) => {
        res.send('Pharmacy & Pet Shop API is running...');
    });

    app.get('/api/seed', async (req, res) => {
        try {
            await Order.deleteMany();
            await Product.deleteMany();
            await Category.deleteMany();
            await User.deleteMany();

            await User.create([
                { name: 'Admin User', email: 'admin@example.com', phone: '1234567890', password: '123456', role: 'admin' },
                { name: 'John Doe', email: 'john@example.com', phone: '0987654321', password: '123456' }
            ]);

            const categories = await Category.insertMany([
                { name: 'Tablets', type: 'medicine' }, { name: 'Syrups', type: 'medicine' }, { name: 'Injections', type: 'medicine' }, { name: 'Ointments', type: 'medicine' }, { name: 'Drops', type: 'medicine' }, { name: 'Pet Food', type: 'pet' }, { name: 'Pet Accessories', type: 'pet' }, { name: 'Pet Medicines', type: 'pet' }
            ]);

            await Product.insertMany([
                { name: 'Paracetamol 500mg', description: 'Used for pain relief and fever.', price: 50.0, stock: 100, category: categories[0]._id, brand: 'Generic', type: 'medicine', imageUrl: 'no-photo.jpg', requiresPrescription: false },
                { name: 'Amoxicillin 250mg', description: 'Antibiotic used to treat bacterial infections.', price: 120.0, stock: 50, category: categories[0]._id, brand: 'GlaxoSmithKline', type: 'medicine', imageUrl: 'no-photo.jpg', requiresPrescription: true },
                { name: 'Ibuprofen 400mg', description: 'Anti-inflammatory and pain reliever.', price: 60.0, stock: 150, category: categories[0]._id, brand: 'Advil', type: 'medicine', imageUrl: 'no-photo.jpg', requiresPrescription: false },
                { name: 'Cetirizine 10mg', description: 'Antihistamine for allergy relief.', price: 40.0, stock: 200, category: categories[0]._id, brand: 'Zyrtec', type: 'medicine', imageUrl: 'no-photo.jpg', requiresPrescription: false },
                { name: 'Azithromycin 500mg', description: 'Macrolide antibiotic.', price: 250.0, stock: 80, category: categories[0]._id, brand: 'Zithromax', type: 'medicine', imageUrl: 'no-photo.jpg', requiresPrescription: true },
                { name: 'Metformin 500mg', description: 'Used to treat type 2 diabetes.', price: 90.0, stock: 120, category: categories[0]._id, brand: 'Glucophage', type: 'medicine', imageUrl: 'no-photo.jpg', requiresPrescription: true },
                { name: 'Pantoprazole 40mg', description: 'Reduces stomach acid.', price: 110.0, stock: 140, category: categories[0]._id, brand: 'Protonix', type: 'medicine', imageUrl: 'no-photo.jpg', requiresPrescription: true },
                { name: 'Cough Syrup (100ml)', description: 'Relieves dry and chesty coughs.', price: 85.0, stock: 200, category: categories[1]._id, brand: 'Benadryl', type: 'medicine', imageUrl: 'no-photo.jpg', requiresPrescription: false },
                { name: 'Multivitamin Syrup (200ml)', description: 'Daily vitamin supplement.', price: 150.0, stock: 90, category: categories[1]._id, brand: 'SevenSeas', type: 'medicine', imageUrl: 'no-photo.jpg', requiresPrescription: false },
                { name: 'Antacid Syrup (170ml)', description: 'Relieves heartburn and indigestion.', price: 95.0, stock: 110, category: categories[1]._id, brand: 'Gelusil', type: 'medicine', imageUrl: 'no-photo.jpg', requiresPrescription: false },
                { name: 'Paracetamol Paediatric Syrup', description: 'Fever and pain relief for children.', price: 65.0, stock: 130, category: categories[1]._id, brand: 'Calpol', type: 'medicine', imageUrl: 'no-photo.jpg', requiresPrescription: false },
                { name: 'Insulin Glargine Pen', description: 'Long-acting insulin for diabetes.', price: 450.0, stock: 40, category: categories[2]._id, brand: 'Lantus', type: 'medicine', imageUrl: 'no-photo.jpg', requiresPrescription: true },
                { name: 'Tetanus Toxoid Vaccine', description: 'Prevents tetanus infection.', price: 35.0, stock: 60, category: categories[2]._id, brand: 'Biological E', type: 'medicine', imageUrl: 'no-photo.jpg', requiresPrescription: true },
                { name: 'Vitamin B12 Injection', description: 'Treats B12 deficiency.', price: 25.0, stock: 100, category: categories[2]._id, brand: 'Neurobion', type: 'medicine', imageUrl: 'no-photo.jpg', requiresPrescription: true },
                { name: 'Diclofenac Injection', description: 'Strong pain relief.', price: 30.0, stock: 85, category: categories[2]._id, brand: 'Voveran', type: 'medicine', imageUrl: 'no-photo.jpg', requiresPrescription: true },
                { name: 'Betamethasone Cream (20g)', description: 'Topical steroid for skin conditions.', price: 55.0, stock: 75, category: categories[3]._id, brand: 'Betnovate', type: 'medicine', imageUrl: 'no-photo.jpg', requiresPrescription: true },
                { name: 'Clotrimazole Cream (15g)', description: 'Antifungal cream.', price: 65.0, stock: 120, category: categories[3]._id, brand: 'Candid', type: 'medicine', imageUrl: 'no-photo.jpg', requiresPrescription: false },
                { name: 'Silver Sulfadiazine Cream', description: 'Used to treat burn wounds.', price: 85.0, stock: 50, category: categories[3]._id, brand: 'Silverex', type: 'medicine', imageUrl: 'no-photo.jpg', requiresPrescription: true },
                { name: 'Ciprofloxacin Eye Drops', description: 'Antibiotic eye drops.', price: 45.0, stock: 110, category: categories[4]._id, brand: 'Ciplox', type: 'medicine', imageUrl: 'no-photo.jpg', requiresPrescription: true },
                { name: 'Xylometazoline Nasal Drops', description: 'Relieves nasal congestion.', price: 55.0, stock: 140, category: categories[4]._id, brand: 'Otrivin', type: 'medicine', imageUrl: 'no-photo.jpg', requiresPrescription: false },
                { name: 'Premium Dog Food (3kg)', description: 'Nutritious dog food with real chicken meat.', price: 950.0, stock: 20, category: categories[5]._id, brand: 'Pedigree', type: 'pet', imageUrl: 'no-photo.jpg', requiresPrescription: false },
                { name: 'Cat Toy Set', description: 'Fun and engaging toys for your feline friend.', price: 250.0, stock: 15, category: categories[6]._id, brand: 'Petopia', type: 'pet', imageUrl: 'no-photo.jpg', requiresPrescription: false },
                { name: 'Flea and Tick Spot-On for Dogs', description: 'Kills fleas and ticks on contact.', price: 350.0, stock: 30, category: categories[7]._id, brand: 'Frontline', type: 'pet', imageUrl: 'no-photo.jpg', requiresPrescription: true },
                { name: 'Deworming Tablets for Cats', description: 'Broad-spectrum dewormer.', price: 120.0, stock: 50, category: categories[7]._id, brand: 'Drontal', type: 'pet', imageUrl: 'no-photo.jpg', requiresPrescription: true }
            ]);

            res.json({ message: 'Data Imported!' });
        } catch (error) {
            res.status(500).json({ message: 'Seeding failed', error: error.message });
        }
    });

    // Error Handling Middleware
    app.use(notFound);
    app.use(errorHandler);

    // Start the server
    if (process.env.NODE_ENV !== 'production') {
        const PORT = process.env.PORT || 5000;
        httpServer.listen(PORT, () => {
            console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
        });
    }

    return app;
};

export default startServer();
// Triggered nodemon restart to load new Cloudinary .env variables
