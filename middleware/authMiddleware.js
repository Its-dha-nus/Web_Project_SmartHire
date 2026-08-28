const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    // 1. Get the token from the request header
    const token = req.header('Authorization');

    // 2. If there is no token, deny access
    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        // 3. The token usually comes as "Bearer <token_string>". We just want the string.
        const actualToken = token.startsWith('Bearer ') ? token.split(' ')[1] : token;
        
        // 4. Verify the token using your secret key from .env
        const verified = jwt.verify(actualToken, process.env.JWT_SECRET);
        
        // 5. Attach the user's ID and role to the request so the next functions can use it
        req.user = verified;
        next(); // Let the user pass to the actual route!
        
    } catch (error) {
        res.status(400).json({ message: 'Invalid token.' });
    }
};