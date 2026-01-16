const express = require('express');
const router = express.Router();
const verify = require('../middleware/verifytoken');
const ctrl = require('../controllers/donationController');


router.post('/', verify, ctrl.createDonation);


router.post('/verify', verify, ctrl.verifyDonationPayment);


router.get('/me', verify, ctrl.getMyDonations);

module.exports = router;
