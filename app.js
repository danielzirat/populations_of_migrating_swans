const express = require('express');
const app = express();
const bodyParser = require('body-parser');



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


app.use('/', require('./src/routes/index'));
app.use('/predictions', require('./src/routes/index'));

app.listen(process.env.PORT || 3000, function(){
    console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});

module.exports = app;