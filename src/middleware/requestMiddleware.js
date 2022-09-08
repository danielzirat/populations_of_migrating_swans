// TODO add additional middlewares as needed
const CustomError = require('../error/CustomError');
const fs = require('fs');
const userData = require('../utils/paths').userData;
const questionData = require('../utils/paths').pathToQuestions;
const background = require('../retrieval/background');

// error codes: https://en.wikipedia.org/wiki/List_of_HTTP_status_codes#4xx_client_errors; 21.12.2021
exports.authenticationMiddleWare = (req, res, next) => {
    if (req.hasOwnProperty('session') && req.session.hasOwnProperty('admin'))
        next();
    else
        res.redirect('/index');
};

exports.nonAuthenticationMiddleWare = (req, res, next) => {
    if (req.hasOwnProperty('session') && req.session.hasOwnProperty('admin'))
        res.redirect('/index');
    else
        next();
};

exports.checkSession = (req, res, next) => {
    req.isSession = [];

    if (req.hasOwnProperty('session') && req.session.hasOwnProperty('admin')) {
        req.isSession.push(true);
        req.isSession.push(req.session.username);
        req.isSession.push(req.session.userid);
    } else {
        req.isSession.push(false);
    }

    return next();
};

exports.checkLogin = (req, res, next) => {
    if (!fs.existsSync(userData)) {
        return res.render('login',{title: 'login', error: true});
    } else {
        let rawdata = fs.readFileSync(userData);
        let data = JSON.parse(rawdata);

        for (let id in data) {
            if (data[id].email === req.body.email && data[id].password === req.body.password) {
                req.session.user = data[id].email;
                req.session.username = data[id].name;
                req.session.userid = data[id].id;
                req.session.admin = true;
                return next();
            }
        }
        return res.render('login',{title: 'login', error: true});
    }
};

exports.checkEmail = (req, res, next) => {
    let data = [];

    if (fs.existsSync(userData)) {
        let content = fs.readFileSync(userData);
        if (content.length)
            data = JSON.parse(content);
    }

    for (let id in data) {
        if (data[id].email === req.body.email ) {
            return res.render('register',{title: 'registration', error: "Email already exists!"});
        }
    }

    data.push({
        "id": Date.now().toString(),
        "name": req.body.name,
        "email": req.body.email,
        "password": req.body.password
    });


    try {
        fs.writeFileSync(userData, JSON.stringify(data));
        console.log("JSON data is saved.");
        return next();
    } catch (error) {
        console.log(error);
        return res.render('registration',{title: 'registration', error: "Error occurred!"});
    }
};

exports.checkAddQuestion = (req, res, next) => {
    console.log(req.body);

    let questions = [];
    let id = Date.now().toString();
    console.log("question-id:"+id);

    if (fs.existsSync(questionData)) {
        let content = fs.readFileSync(questionData);
        if (content.length)
            questions = JSON.parse(content);
    }

    if (questions.length === 0) {
        questions = {[id]: {
                OwnerUserId: req.session.userid,
                CreationDate: (new Date(Date.now())).toISOString(),
                Score: 0,
                Title: req.body.title,
                Body: req.body.text
            }};
    } else {
        // async function is not working like a async
        //if (questions.length % 100 === 0)
            //background.updateModels();

        questions[id] = {
                OwnerUserId: req.session.userid,
                CreationDate: (new Date(Date.now())).toISOString(),
                Score: 0,
                Title: req.body.title,
                Body: req.body.text
            };
    }


    try {
        fs.writeFileSync(questionData, JSON.stringify(questions));
        background.addQuestionEmbedding(id, req.body.title);
        console.log("JSON data(question) is saved.");
        return next();
    } catch (error) {
        console.log(error);
        return res.render('add-question',{title: 'add-question', info: "Question could not be created. Please try later!"});
    }

    return next();
};