const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User,RefreshToken} = require('../models');
const {createDeviceIDToken}= require('./Utils.js');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const TOKEN_EXPIRATION = process.env.TOKEN_EXPIRATION;
const REFRESH_TOKEN_EXPIRATION = process.env.REFRESH_TOKEN_EXPIRATION; 


// Helper to create tokens
const createTokens = (user) => {
  const accessToken = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: TOKEN_EXPIRATION*60  });
  const newRefreshToken = jwt.sign({ id: user.id }, JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRATION / 1000 });
  return { accessToken, newRefreshToken };
};

// Helper function to create a new refresh token
async function createRefreshToken(user, ipAddress, deviceInfo) {
  const token = jwt.sign({ id: user.id }, JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRATION / 1000 });
  const expiresAt = new Date(Date.now() + Number(REFRESH_TOKEN_EXPIRATION)); // 7 days

  // Save the refresh token with IP address to the database
  await RefreshToken.create({
    token,
    user_id: user.id,
    expires_at: expiresAt,
    ip_address: ipAddress,
    device_id: deviceInfo,
  });

  return token;
}

// Helper function to clear cookies
function clearAuthCookies(res) {
  res.clearCookie('refreshToken');
}

// Helper function to set cookies
function setRefreshTokenCookie(res, refreshToken) {

  // Set the refresh token in a cookie, only accessible to '/refresh' route
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict',
    path: '/auth', // Accessible only to the '/refresh' endpoint
    maxAge: REFRESH_TOKEN_EXPIRATION, // 7 days
  });
}



exports.register = async (req, res) => {
  const { username, password, name,email } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, password: hashedPassword, name ,email});
    res.status(201).json({ message: 'User registered successfully', user: { id: user.id, username: user.username } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error registering new user' });
  }
};

exports.login = async (req, res) => {
  const { username, password } = req.body;

  const clientIpAddress = req.ip; // Get the client's IP address
  const userAgent =req.headers['user-agent'];
  try {
    const user = await User.findOne({ where: { username } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid password' });

    const device_id= createDeviceIDToken(userAgent);
    
    const {accessToken, newRefreshToken} = createTokens(user);

    // Create a new refresh token in the database
    await createRefreshToken(user, clientIpAddress, device_id);

    // Clear any existing authentication cookies
    clearAuthCookies(res);

    // Set new authentication cookies
    setRefreshTokenCookie(res, newRefreshToken);


    res.setHeader('Authorization', `Bearer ${accessToken}`);
    res.status(200).json({ message: "Logged in successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error logging in' });
  }
};

exports.refreshToken = async (req, res) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) return res.status(401).json({ error: 'Unauthorized' });

  const clientIpAddress = req.ip; // Get the client's IP address

  try {
    // Find the refresh token in the database
    const storedToken = await RefreshToken.findOne({ where: { token: refreshToken } });
    if (!storedToken) {
      return res.status(403).json({ error: 'Refresh token not found' });
    }

    // Verify the refresh token
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    } catch (err) {
      console.error(err);
      await storedToken.destroy(); // Remove the old token if verification fails
      return res.status(403).json({ error: 'Invalid refresh token' });
    }

    // Find the user associated with the refresh token
    const user = await User.findByPk(decoded.id);
    if (!user) {
      await storedToken.destroy(); // Clean up the old token if the user no longer exists
      return res.status(404).json({ error: 'User not found' });
    }

    // Check for token reuse or IP address mismatch
    if (storedToken.token !== refreshToken) {
      await storedToken.destroy(); // Invalidate the token if reuse or IP mismatch is detected
      return res.status(403).json({ error: 'Possible token reuse or IP address mismatch detected' });
    }

    // Rotate the refresh token: generate new tokens
    const { accessToken, newRefreshToken } = createTokens(user);
    storedToken.token = newRefreshToken;
    storedToken.expires_at = new Date(Date.now() + Number(REFRESH_TOKEN_EXPIRATION));
    storedToken.ip_address = clientIpAddress; // Update the IP address
    storedToken.device_id = createDeviceIDToken(req.userAgent);
    await storedToken.save();

    // Clear any existing authentication cookies
    clearAuthCookies(res);

    // Set new authentication cookies
    setRefreshTokenCookie(res, newRefreshToken);

    res.setHeader('Authorization', `Bearer ${accessToken}`);
    res.status(200).json({ message: 'Token refreshed successfully' });
  } catch (err) {
    console.error('Error refreshing token:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Logout user
exports.logout = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  try {
    if (refreshToken) {
      await RefreshToken.destroy({ where: { token: refreshToken } });
      
    }
    clearAuthCookies(res);

    res.status(200).json({ message: 'Logged out successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error logging out' });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const clientIpAddress = req.ip; // Get the client's IP address
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Current password is incorrect' });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    await RefreshToken.destroy({ where: { user_id: user.id } });

    

    clearAuthCookies(res);

    const {accessToken, newRefreshToken} = createTokens(user);
    const device_id= createDeviceIDToken(req.userAgent);

    // Create a new refresh token in the database
    await createRefreshToken(user, clientIpAddress, device_id);

    // Set new authentication cookies
    setRefreshTokenCookie(res, newRefreshToken);
    res.setHeader('Authorization', `Bearer ${accessToken}`);
    
    res.status(200).json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error changing password' });
  }
};
