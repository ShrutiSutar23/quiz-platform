const jwt = require("jsonwebtoken");

// Checks if user is logged in (valid token)
function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1]; // Format: "Bearer TOKEN_HERE"

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // attach user info (userId, role) to the request
    next(); // let it continue to the actual route
  } catch (error) {
    
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

// Checks if user is an Admin
function verifyAdmin(req, res, next) {
  if (req.user.role !== "ADMIN") {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }
  next();
}

module.exports = { verifyToken, verifyAdmin };