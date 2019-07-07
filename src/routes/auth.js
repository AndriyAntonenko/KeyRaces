const express = require("express");

const router = express.Router();
const authControllers = require("../services/auth");

const validation = require("../validation/auth.validation");

router.post("/signup", validation, authControllers.signup);
router.post("/login", validation, authControllers.login);

module.exports = router;
