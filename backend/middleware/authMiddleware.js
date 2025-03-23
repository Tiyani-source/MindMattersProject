import jwt from 'jsonwebtoken';
import User from '../models/userModel.js'; // Assuming you have a user model

// user authentication middleware
const authUser = async (req, res, next) => {
    const { token } = req.headers;
    if (!token) {
        return res.json({ success: false, message: 'Not Authorized. Login Again' });
    }
    try {
        const token_decode = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(token_decode.id).select('-password'); // Fetch user and attach to req.user
        next();
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

export default authUser;