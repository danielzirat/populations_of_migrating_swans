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

router.get('/', requestMiddlewares.checkSession, errorMiddleware.catchErrors(async (req, res, next) => {
    let parsedUrl = url.parse(req.url, true);
    const query = parsedUrl.query.q;

    let questions;
    if (query !== undefined && query.length > 0) {
        let relatedQuestionsScore = await search.getSimilarQuestionsOrAnswers(query, false, 5);
        // get only answer ids
        relatedQuestionsScore = relatedQuestionsScore?.slice(0, 10);
        let questionsIds = relatedQuestionsScore?.map(answer => answer.word);
        // questionsIds = questionsIds.slice(0, 1);
        questions = await QuestionController.readQuestions(questionsIds);
    } else {
        questions = await QuestionController.readQuestionsFiltered();
        const tmp = async (questions) => {
            return questions?.sort((a, b) => b.Score - a.Score).slice(0, 10)
        };
        questions = await tmp(questions);
    }

    res.render('index', {title: 'Home', user: req.isSession, questions: questions});
}));

module.exports = router;