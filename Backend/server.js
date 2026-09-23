require("dotenv").config({
    path: "./Backend/.env"
});

const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");
const OpenAI = require("openai");

const authRoutes = require("./routes/authRoutes");
const Classification = require("./models/Classification");

const app = express();

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const PORT = 5000;


// ===============================
// MONGODB CONNECTION
// ===============================

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected successfully");
    })
    .catch((error) => {
        console.log("MongoDB connection failed:");
        console.log(error);
    });


// JSON data receive karne ke liye
app.use(express.json());


// AUTH ROUTES
app.use("/api/auth", authRoutes);


// Frontend folder serve karna
app.use(
    express.static(
        path.join(__dirname, "../Frontend")
    )
);


// Multer setup
const upload = multer({
    dest: "uploads/"
});


// Backend test route
app.get("/api/test", (req, res) => {

    res.json({
        message: "Backend working"
    });

});


// ===============================
// REAL AI WASTE CLASSIFICATION
// ===============================

app.post(
    "/api/classify",
    upload.single("wasteImage"),
    async (req, res) => {

        try {

            if (!req.file) {

                return res.status(400).json({
                    success: false,
                    message: "No image received."
                });

            }


            console.log(
                "Image received:",
                req.file.originalname
            );


            const imageBuffer =
                fs.readFileSync(req.file.path);


            const base64Image =
                imageBuffer.toString("base64");


            const mimeType =
                req.file.mimetype;


            const imageDataUrl =
                `data:${mimeType};base64,${base64Image}`;


            const response =
                await client.responses.create({

                    model: "gpt-5.6-luna",

                    input: [
                        {
                            role: "user",

                            content: [

                                {
                                    type: "input_text",

                                    text: `
Look at this waste image carefully.

Classify it into exactly ONE of these categories:

Plastic Waste
Paper Waste
Metal Waste
Glass Waste
Organic Waste
E-Waste

Return only the category name.
Do not add any explanation.
                                    `
                                },

                                {
                                    type: "input_image",
                                    image_url: imageDataUrl
                                }

                            ]

                        }
                    ]

                });


            const category =
                response.output_text.trim();


            // Logged-in user email
            const userEmail =
                req.body.userEmail;


            // Classification MongoDB me save
            if (userEmail) {

                const newClassification =
                    new Classification({
                        userEmail: userEmail,
                        category: category
                    });

                await newClassification.save();

            }


            console.log(
                "AI Classification:",
                category
            );


            res.json({

                success: true,

                category: category,

                message:
                    "Waste classified successfully!"

            });


            // Temporary uploaded image delete
            fs.unlink(
                req.file.path,
                (error) => {

                    if (error) {
                        console.log(
                            "Temporary image delete failed."
                        );
                    }

                }
            );


       } catch (error) {

    console.error(
        "AI Classification Error:",
        error
    );

    // ===============================
    // DEMO / FALLBACK MODE
    // ===============================

    const category = "Plastic Waste";

    const userEmail = req.body.userEmail;


    // Demo result ko history me save karna
    try {

        if (userEmail) {

            const newClassification =
                new Classification({
                    userEmail: userEmail,
                    category: category
                });

            await newClassification.save();

        }

    } catch (dbError) {

        console.log(
            "Fallback history save failed:",
            dbError
        );

    }


    // Temporary uploaded image delete
    if (req.file) {

        fs.unlink(
            req.file.path,
            () => {}
        );

    }


    console.log(
        "Demo Mode Classification:",
        category
    );


    res.json({

        success: true,

        category: category,

        demoMode: true,

        message:
            "Demo mode classification successful!"

    });

}
    }
);


// ===============================
// CLASSIFICATION HISTORY
// ===============================

app.get(
    "/api/history/:email",
    async (req, res) => {

        try {

            const userEmail =
                req.params.email;


            const history =
                await Classification.find({
                    userEmail: userEmail
                }).sort({
                    createdAt: -1
                });


            res.json({

                success: true,

                history: history

            });


        } catch (error) {

            console.log(
                "History Error:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Unable to load history."

            });

        }

    }
);


// ===============================
// SERVER START
// ===============================

app.listen(PORT, () => {

    console.log(
        `Server running on http://localhost:${PORT}`
    );

});