const express = require('express');
const router = express.Router();
const requestMiddlewares = require('../middleware/requestMiddleware');
const errorMiddleware = require('../middleware/errorMiddleware');
const CustomError = require("../error/CustomError");
const search = require("../retrieval/search");
const authenticationMiddleWare = requestMiddlewares.authenticationMiddleWare;
const QuestionController = require("../controllers/QuestionController");
const AnswerController = require("../controllers/AnswerController");
const userController = require("../controllers/userController");


async function getQuestionWithAnswers(questionId, userId) {
    let question = (await QuestionController.readQuestionsFiltered({Id: questionId}))[0];
    let answers = undefined;
    let relatedQuestions = undefined;
    if (question !== undefined) {
        answers = await AnswerController.readAnswers({ParentId: question.Id});
        const user = await userController.readUser(userId);

        // check if answer is liked by user and add property
        // used to render like
        answers = answers.map(answer => {
            let likedByUser = false;
            if (user && user.likedAnswers !== undefined) {
                likedByUser = user.likedAnswers.indexOf(answer.Id) !== -1;
            }
            answer.LikedByUser = likedByUser;
            return answer;
        });

        let relatedQuestionsScore = await search.getSimilarQuestionsOrAnswers(question.Title, false, 5);

        // get only answer ids
        let questionsIds = relatedQuestionsScore?.filter(answer => answer.word !== questionId).map(answer => answer.word);
        relatedQuestions = await QuestionController.readQuestions(questionsIds);
    }

    return {
        question,
        answers,
        relatedQuestions
    };
}

router.get('/:id', requestMiddlewares.checkSession, errorMiddleware.catchErrors(async (req, res, next) => {
    let userId = req.isSession[2];
    const tuple = await getQuestionWithAnswers(req.params.id, userId)

    if (tuple.question === undefined) {
        res.status(404).redirect('/404');
        return;
    }

    const user = await userController.readUser(userId);
    let likedByUser = false;
    if (user && user.likedQuestions && user.likedQuestions.indexOf(req.params.id) !== -1) {
        likedByUser = true;
    }

    res.render('question', {
        title: "Question",
        user: req.isSession,
        likedByUser: likedByUser,
        question: tuple.question,
        answers: tuple.answers,
        relatedQuestions: tuple.relatedQuestions
    });
}));

router.put('/:id/like', requestMiddlewares.checkSession, (req, res, next) => {
    let userId = req.isSession[2];
    if (userId === undefined) {
        res.status(401).send({success: false, redirect: '/login'});
        return;
    }

    QuestionController.readQuestionsFiltered({Id: req.params.id}).then( async questions => {
        let question = questions[0];
        question.Score += 1;

        const user = await userController.readUser(userId);
        let likedQuestions = user.likedQuestions ? user.likedQuestions : [];
        if (likedQuestions.indexOf(question.Id) === -1) {
            likedQuestions.push(question.Id);
        }
        user.likedQuestions = likedQuestions;

        userController.updateUser(user).then(user => {
            res.send({success: true, question: question});
        }).catch(reason => {
            res.status(418).send({success: false})
        });
    }).catch(reason => {
        res.status(418).send({success: false})
    });
});

router.put('/:id/unlike', requestMiddlewares.checkSession, (req, res, next) => {
    let userId = req.isSession[2];
    if (userId === undefined) {
        res.status(401).send({success: false, redirect: '/login'});
        return;
    }

    QuestionController.readQuestionsFiltered({Id: req.params.id}).then(async questions => {
        let question = questions[0];
        question.Score -= 1;

        const user = await userController.readUser(userId);
        let likedQuestions = user.likedQuestions ? user.likedQuestions : [];
        user.likedQuestions = likedQuestions.filter(id => id !== req.params.id);

        userController.updateUser(user).then(user => {
            res.send({success: true, question: question});
        });
    }).catch(reason => {
        res.status(418).send({success: false, redirect: '/'})
    });
});

module.exports = router;