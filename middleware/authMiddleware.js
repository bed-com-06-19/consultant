const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  const token = req.header('Authorization')?.split(" ")[1];
  if (!token) return res.status(401).json({ message: 'Access Denied: No Token' });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json({ message: 'Invalid Token' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admins only' });
  next();
};

module.exports = { auth, adminOnly };
