// backend/routes/registrationRoutes.js
const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifytoken');
const {
  createRegistration,
  getMyRegistration,
  updateMyRegistration
} = require('../controllers/registrationController');

router.post('/', verifyToken, createRegistration);
router.get('/me', verifyToken, getMyRegistration);
router.put('/', verifyToken, updateMyRegistration);

module.exports = router;
