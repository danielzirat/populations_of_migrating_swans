const fs = require("fs");
const fsAsync = require("fs").promises;
const CustomError = require("../error/CustomError");
const answerMapper = require("../mapping/answersMapper");

const pathToAnswersHead = require('../utils/paths').pathToAnswers;

class AnswerController {
    static async readAnswers(filter) {
        const data = await fsAsync.readFile(pathToAnswersHead, 'utf-8');

        let answers = answerMapper.toDomainAnswers(JSON.parse(data));
        if (filter.hasOwnProperty('Id')) {
            answers = answers.filter(answer => answer.Id === filter.Id);
        }
        if (filter.hasOwnProperty('ParentId')) {
            answers = answers.filter(answer => String(answer.ParentId) === filter.ParentId)
        }
        return answers;
    }

    static async putAnswer(domainAnswer) {
        const data = await fsAsync.readFile(pathToAnswersHead, 'utf-8');

        let diskAnswers = answerMapper.toDomainAnswers(JSON.parse(data));
        diskAnswers = {...diskAnswers, ...answerMapper.toDiskAnswer(domainAnswer)};

        const ignore = fsAsync.writeFile(pathToAnswersHead, JSON.stringify(diskAnswers), 'utf-8');
        return domainAnswer;
    }

    static async updateAnswer(newAnswer) {
        const data = await fsAsync.readFile(pathToAnswersHead, 'utf-8');

        let diskAnswers = JSON.parse(data);
        let diskAnswer = answerMapper.toDiskAnswer(newAnswer);
        diskAnswers = {...diskAnswers, ...diskAnswer};

        const ignore = fsAsync.writeFile(pathToAnswersHead, JSON.stringify(diskAnswers), 'utf-8');
        return newAnswer;
    }
}

module.exports = AnswerController;