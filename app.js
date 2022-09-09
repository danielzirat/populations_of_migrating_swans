const express = require('express');
const CustomError = require('./src/error/CustomError');
const middleWare = require('./src/middleware/requestMiddleware');
const app = express();
const session = require('express-session');
const bodyParser = require('body-parser');
const background = require('./src/retrieval/background');

// creating model

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

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log('Listening on http://localhost:3000')
})

module.exports = app;