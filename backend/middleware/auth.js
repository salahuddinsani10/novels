const jwt = require('jsonwebtoken');
const { Author } = require('../models/index');
const Customer = require('../models/Customer'); // Import Customer model directly

const auth = (roles = []) => {
  return async (req, res, next) => {
    // Special handling for public routes
    // Allow GET requests to these public endpoints without authentication
    if (req.method === 'GET' && (
      req.originalUrl.match(/\/api\/reviews\/book\/.*/) || // For fetching reviews
      req.originalUrl.match(/\/api\/book\/[^/]*$/) || // For fetching individual books
      req.originalUrl.match(/\/api\/book\/list\/.*/) || // For listing books
      req.originalUrl.match(/\/api\/book\/search\/.*/) // For searching books
    )) {
      return next();
    }
    
    try {
      // Get the token from the Authorization header
      let token = req.header('Authorization');
      
      // Enhanced token debugging
      console.log('Auth middleware - original token:', token ? 'Present (starts with: ' + token.substring(0, 10) + '...)' : 'none');
      console.log('Auth middleware - URL:', req.originalUrl);
      console.log('Auth middleware - method:', req.method);
      console.log('Auth middleware - required roles:', roles);
      
      // Token might already be in raw format or have 'Bearer ' prefix
      // Handle both formats gracefully
      if (token && token.startsWith('Bearer ')) {
        token = token.replace('Bearer ', '');
        console.log('Auth middleware - removed Bearer prefix');
      }
      
      if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
      console.log('Token decoded successfully:', {
        id: decoded.id,
        role: decoded.role,
        route: req.originalUrl,
        method: req.method,
        requiredRoles: roles
      });
      
      let user;
      // Check decoded role and use the appropriate model
      if (roles.includes(decoded.role)) {
        if (decoded.role === 'author') {
          user = await Author.findById(decoded.id);
          console.log('Found author:', user ? 'Yes' : 'No');
        } else if (decoded.role === 'customer') {
          user = await Customer.findById(decoded.id);
          console.log('Found customer:', user ? 'Yes' : 'No');
        }
      } else {
        // Role not allowed for this route
        console.log(`Role ${decoded.role} not allowed for route requiring ${roles.join(', ')}`);
        return res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
      }

      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }

      req.user = user;
      req.token = token;
      next();
    } catch (error) {
      console.error('Auth middleware error:', error);
      return res.status(401).json({ message: 'Token is not valid' });
    }
  };
};

module.exports = auth;
