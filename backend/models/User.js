
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: true,
    trim: true
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },

  password: {
    type: String,
    required: true,
    select: false
  },

  role: {
  type: String,
  enum: ["admin", "user"],
  default: "user"
},

statutCompte: {
  type: String,
  enum: ["en_attente", "accepte", "refuse"],
  default: "en_attente"
},


emailVerifie: {
  type: Boolean,
  default: false
},

emailVerificationTokenHash: {
  type: String,
  default: null,
  select: false
},

emailVerificationExpire: {
  type: Date,
  default: null,
  select: false
},


partageTokenHash: {
  type: String,
  default: null,
  select: false
}

}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
