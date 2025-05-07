import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
  // Check both 'Authorization' and 'token' headers
  const authHeader = req.headers.authorization;
  const tokenHeader = req.headers.token;

  let token = null;

  // Priority: Bearer token -> fallback to custom 'token' header
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (tokenHeader) {
    token = tokenHeader;
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id; // Attach userId to request
    next(); // Move to next middleware/route
  } catch (err) {
    return res.status(403).json({ success: false, message: 'Invalid token' });
  }
};