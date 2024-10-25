const express = require('express');
const authController = require('../controllers/AuthController');
const authMiddleware = require('../middlewares/Auth');
const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh-token',authMiddleware, authController.refreshToken);
router.post('/logout',authMiddleware, authController.logout);
router.post('/change-password',authMiddleware, authController.changePassword);

module.exports = router;