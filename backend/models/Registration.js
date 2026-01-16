// backend/models/Registration.js
const mongoose = require('mongoose');

const RegistrationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  fullName: { type: String },
  phone: { type: String },
  college: { type: String },
  course: { type: String }
}, { timestamps: true }); 

module.exports = mongoose.model('Registration', RegistrationSchema);
