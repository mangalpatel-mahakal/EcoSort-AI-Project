const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const router = express.Router();


// SIGNUP
router.post("/signup", async (req, res) => {

    try {

        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "All fields are required."
            });
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                message: "User already exists."
            });
        }

        const hashedPassword =
            await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            email,
            password: hashedPassword
        });

        await newUser.save();

        res.status(201).json({
            message: "Signup successful!"
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Server error."
        });

    }

});


// LOGIN
router.post("/login", async (req, res) => {

    try {

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required."
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({
                message: "User not found."
            });
        }

        const passwordMatch =
            await bcrypt.compare(
                password,
                user.password
            );

        if (!passwordMatch) {
            return res.status(400).json({
                message: "Wrong password."
            });
        }

        res.json({
            message: "Login successful!",
            name: user.name,
            email: user.email
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Server error."
        });

    }

});


module.exports = router;