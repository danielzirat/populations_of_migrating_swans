const express = require('express');
const path = require('path');
const requestMiddlewares = require("../middleware/requestMiddleware");
const router = express.Router();

router.get('/',requestMiddlewares.checkSession, (req, res) => {
    res.render('new',{title: 'add new question', user: req.isSession});
});

router.post('/',requestMiddlewares.checkSession, requestMiddlewares.authenticationMiddleWare, requestMiddlewares.checkAddQuestion, (req, res) => {
    res.render('new',{title: 'add new question', user: req.isSession, info: "Question saved!"});
});

module.exports = router;