const mongoose = require("mongoose");

const filmSchema = new mongoose.Schema(
    {
        
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },

        titre: {
            type: String,
            required: [true, "Le titre du film est obligatoire"],
            trim: true
        },

        realisateur: {
            type: String,
            trim: true,
            default: ""
        },

        annee: {
            type: Number,
            min: [1888, "Année invalide"],
            max: [2100, "Année invalide"]
        },

        genre: {
            type: String,
            trim: true,
            default: ""
        },

        affiche: {
            type: String,
            trim: true,
            default: ""
        },

        statut: {
            type: String,
            enum: ["a_voir", "vu", "a_revoir"],
            default: "a_voir"
        },

        note: {
            type: Number,
            min: [0, "La note minimale est 0"],
            max: [10, "La note maximale est 10"],
            default: 0
        },

        avis: {
            type: String,
            maxlength: [500, "L'avis ne doit pas dépasser 500 caractères"],
            default: ""
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Film", filmSchema);