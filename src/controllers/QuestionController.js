const fsAsync = require("fs").promises;
const CustomError = require("../error/CustomError");
const questionMapper = require("../mapping/questionsMapper");

const pathToQuestionsHead = require('../utils/paths').pathToQuestions;

class QuestionController {

    static async readQuestionsFiltered(filter = null) {
        const data = await fsAsync.readFile(pathToQuestionsHead, 'utf-8');

        let diskQuestions = JSON.parse(data)
        if (filter?.hasOwnProperty('Id')) {
            let tmp = {};
            tmp[filter.Id] = diskQuestions[filter.Id];
            diskQuestions = tmp;
            // diskQuestions = diskQuestions[filter.Id];
            // diskQuestions = Object.keys(diskQuestions)
            //     .filter(key => key === filter.Id)
            //     .reduce((obj, key) => {
            //         obj[key] = diskQuestions[key];
            //         return obj;
            //     }, {});
        }
        let questions = questionMapper.toDomainQuestions(diskQuestions);
        return questions;
    }

    static async readQuestions(ids) {
        if (!ids) {
            return [];
        }

        let data = await fsAsync.readFile(pathToQuestionsHead, 'utf-8');

        let diskQuestions = JSON.parse(data);
        let domainQuestions = [];
        // maintain sequence of ids for domainQuestions
        ids.forEach(id => {
            if (diskQuestions[id] !== undefined) {
                domainQuestions.push(questionMapper.toDomainQuestion(id, diskQuestions[id]));
            }
        });
        return domainQuestions;
    }

    static async updateQuestion(newQuestion) {
        const data = await fsAsync.readFile(pathToQuestionsHead, 'utf-8');

        let diskQuestions = JSON.parse(data);
        let diskQuestion = questionMapper.toDiskQuestion(newQuestion);
        diskQuestions = {...diskQuestions, ...diskQuestion};

        const ignore = await fsAsync.writeFile(pathToQuestionsHead, JSON.stringify(diskQuestions), 'utf-8');
        return newQuestion;
    }
}

module.exports = QuestionController;