const mongoose = require('mongoose');

const DonationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    registrationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Registration' },

    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },


    gatewayOrderId: String,
    gatewayPaymentId: String,
    gatewaySignature: String,

    status: {
      type: String,
      enum: ['pending', 'success', 'failed'],
      default: 'pending'
    },

    attemptMeta: { type: Object },

    timestamps: {
      initiatedAt: Date,
      completedAt: Date,
      failedAt: Date
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Donation', DonationSchema);
