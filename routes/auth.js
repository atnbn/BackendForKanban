const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/user');
const mongoose = require('mongoose');


// POST /api/users
router.post('/api/sign-user', async (req, res) => {
    try {
        const { username, email, password, confirmedPassowrd } = req.body;

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        const hashedPassword = bcrypt.hashSync(password, 10);
        const hashedPassword2 = bcrypt.hashSync(password, 10);

        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            confirmedPassword: hashedPassword2,
        });

        await newUser.save();

        res.status(201).json('User added successfully');
    } catch (error) {
        console.error('Error occurred:', error);

        res.status(500).json({ error: 'Internal Server Error' });
    }
});


router.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (user && bcrypt.compareSync(password, user.password)) {
            req.session.userId = user._id;
            req.session.save(err => {
                if (err) {
                    console.error('Session save error:', err);
                    return res.status(500).send('Internal Server Error');
                }
            });
            res.json({ message: 'Logged in successfully' });
        } else {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('Error occurred:', error);
        res.status(500).json({ error: 'Internal Server Error' });
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
    if (req.session.userId) {
        res.json({ isLoggedIn: true, userId: req.session.userId })
        console.log('user succees')
    } else {
        console.log('user fail')

        res.json({ isLoggedIn: false })
    }
})




router.post('/api/logout', (req, res) => {
    if (req.session) {

        req.session.destroy(err => {
            if (err) {
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
        const userId = req.session.userId;

        if (!userId) {
            return res.status(401).send('No user logged in');
        }

        const deletedUser = await User.findByIdAndDelete(userId);

        if (!deletedUser) {
            return res.status(404).send('User not found');
        }

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