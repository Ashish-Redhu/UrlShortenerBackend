const express = require("express");
const { shortenUrl, customizeUrl } = require("../Controllers/urlController");

const router = express.Router();

router.post("/shorten", shortenUrl);
router.post("/customize", customizeUrl);

module.exports = router;

