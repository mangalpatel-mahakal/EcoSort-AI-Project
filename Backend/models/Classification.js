const mongoose = require("mongoose");

const classificationSchema =
    new mongoose.Schema({

        userEmail: {
            type: String,
            required: true
        },

        category: {
            type: String,
            required: true
        },

        createdAt: {
            type: Date,
            default: Date.now
        }

    });

module.exports =
    mongoose.model(
        "Classification",
        classificationSchema
    );