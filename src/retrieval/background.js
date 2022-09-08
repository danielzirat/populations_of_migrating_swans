"use strict";
// In this file, we write a background script to convert documents to embeddings
// We use the word2vec library for the computation of the word vectors
const fs = require('fs');
const w2v = require('word2vec');
const natural = require('natural');
const stemmer = natural.PorterStemmer;

const modelQuestions = require('../utils/paths').modelQuestions;
const modelWords = require('../utils/paths').modelWords;
const modelAnswers = require('../utils/paths').modelAnswers;
const newModelQuestions = require('../utils/paths').newModelQuestions;
const newModelWords = require('../utils/paths').newModelWords;
const newModelAnswers = require('../utils/paths').newModelAnswers;

const pathToAnswers = require('../utils/paths').pathToAnswers;
const pathToQuestions = require('../utils/paths').pathToQuestions;

const pathToCorpus = require('../utils/paths').corpus;

const vectorLength = 10;

function preprocess(originalString) {
    // Write a standard preprocessing pipeline for strings
    var regex = /(<([^>]+)>)/ig
        ,   originalString = originalString.replace(regex, "")
                                 .replace(/[^A-Za-zА-Яа-яЁёЇїІіҐґЄє0-9\-]|\s]/g, " ")
                                 .replace(/\s{2,}/g, " ")
                                 .replace(/-/g, " ")
                                 .replace(/,/g, " ");

    return stemmer.tokenizeAndStem(originalString);
}

function createCorpus(inputFile, outputFile) {
    // Create a corpus from the input file
    // Preprocess the strings
    // Write to the output file
    //usage

    // not async
    let jsonData = JSON.parse(fs.readFileSync(inputFile));

    let corpus = "";

    for (let entry in jsonData) {
        // stem and tokenize -> concatenate array to one string with join
        corpus += preprocess((jsonData[entry]["Title"] !== undefined) ? jsonData[entry]["Title"] : "").join(" ") + "\n";
    }

    try {
        fs.writeFileSync(outputFile, corpus)
        //file written successfully
    } catch (err) {
        console.error(err)
    }
}

function addvector(a,b,len){
    return a.map((e,i) => e + b[i]/len);
}

//https://medium.com/analytics-vidhya/featurization-of-text-data-bow-tf-idf-avgw2v-tfidf-weighted-w2v-7a6c62e8b097
function embeddings(model, cleanedWordsArray) {
    // Convert a cleaned string to an embedding representation using a pretrained model
    // E.g., by averaging the word embeddings
    let vector = new Float32Array(parseInt(model.size)).fill(0);
    let length = cleanedWordsArray.length;

    for (let word in cleanedWordsArray) {
        if (model.getVector( cleanedWordsArray[word])  === null)
            continue;
        vector = addvector(vector, model.getVector( cleanedWordsArray[word]).values, length);
    }

    return vector;
}

async function createEmbeddings(inputFile, modelFile, outputFile, promise) {
    // Create the document embeddings using the pretrained model
    // Save them for lookup of the running server
    // not async
    let jsonData;
    try {
        jsonData = JSON.parse(fs.readFileSync(inputFile));
    } catch(e) {
        console.log('Error:', e.stack);
        return;
    }

    await promise.then(
        function(result) {console.log(result)},
        function(error) {console.log(error)}
    );

    let docEmbedding = [];

    // async
    let promiseRet = new Promise(async (resolve, reject) => {
        w2v.loadModel(modelFile, (error, model) => {
            if (error) {
                reject("error: " + outputFile);
                return;
            }

            for (let entry in jsonData) {
                let words = preprocess(((jsonData[entry]["Title"] !== undefined) ? jsonData[entry]["Title"] : ""));
                docEmbedding.push([entry, embeddings(model, words)]);
            }

            let text = docEmbedding.length + " " + vectorLength + "\n";
            for (let row in docEmbedding) {
                text += docEmbedding[row]["0"] + " " + docEmbedding[row]["1"].map(String).join(" ") + "\n";
            }

            try {
                fs.writeFileSync(outputFile, text)
                //file written successfully
            } catch (err) {
                console.error(err)
            }
            console.log("done: " + outputFile);
            resolve("ready: " + outputFile);
        });
    });

    return promiseRet
}

