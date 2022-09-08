const {dirname} = require('path');
const appDir = dirname(require.main.filename);

exports.pathToAnswers = appDir + '/src/data/Answers.json';
exports.pathToQuestions = appDir + '/src/data/Questions.json';
exports.userData = appDir + "/src/data/userData.json";

exports.corpus = appDir + "/src/data/corpus.txt";
exports.modelQuestions = appDir + "/src/data/qentities.txt";
exports.modelWords = appDir + "/src/data/word_vectors.txt";
exports.modelAnswers = appDir + "/src/data/entities.txt";
exports.newModelQuestions = appDir + "/src/data/qentities_tmp.txt";
exports.newModelWords = appDir + "/src/data/word_vectors_tmp.txt";
exports.newModelAnswers = appDir + "/src/data/entities_tmp.txt";

