import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Prescription from '../models/Prescription.js';

// @desc    Get complete admin dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private/Admin
export const getDashboardStats = async (req, res) => {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalProducts = await Product.countDocuments();

    const orders = await Order.find({});
    const totalOrders = orders.length;
    const totalSales = orders.reduce((acc, item) => acc + (item.isPaid ? item.totalPrice : 0), 0);

    const pendingPrescriptions = await Prescription.countDocuments({ status: 'Pending' });
    const lowStockAlerts = await Product.find({ stock: { $lte: 5 } }).select('name stock');

    res.json({
        totalUsers,
        totalProducts,
        totalOrders,
        totalSales,
        pendingPrescriptions,
        lowStockAlerts
    });
};
