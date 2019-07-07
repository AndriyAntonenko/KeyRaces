const path = require("path");

const express = require("express");

const router = express.Router();

router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../../public/index.html"));
});
router.get("/signup", (req, res) => {
  res.sendFile(path.join(__dirname, "../../public/auth.html"));
});
router.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "../../public/login.html"));
});

module.exports = router;
