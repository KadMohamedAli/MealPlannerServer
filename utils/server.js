const express = require('express');
const AuthRoutes = require('../routes/AuthRoutes.js');
const GroupRoutes = require('../routes/GroupRoutes.js');
const MealRoutes = require('../routes/MealRoutes.js');
const UpdateRoutes = require('../routes/UpdateRoutes.js');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const helmet = require('helmet');

function createServer(){
        // Rate limiting middleware
    const limiter = rateLimit({
        windowMs: 5 * 60 * 1000, // 5 minutes
        max: 100, // Limit each IP to 100 requests per `window` (here, per 10 minutes)
        message: 'Too many requests from this IP, please try again after 10 minutes.',
        statusCode: 429, // Set status code to 429 (Too Many Requests)
        standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
        legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    });
    // Slow down middleware
    const speedLimiter = slowDown({
        windowMs: 5 * 60 * 1000, // 5 minutes
        delayAfter: 50, // Allow 50 requests at full speed, then start slowing down
        delayMs: (used, req) => {
        const delayAfter = req.slowDown.limit;
        return (used - delayAfter) * 500; // Delay increases by 500ms for each request after the limit
        },
    });
    
    
    
    const app = express();
    app.use(cors());
    app.use(express.json());
    app.use(cookieParser());
    app.use(helmet());
    
    app.use(speedLimiter);
    app.use(limiter);

    
    
    app.use('/auth', AuthRoutes);
    app.use('/groups', GroupRoutes);
    app.use('/meals', MealRoutes);
    app.use('/update',UpdateRoutes);

    app.disable('x-powered-by');
  
    return app;
}

module.exports = createServer;