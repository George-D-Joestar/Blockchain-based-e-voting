const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  // 1. Get the token from the request header (the "wristband")
  const authHeader = req.header("Authorization");
  const token = authHeader && authHeader.split(" ")[1]; // Get the part after "Bearer"

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access Denied. Please log in first." });
  }

  try {
    // 2. Verify if the token is real using your secret key
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified; // Save user info for the next step
    next(); // Let them pass to the voting route
  } catch (err) {
    res.status(400).json({ message: "Invalid or Expired Token." });
  }
};
