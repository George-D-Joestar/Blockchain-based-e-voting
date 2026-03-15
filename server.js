const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const voteRoutes = require("./routes/voteRoutes"); // George's required routes
const verifyToken = require("./middleware/authMiddleware"); // Your Bouncer

const app = express();
app.use(cors());
app.use(express.json());

// Public Route (Anyone can try to login)
app.use("/api/auth", authRoutes);

// Protected Routes (Only people with your JWT Token can access these!)
// We add 'verifyToken' here to protect the blockchain routes
app.use("/api/voting", verifyToken, voteRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Module C Active on Port ${PORT}`));
