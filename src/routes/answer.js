const express = require('express');
const router = express.Router();
const requestMiddlewares = require('../middleware/requestMiddleware');
const CustomError = require("../error/CustomError");
const search = require("../retrieval/search");
const authenticationMiddleWare = requestMiddlewares.authenticationMiddleWare;
const QuestionController = require("../controllers/QuestionController");
const AnswerController = require("../controllers/AnswerController");
const answerMapper = require("../mapping/answersMapper");
const userController = require("../controllers/userController");

router.post('/new', requestMiddlewares.checkSession, (req, res, next) => {
    let userId = req.isSession[2];
    if (userId === undefined) {
        res.send({success: false, redirect: '/login'});
        return;
    }

    const questionId = req.body.questionId;
    let answer = req.body.answer;

    answer = '<p>' + answer + '</p>';

    let diskAnswer = {};
    let date = Date.now();
    diskAnswer[date] = {
        OwnerUserId: userId,
        CreationDate: (new Date(date)).toISOString(),
        ParentId: questionId,
        Score: 0,
        Body: answer
    }

    let domainAnswer = answerMapper.toDomainAnswers(diskAnswer)[0];
    AnswerController.putAnswer(domainAnswer).then(value => {
        res.status(201).send({success: true, data: value});
    }).catch(reason => {
        res.status(418).send({success: false});
    });
});

router.put('/:id/like', requestMiddlewares.checkSession, (req, res, next) => {
    let userId = req.isSession[2];
    if (userId === undefined) {
        res.send({success: false, redirect: '/login'});
        return;
    }
    AnswerController.readAnswers({Id: req.params.id}).then(async answers => {
        if (!answers.length) {
            throw new CustomError(404, 'no resource');
        }
        if (answers.length > 1) {
            throw new CustomError(500, 'id not unique')
        }
        const answer = answers[0];
        answer.Score += 1;

        const user = await userController.readUser(userId);
        let likedAnswers = user.likedAnswers ? user.likedAnswers : [];
        if (likedAnswers.indexOf(answer.Id) === -1) {
            likedAnswers.push(answer.Id);
        }
        user.likedAnswers = likedAnswers;

        userController.updateUser(user).then(user => {
            res.status(201).send({success: true, answer: answer});
        }).catch(reason => {
            res.status(418).send({success: false});
        });
    }).catch(reason => {
        res.status(418).send({success: false});
    });
});

router.put('/:id/unlike', requestMiddlewares.checkSession, (req, res, next) => {
    let userId = req.isSession[2];
    if (userId === undefined) {
        res.send({success: false, redirect: '/login'});
        return;
    }
    AnswerController.readAnswers({Id: req.params.id}).then(async answers => {
        if (!answers.length) {
            throw new CustomError(404, 'no resource');
        }
        if (answers.length > 1) {
            throw new CustomError(500, 'id not unique')
        }
        const answer = answers[0];
        answer.Score -= 1;

        const user = await userController.readUser(userId);
        let likedAnswers = user.likedAnswers ? user.likedAnswers : [];
        user.likedAnswers = likedAnswers.filter(id => id !== req.params.id);

        userController.updateUser(user).then(user => {
            res.status(201).send({success: true, answer: answer});
        }).catch(reason => {
            res.status(418).send({success: false});
        });
    }).catch(reason => {
        res.status(418).send({success: false});
    });
});

module.exports = router;