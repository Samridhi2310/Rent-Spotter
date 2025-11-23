require('dotenv').config();
const cookie = require('cookie');
const { decode } = require('@auth/core/jwt');

 
// New middleware — much simpler and actually works
const verifyRole = (requiredRole) => {
  return async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = await decode({
        token,
        secret: process.env.AUTH_SECRET,  // same as NextAuth secret
      });

      if (!decoded || decoded.role !== requiredRole) {
        return res.status(403).json({ message: 'Access denied' });
      }

      req.user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Invalid token' });
    }
  };
};


module.exports = verifyRole;
// require('dotenv').config();
// const { getToken } = require('next-auth/jwt');

// const verifyRole = (requiredRole) => {
//   return async (req, res, next) => {
//     try {
//       const token = await getToken({ req, secret: process.env.NEXT_PUBLIC_AUTH_SECRET });

//       if (!token) {
//         return res.status(401).json({ message: 'No session token found' });
//       }

//       if (token.role !== requiredRole) {
//         return res.status(403).json({ message: 'Access denied: Insufficient permissions' });
//       }

//       req.user = token;
//       next();
//     } catch (error) {
//       console.error('Token verification error:', error);
//       return res.status(500).json({ message: 'Internal server error' });
//     }
//   };
// };

// module.exports = verifyRole;
 


// require('dotenv').config();
// const cookie = require('cookie');
// const { decode } = require('next-auth/jwt');

// const verifyRole = (requiredRole) => {
//   return async (req, res, next) => {
//     try {
//       // Parse cookies from the raw cookie header
//       const cookies = cookie.parse(req.headers.cookie || '');

//       // Extract the session token
//       const token = cookies['authjs.session-token'];

//       if (!token) {
//         return res.status(401).json({ message: 'No session token found' });
//       }

//       // Decode the token with the required salt
//       const decoded = await decode({
//         token,
//         secret: process.env.NEXT_PUBLIC_AUTH_SECRET,
//         salt: 'authjs.session-token',
//       });

//       if (!decoded || decoded.role !== requiredRole) {
//         return res.status(403).json({ message: 'Access denied: Insufficient permissions' });
//       }

//       req.user = decoded;
//       next();
//     } catch (error) {
//       console.error('Token verification error:', error);
//       return res.status(500).json({ message: 'Internal server error' });
//     }
//   };
// };


// module.exports = verifyRole;
