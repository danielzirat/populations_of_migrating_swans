const path = require('path');
const requestMiddlewares = require("../middleware/requestMiddleware");
const express = require("express");
const router = express.Router();



router.get('/',requestMiddlewares.checkSession, requestMiddlewares.nonAuthenticationMiddleWare, (req, res) => {
    res.render('login',{title: 'login', user: req.isSession, error: req.error});
});

// Login endpoint
router.post('/', requestMiddlewares.nonAuthenticationMiddleWare, requestMiddlewares.checkLogin, (req, res) =>{
    //console.log(req.query);
    res.redirect('/');
});

module.exports = router;