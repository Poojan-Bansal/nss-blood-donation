const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async function verifyToken(req, res, next){
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing token' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id).select('-passwordHash');
    if (!user) return res.status(401).json({ error: 'User not found' });

    req.user = { id: user._id.toString(), role: user.role, email: user.email, name: user.name };
    next();
  } catch (err) {
    console.error('verifyToken', err);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};
