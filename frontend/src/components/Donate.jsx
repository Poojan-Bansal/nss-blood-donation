import React, { useState } from 'react';
import { apiRequest } from '../services/api';
import Modal from './Modal';

// load Razorpay script once
function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (document.getElementById('razorpay-sdk')) return resolve(true);
    const script = document.createElement('script');
    script.id = 'razorpay-sdk';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function Donate({ token }) {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [message, setMessage] = useState('');

  async function confirmAndPay() {
    if (!amount || Number(amount) <= 0) return alert('Enter valid amount');

    setLoading(true);
    try {
      // 1️⃣ Create donation + Razorpay order
      const res = await apiRequest(
        '/api/donation',
        'POST',
        { amount: Number(amount) },
        token
      );

      // 2️⃣ Load Razorpay SDK
      const ok = await loadRazorpayScript();
      if (!ok) throw new Error('Razorpay SDK failed to load');

      // 3️⃣ Configure Razorpay popup
      const options = {
        key: res.keyId,            // test key from backend
        amount: res.amount,        // paise
        currency: 'INR',
        name: 'NSS Donation',
        description: 'Donation',
        order_id: res.orderId,
        handler: async function (response) {
          try {
            // 4️⃣ Verify payment with backend (capture the response)
            const verifyRes = await apiRequest(
              '/api/donation/verify',
              'POST',
              {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                donationId: res.donationId
              },
              token
            );

            if (verifyRes && verifyRes.success) {
              setMessage('✅ Donation successful (test mode)');

              // Dispatch global event so dashboard + other components refresh
              window.dispatchEvent(new CustomEvent('donation:completed', {
                detail: { donation: verifyRes.donation }
              }));
            } else {
              setMessage('⚠️ Donation verification failed');
              alert('Payment verification failed');
            }
          } catch (err) {
            setMessage('⚠️ Donation verification error');
            alert('Payment verification failed');
            console.error(err);
          }
        },
        prefill: {},
        theme: { color: '#6366f1' } // modern color
      };

      // 5️⃣ Open Razorpay popup
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function () {
        setMessage('❌ Payment failed');
      });

      rzp.open();
      setConfirmOpen(false);
      setAmount('');

    } catch (err) {
      alert(err.error || err.message || 'Payment error');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <div>
        <label className="small">Amount (INR)</label>
        <input
          value={amount}
          onChange={e => setAmount(e.target.value)}
          placeholder="100"
        />
      </div>

      <div style={{ marginTop: 12 }}>
        <button
          className="btn btn-primary"
          onClick={() => setConfirmOpen(true)}
          disabled={!amount || loading}
        >
          Donate
        </button>
      </div>

      <div style={{ marginTop: 8 }} className="small text-muted">
        {message}
      </div>

      <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <h3>Confirm Donation</h3>
        <p>Donate ₹{amount} — proceed to payment?</p>
        <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
          <button className="btn btn-ghost" onClick={() => setConfirmOpen(false)}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={confirmAndPay}
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Confirm & Pay'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
