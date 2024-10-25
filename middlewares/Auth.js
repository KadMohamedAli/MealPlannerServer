const jwt = require('jsonwebtoken');
const { User,RefreshToken } = require('../models');
const {createDeviceIDToken}= require('../controllers/Utils');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

module.exports = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  req.userAgent=req.headers['user-agent'];// Get the User-Agent from the request headers

  try {
    // Verify the token and decode the user information
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Attach the decoded user info to the request object
    
    // Check if the device matches
    const deviceIDToken = createDeviceIDToken(req.userAgent);
    // Find all stored refresh tokens for this user
    const storedTokens = await RefreshToken.findAll({ where: { user_id: decoded.id } });

    // Check if any of the stored tokens match the device ID
    const isDeviceMatched = storedTokens.some(storedToken => storedToken.device_id === deviceIDToken);

    if (!isDeviceMatched) {
      // Device mismatch detected, invalidate all refresh tokens for this user
      await RefreshToken.destroy({ where: { user_id: decoded.id } });
      return res.status(403).json({ error: 'Possible token misuse detected, all sessions terminated' });
    }

    next(); // Continue to the next middleware or route handler
  } catch (err) {
    console.error(err);
    res.status(403).json({ error: 'Invalid token' });
  }
};
