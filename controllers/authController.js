const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { JWT_SECRET, NODE_ENV } = require('../utils/config');



const authController = {
register: async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({ name, email, password: hashedPassword });
        await newUser.save();

        // ✅ IMPORTANT FIX: don't break API if email fails
       

        // ✅ Always send success
        res.status(201).json({ message: 'User registered successfully' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error registering user' });
    }
},
    login: async (req, res) => {
        try {
            const { email, password } = req.body;

            const user = await User.findOne({ email });

            if (!user) {
                return res.status(400).json({ message: 'Email does not exist' });
            }

          
            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {
                return res.status(400).json({ message: 'Invalid password' });
            }

        
            const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '3h' });

            
            res.cookie('token', token, {
               httpOnly: true,
               secure: true,        
               sameSite: 'none',
               maxAge: 3 * 60 * 60 * 1000,
               path: '/' 
             
            })

          return res.status(200).json({
    message: 'Login successful',
    token, 
    user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
    }
});  
        } catch (error) {
            res.status(500).json({ message: 'Error logging in', error: error.message });
        }
    },
    getMe: async (req, res) => {
        try {
            
            const userId = req.userId;

         
            const user = await User.findById(userId).select('-password');

            
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

       
            res.status(200).json({ user });
        } catch (error) {
            res.status(500).json({ message: 'Error fetching user details', error: error.message });
        }
    },
    logout: async (req, res) => {
        try {
            res.clearCookie('token', {
                secure: NODE_ENV === 'production',
                sameSite: NODE_ENV === 'production' ? 'none' : 'lax'
            });

            return res.status(200).json({ message: 'Logout successful' });
        } catch (error) {
            res.status(500).json({ message: 'Error logging out', error: error.message });
        }
    }
};

module.exports = {  ...authController };