require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const registrationRoutes = require('./routes/registrationRoutes');
const donationRoutes = require('./routes/donationRoutes');
const adminRoutes = require('./routes/adminRoutes');


const donationController = require('./controllers/donationController');

const app = express();
app.use(helmet());
app.use(cors());


app.post(
  '/api/donation/webhook', 
  express.raw({ type: 'application/json' }), 
  donationController.razorpayWebhook
);


app.use(express.json());

// connect DB
connectDB().then(() => console.log('Mongo connected')).catch(err => console.error(err));

// mount routes
app.use('/api/auth', authRoutes);
app.use('/api/registration', registrationRoutes);
app.use('/api/donation', donationRoutes); 
app.use('/api/admin', adminRoutes);

// health
app.get('/', (req, res) => res.send('NSS Donation Backend Running'));

// start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on ${PORT}`));
