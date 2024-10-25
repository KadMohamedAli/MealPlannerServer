const crypto = require('crypto');


// Helper function to create a device ID token based on User-Agent
exports.createDeviceIDToken =function (userAgent) {
    const hash = crypto.createHash('sha256');
    hash.update(userAgent); // Combine the User-Agent and IP address
    return hash.digest('hex');
  }