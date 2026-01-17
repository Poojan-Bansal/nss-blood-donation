
# 🩸 NGO Registration and Donation Management System Portal

A full-stack web application built for NSS to manage blood donation registrations and donations with secure authentication, role-based access, and Razorpay **test-mode** payment integration.

---

## 🚀 Features

### 👤 User Features
- User Signup & Login (JWT Authentication)
- Registration form (edit/update existing registration)
- Donate any amount (Razorpay Test Mode – no real money)
- View donation history with status (Success / Failed / Pending)
- User dashboard showing total donated amount

### 🛡 Admin Features
- Secure Admin Login (admin accounts created manually)
- Admin Dashboard Overview
- View all user registrations
- Filter registrations
- View all donations
- Track payment status and timestamps

---

## 🧰 Tech Stack

### Frontend
- React (Vite)
- React Router
- Modern UI with cards, modals, smooth transitions

### Backend
- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- JWT Authentication
- Razorpay (Test Mode)

---

## 💳 Payment Gateway

- Razorpay integrated in **Test Mode**
- No real money involved
- Secure backend-side payment verification
- Donation status updated only after genuine verification
- Failed and pending payments handled correctly

---

## 📁 Project Structure

```
NSS Blood Donation/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── server.js
│   └── .env (not committed)
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── App.jsx
│   └── vite.config.js
│
└── README.md
```

---

## ⚙️ Setup Instructions

### 1️⃣ Clone Repository
```bash
git clone https://github.com/Poojan-Bansal/nss-blood-donation.git
cd nss-blood-donation
```

### 2️⃣ Backend Setup
```bash
cd backend
npm install
```

Create `.env` file:
```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
RAZORPAY_KEY_ID=rzp_test_xxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxx
```

Run backend:
```bash
npm start
```

---

### 3️⃣ Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## 🔐 Admin Access

- Admin accounts are **not created through the UI**
- Admin role is assigned manually in the database
- Users with role `admin` are redirected to `/admin` dashboard

---

## 🎥 Demo Video

📹 Demo Video Link:
👉  [Click here to see Demo Video](https://www.youtube.com/watch?v=QfK69oTpxvw)

---

## 📌 Notes

- Project developed for **academic / NSS purposes**
- Razorpay is used strictly in **test mode**
- No real payments are processed

---

## 👨‍💻 Author



**Poojan Bansal, Dhruv Soni, Piyush Sagatani**  
Electrical Engineering  
NSS Project – 2026



---

## ⭐ Acknowledgements

- Razorpay Documentation
- MongoDB Atlas
- React & Express Community
