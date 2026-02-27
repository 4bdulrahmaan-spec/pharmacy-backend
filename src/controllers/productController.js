import Product from '../models/Product.js';
import Category from '../models/Category.js';
import asyncHandler from 'express-async-handler';

// @desc    Fetch all products with filtering, search, and sorting
// @route   GET /api/products
// @access  Public
export const getProducts = asyncHandler(async (req, res) => {
    const { keyword, category, type, sort } = req.query;

    let query = {};

    if (keyword) {
        query.name = { $regex: keyword, $options: 'i' };
    }

    if (category) {
        query.category = category;
    }

    if (type) {
        query.type = type;
    }

    let sortCriteria = {};
    if (sort === 'price_asc') {
        sortCriteria.price = 1;
    } else if (sort === 'price_desc') {
        sortCriteria.price = -1;
    } else {
        sortCriteria.createdAt = -1; // Newest first
    }

    const products = await Product.find(query).populate('category', 'name').sort(sortCriteria);
    res.json(products);
});

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
export const getProductById = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id).populate('category', 'name');

    if (product) {
        res.json(product);
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = asyncHandler(async (req, res) => {
    const product = new Product({
        name: req.body.name,
        price: req.body.price,
        description: req.body.description,
        imageUrl: req.body.imageUrl,
        brand: req.body.brand,
        category: req.body.category,
        stock: req.body.stock,
        type: req.body.type,
        discount: req.body.discount,
        requiresPrescription: req.body.requiresPrescription || false,
        barcode: req.body.barcode || undefined
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (product) {
        product.name = req.body.name || product.name;
        product.price = req.body.price || product.price;
        product.description = req.body.description || product.description;
        product.imageUrl = req.body.imageUrl || product.imageUrl;
        product.brand = req.body.brand || product.brand;
        product.category = req.body.category || product.category;
        product.stock = req.body.stock || product.stock;
        product.type = req.body.type || product.type;
        product.discount = req.body.discount || product.discount;
        if (req.body.requiresPrescription !== undefined) {
            product.requiresPrescription = req.body.requiresPrescription;
        }
        if (req.body.barcode !== undefined) {
            product.barcode = req.body.barcode || undefined;
        }

        const updatedProduct = await product.save();
        res.json(updatedProduct);
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (product) {
        await Product.deleteOne({ _id: product._id });
        res.json({ message: 'Product removed' });
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
});

// @desc    Fetch categories
// @route   GET /api/products/categories
// @access  Public
export const getCategories = asyncHandler(async (req, res) => {
    const categories = await Category.find({});
    res.json(categories);
});

// @desc    Create a category
// @route   POST /api/products/categories
// @access  Private/Admin
export const createCategory = asyncHandler(async (req, res) => {
    const { name, description, type } = req.body;
    const categoryExists = await Category.findOne({ name });
    if (categoryExists) {
        res.status(400);
        throw new Error('Category already exists');
    }
    const category = await Category.create({ name, description, type });
    res.status(201).json(category);
});
