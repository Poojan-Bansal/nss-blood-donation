const express = require('express');
const router = express.Router();
const verify = require('../middleware/verifytoken');
const adminOnly = require('../middleware/adminOnly');
const ctrl = require('../controllers/adminController');

router.get('/summary', verify, adminOnly, ctrl.summary);
router.get('/donations', verify, adminOnly, ctrl.listDonations);
router.get('/registrations', verify, adminOnly, ctrl.listRegistrations);
router.get('/registrations/export', verify, adminOnly, ctrl.exportRegistrationsCsv);

module.exports = router;
