const express = require("express");
const { registerUser, loginUser, updateWallet, verifyToken, logoutUser } = require("../Controllers/userController");

const router = express.Router();

router.post("/registerUser", registerUser);
router.post("/loginUser", loginUser);
router.post("/updateWallet", updateWallet);
router.post("/verify-token", verifyToken);
router.post("/logoutUser", logoutUser);

module.exports = router;
