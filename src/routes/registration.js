const express = require('express');
const path = require('path');
const requestMiddlewares = require("../middleware/requestMiddleware");
const router = express.Router();

router.get('/', requestMiddlewares.checkSession, (req, res) => {
    res.render('register',{title: 'registration', user: req.isSession});
});

router.post('/', requestMiddlewares.checkEmail, requestMiddlewares.nonAuthenticationMiddleWare, (req, res) =>{
    //console.log(req.query);
    res.redirect('login');
});

module.exports = router;