async function addQuestionEmbedding(id, question) {
    let promise = new Promise(async (resolve, reject) => {
        try {
            let data = fs.readFileSync(modelQuestions,'utf8');
            fs.writeFileSync(modelQuestions, parseInt(data.substr(0, data.indexOf(' '))) + 1 +  data.substr(data.indexOf(' ')))
            //file written successfully
        } catch (err) {
            console.error(err)
        }
        w2v.loadModel(modelWords, (error, model) => {
            if (error)
                console.log(error);
            else {
                let vector = embeddings(model, preprocess(question));
                try {
                    fs.appendFileSync(modelQuestions, id + " " + vector.join(" ") + "\n");
                    //file written successfully
                } catch (err) {
                    console.error(err)
                }
            }
        });
    });

    await promise;
}

// Suggested pipeline:
// - create a corpus
// - build w2v model (i.e., word vectors)
// - create document embeddings
async function createModels() {

    createCorpus(pathToQuestions, pathToCorpus);
    console.log("done: " + pathToCorpus);
    //size: vector size, minCount: how many words should be skipped. if 1 none
    let promise = new Promise(async (resolve, reject) => {
        // not taking our time to do the job
        w2v.word2vec(pathToCorpus, modelWords,{ size: vectorLength , minCount: 0}, () => {
            resolve("done: " + modelWords);
        });
    });

    //let promiseDoneAnswers = createEmbeddings(pathToAnswers, modelWords, modelAnswers, promise);
    let promiseDoneQuestions = await createEmbeddings(pathToQuestions, modelWords, modelQuestions, promise);

    Promise.all([promiseDoneQuestions]).then((fin) => {
        console.log(fin);
    }).catch((err) => {
        console.log(err)
    });
}

function checkForNewModels(){
    try {
        if (fs.existsSync(newModelAnswers) && fs.existsSync(newModelWords) && fs.existsSync(newModelQuestions)) {
            fs.unlink(modelAnswers, (err) => {
                if (err) throw err;
                console.log(modelAnswers + " was deleted\n");
            });
            fs.unlink(modelQuestions, (err) => {
                if (err) throw err;
                console.log(modelQuestions + " was deleted\n");
            });
            fs.unlink(modelWords, (err) => {
                if (err) throw err;
                console.log(modelWords + " was deleted\n");
            });

            fs.rename(newModelAnswers, modelAnswers, (err) => {
                if (err) throw err;
                else console.log(newModelAnswers + " File Renamed\n");
            });

            fs.rename(newModelQuestions, modelQuestions, (err) => {
                if (err) throw err;
                else console.log(newModelQuestions + " File Renamed\n");
            });

            fs.rename(newModelWords, modelWords, (err) => {
                if (err) throw err;
                else console.log(newModelWords + " File Renamed\n");
            });
        }
    } catch(err) {
        console.error(err)
    }
}

async function updateModels() {
    createCorpus(pathToAnswers, pathToCorpus);
    //size: vector size, minCount: how many words should be skipped. if 1 none
    let promise = new Promise(async (resolve, reject) => {
        // not taking our time to do the job
        w2v.word2vec(pathToCorpus, newModelWords,{ size: vectorLength , minCount: 0}, () => {
            resolve("done");
            reject("error");
        });
    });

    let promiseDoneAnswers = createEmbeddings(pathToAnswers, newModelWords, newModelAnswers, promise);
    let promiseDoneQuestions = createEmbeddings(pathToQuestions, newModelWords, newModelQuestions, promise);

    Promise.all([promiseDoneAnswers, promiseDoneQuestions]).then((fin) => {
        resolve(fin);
    }).catch((err) => {
        reject(err);
    });
}

// exporting variables and function
module.exports = {embeddings, preprocess, updateModels, checkForNewModels, createModels, addQuestionEmbedding};