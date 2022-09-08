const path = require('path');
const requestMiddlewares = require("../middleware/requestMiddleware");
const express = require("express");
const router = express.Router();



router.get('/', requestMiddlewares.authenticationMiddleWare, (req, res) => {
    req.session.destroy();
    res.render('login',{title: 'login'});
});


module.exports = router;