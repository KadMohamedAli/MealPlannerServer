const jwt = require('jsonwebtoken');
const { User } = require('../models');

module.exports = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verify the JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the user from the database using the id from the decoded token
    const user = await User.findByPk(decoded.id, {
      attributes: ['id', 'username', 'name'],  // Only retrieve necessary fields
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Attach the user details to the req object
    req.user = {
      id: user.id,
      username: user.username,
      name: user.name,
    };

    // Proceed to the next middleware or route handler
    next();
  } catch (err) {
    console.error('Error verifying token:', err);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};
