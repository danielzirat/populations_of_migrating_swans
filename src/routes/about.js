const express = require('express');
const router = express.Router();
const requestMiddlewares = require("../middleware/requestMiddleware");

// we need to ask for '/' here because this route is already at /about
router.get('/', requestMiddlewares.checkSession, (req, res, next) => {
    res.render('about', {title: 'About', user: req.isSession});
});

module.exports = router;