// backend/controllers/donationController.js
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Donation = require('../models/Donation');

const KEY_ID = process.env.RAZORPAY_KEY_ID;
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || ''; // optional for webhook

const razorpay = new Razorpay({
  key_id: KEY_ID,
  key_secret: KEY_SECRET
});


exports.createDonation = async (req, res) => {
  try {
    const { amount, currency = 'INR', registrationId } = req.body;
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const amountNum = Number(amount);
    const amountPaise = Math.round(amountNum * 100); // Razorpay expects paise

    
    const donation = await Donation.create({
      userId: req.user.id,
      registrationId: registrationId || null,
      amount: amountNum,
      currency,
      status: 'pending',
      attemptMeta: {},
      timestamps: { initiatedAt: new Date() }
    });

    
    const orderOptions = {
      amount: amountPaise,
      currency: currency,
      receipt: donation._id.toString(),
      payment_capture: 1 
    };

    const order = await razorpay.orders.create(orderOptions);

   
    donation.gatewayOrderId = order.id;
    donation.attemptMeta = { ...donation.attemptMeta, razorpayOrderPayload: order };
    await donation.save();


    return res.status(201).json({
      success: true,
      donationId: donation._id,
      orderId: order.id,
      amount: order.amount, // paise
      currency: order.currency,
      keyId: KEY_ID
    });

  } catch (err) {
    console.error('createDonation error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};


exports.verifyDonationPayment = async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, donationId } = req.body;
    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature || !donationId) {
      return res.status(400).json({ error: 'Missing parameters' });
    }

    
    const generated_signature = crypto
      .createHmac('sha256', KEY_SECRET)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    if (generated_signature !== razorpay_signature) {
     
      await Donation.findByIdAndUpdate(donationId, {
        status: 'failed',
        gatewayPaymentId: razorpay_payment_id,
        gatewaySignature: razorpay_signature,
        'timestamps.failedAt': new Date()
      });
      return res.status(400).json({ error: 'Invalid signature' });
    }

    
    const updated = await Donation.findByIdAndUpdate(donationId, {
      status: 'success',
      gatewayPaymentId: razorpay_payment_id,
      gatewaySignature: razorpay_signature,
      'timestamps.completedAt': new Date()
    }, { new: true });

    return res.json({ success: true, donation: updated });

  } catch (err) {
    console.error('verifyDonationPayment error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};



exports.razorpayWebhook = async (req, res) => {
  try {
    
    const rawBody = req.body instanceof Buffer ? req.body.toString() : JSON.stringify(req.body);
    const signature = req.headers['x-razorpay-signature'];

   
    if (!WEBHOOK_SECRET) {
      console.warn('Razorpay webhook received but RAZORPAY_WEBHOOK_SECRET not set. Ignoring signature verification.');
    } else {
      const expected = crypto.createHmac('sha256', WEBHOOK_SECRET).update(rawBody).digest('hex');
      if (expected !== signature) {
        console.warn('Webhook signature mismatch, ignoring.');
        return res.status(400).send('invalid signature');
      }
    }

    const event = JSON.parse(rawBody);
    const eventName = event.event;
    const payload = event.payload || {};

 
    if (eventName === 'payment.captured' || eventName === 'payment.authorized') {
      const payment = payload.payment?.entity || payload.payment_entity || null;
      if (payment) {
        const orderId = payment.order_id;
        const paymentId = payment.id;
        await Donation.findOneAndUpdate(
          { gatewayOrderId: orderId },
          {
            status: 'success',
            gatewayPaymentId: paymentId,
            'timestamps.completedAt': new Date()
          }
        );
      }
    } else if (eventName === 'payment.failed') {
      const payment = payload.payment?.entity || payload.payment_entity || null;
      if (payment) {
        const orderId = payment.order_id;
        await Donation.findOneAndUpdate(
          { gatewayOrderId: orderId },
          { status: 'failed', 'timestamps.failedAt': new Date() }
        );
      }
    }


    res.json({ ok: true });

  } catch (err) {
    console.error('razorpayWebhook error:', err);
    res.status(500).send('error');
  }
};



exports.webhookUpdate = async (req, res) => {
  try {
    const { donationId, status, gatewayPaymentId, meta } = req.body;
    if (!donationId || !['success', 'failed', 'pending'].includes(status)) {
      return res.status(400).json({ error: 'Invalid payload' });
    }

    const donation = await Donation.findById(donationId);
    if (!donation) return res.status(404).json({ error: 'Donation not found' });

    donation.status = status;
    if (gatewayPaymentId) donation.gatewayPaymentId = gatewayPaymentId;
    donation.attemptMeta = { ...donation.attemptMeta, ...meta };
    if (status === 'success') donation.timestamps.completedAt = new Date();
    if (status === 'failed') donation.timestamps.failedAt = new Date();
    await donation.save();

    res.json({ ok: true, donationId: donation._id, status: donation.status });
  } catch (err) {
    console.error('webhookUpdate error', err);
    res.status(500).json({ error: 'Server error' });
  }
};


exports.getMyDonations = async (req, res) => {
  try {
    const donations = await Donation.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(donations);
  } catch (err) {
    console.error('getMyDonations error', err);
    res.status(500).json({ error: 'Server error' });
  }
};
