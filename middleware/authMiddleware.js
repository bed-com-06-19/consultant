const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  const authHeader = req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer '))
    return res.status(401).json({ message: 'Access Denied' });

  try {
    const token = authHeader.split(' ')[1];
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid Token' });
  }
};

const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admins only' });
  }
  next();
};

module.exports = { auth, adminOnly };
