const express = require('express');
const CustomError = require('./src/error/CustomError');
const middleWare = require('./src/middleware/requestMiddleware');
const app = express();
const session = require('express-session');
const bodyParser = require('body-parser');
const background = require('./src/retrieval/background');

// creating model
background.createModels();

// register view engine ejs
// ejs is used for server side rendering
// app.set let us configure some application settings
app.set('view engine', 'ejs'); // default looks in 'views' folder
app.set('views', 'src/views');

// middleware for static files
app.use(express.static('public'));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: true}));
// parse application/json
app.use(bodyParser.json());

// session options
app.use(session({
    secret: '2C44-4D44-WppQ38S',
    resave: true,
    saveUninitialized: true
}));

app.use('/', require('./src/routes/index'));
app.use('/about', require('./src/routes/about'));
app.use('/question', require('./src/routes/question'));
app.use('/login', require('./src/routes/login'));
app.use('/logout', require('./src/routes/logout'));
app.use('/registration', require('./src/routes/registration'));
app.use('/new', require('./src/routes/addQuestion'));
app.use('/answer', require('./src/routes/answer'));

// catch 404 and forward to error handler
app.use(middleWare.checkSession, (req, res) => {
    res.status(404).render('404', {title: 404, user: req.isSession});
});

// error handler
app.use((err, req, res, next) => {
    if (err instanceof CustomError) {
        res.status(err.code).render('error', {title: 'Error', code: err.code, message: err.message});
        return;
    }

    res.status(500).render('error', {code: 500, message: 'Something went wrong!'});
});

app.listen(3000, () => {
    console.log('Listening on http://localhost:3000')
})

module.exports = app;