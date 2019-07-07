const express = require("express");

const router = express.Router();
const passport = require("../libs/passport.config");

const controller = require("../services/textes");
const validation = require("../validation/textes.validation");

router.post("/", controller.addText);
router.get(
  "/:raceNumber",
  passport.authenticate("jwt", { session: false }),
  validation,
  controller.getRandomText
);

module.exports = router;
