const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/user');
const mongoose = require('mongoose');


// POST /api/users
router.post('/api/sign-user', async (req, res) => {
    try {
        // Destructure user data from the request body
        const { username, email, password, confirmedPassowrd } = req.body;

        // Check if the email already exists
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        // Hash the password using bcrypt
        const hashedPassword = bcrypt.hashSync(password, 10);
        const hashedPassword2 = bcrypt.hashSync(password, 10);

        // Create a new user instance using the User model
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            confirmedPassword: hashedPassword2,
        });

        // Save the user to the database
        await newUser.save();

        // Respond with a success message
        res.status(201).json('User added successfully');
    } catch (error) {
        console.error('Error occurred:', error);

        // Handle any errors that occur during the process
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    console.log(password, user.password)
    if (user && bcrypt.hashSync(password, user.password)) {

        req.session.userId = user._id
        req.session.save(err => {
            if (err) {
                console.error('Session save error:', err);
                return res.status(500).send('Internal Server Error');
            }
            console.log('Session saved with ID:', req.session.userId);
        });
        res.json({ message: 'Logged in successfully' })
    } else {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

});

router.get('/api/user-data', async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).send('Not authenticated');
    }

    try {
        const user = await User.findById(req.session.userId).select('-password').exec();
        if (!user) {
            return res.status(404).send('User not found');
        }
        res.json({
            userData: user
        });
    } catch (err) {
        res.status(500).send('Server error');
    }
});

router.get('/api/check-session', (req, res) => {
    console.log(req.session)
    if (req.session.userId) {
        console.log('user is authenticated')
        res.json({ isLoggedIn: true, userId: req.session.userId })
    } else {
        console.log(
            'session', req.session.userId)

        res.json({ isLoggedIn: false })
    }
})




router.post('/api/logout', (req, res) => {
    if (req.session) {
        // Destroy the session
        req.session.destroy(err => {
            if (err) {
                // Handle error

                return res.status(500).send('Error in logging out');
            }

            res.clearCookie('connect.sid');

            res.json({ message: 'Logged out successfully' });
        });
    } else {
        res.json({ message: 'No active session' });
    }
});

router.delete('/api/delete-user', async (req, res) => {
    try {
        // Access the user ID from the session
        const userId = req.session.userId;

        // Check if the user ID is available
        if (!userId) {
            return res.status(401).send('No user logged in');
        }

        // Find and delete the user from the database
        const deletedUser = await User.findByIdAndDelete(userId);

        if (!deletedUser) {
            return res.status(404).send('User not found');
        }

        // Optionally, destroy the session after deleting the user
        req.session.destroy(err => {
            if (err) {
                return res.status(500).send('Error destroying session');
            }
            res.status(200).send({ message: 'User deleted successfully' });
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

module.exports = router;