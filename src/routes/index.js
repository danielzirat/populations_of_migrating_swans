const express = require('express');
const fs = require('fs');
const requestMiddlewares = require("../middleware/requestMiddleware");
const errorMiddleware = require("../middleware/errorMiddleware");
const CustomError = require('../error/CustomError');
const questionMapper = require('../mapping/questionsMapper');
const router = express.Router();

const url = require('url');
const search = require("../retrieval/search");
const QuestionController = require("../controllers/QuestionController");

router.get('/', errorMiddleware.catchErrors(async (req, res, next) => {
    res.render('index', {title: 'Home'});
}));

module.exports = router;