//With strict mode, you can not, for example, use undeclared variables.
"use strict";

// import the variables and function from module.js
const background = require('./background');
const w2v = require('word2vec');
const fs = require("fs");
const {newModelAnswers, newModelWords, newModelQuestions} = require("../utils/paths");

const modelQuestions = require('../utils/paths').modelQuestions;
const modelWords = require('../utils/paths').modelWords;
const modelAnswers = require('../utils/paths').modelAnswers;

async function getWordModel() {
    return new Promise(async (resolve, reject) => {
        w2v.loadModel(modelWords, (error, model) => {
            if (error)
                reject(error);

            resolve(model);
        });
    });
}

async function getSimilarQuestionsOrAnswers(search, selectFile = false, numberOfReturnValues = 10) {
    //background.checkForNewModels();

    let modelFile = modelQuestions;

    if (selectFile)
        modelFile = modelAnswers;

    if (!fs.existsSync(modelFile))
        return undefined;

    // async
    return new Promise(async (resolve, reject) => {

        let wordModel;

        await getWordModel().then(
            function(result) {wordModel = result},
            function(error) {reject(error)}
        );

        w2v.loadModel(modelFile, (error, model) => {
            if (error) {
                reject(error);
                return;
            }
            resolve(model.getNearestWords(background.embeddings(wordModel, background.preprocess(search)),
                                          ((model.words < numberOfReturnValues) ? model.words : numberOfReturnValues)));
        });
    });
}

// exporting variables and function
module.exports = {getSimilarQuestionsOrAnswers};