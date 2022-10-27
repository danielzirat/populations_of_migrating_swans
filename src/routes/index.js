const express = require('express');
const router = express.Router();
//const tf = require("@tensorflow/tfjs");
//const tfn = require("@tensorflow/tfjs-node");
const puppeteer = require("puppeteer")

// get a reference to your required module
//const myModule = require('./module');
// name is a member of myModule due to the export above
//const model = myModule.model;

router.get('/', (req, res, next) => {
    res.render('index');
});


router.get('/predictions', (req, res, next) => {
    res.attachment('predictions.csv');
    //
});

// Login endpoint
router.post('/', (req, res, next) =>{
    //console.log(req.query);
    //console.log("req.body.date")


    /*tf.setBackend('cpu')
    const handler = tfn.io.fileSystem("./public/model/my_model/model.json");
    tf.loadLayersModel(handler).then(model => {
        res.render('index',{prediction: model.predict(tf.tensor([7])).dataSync()[0]});
    });*/

    /*(async () => {
        const browser = await puppeteer.launch();
        let fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;

        page = await browser.newPage();
        await page.goto(fullUrl, {waitUntil: 'load'});

        //const pageContent = ejs.render('./src/views/index', {data to populate your .ejs page}) //This is sudo code. Check ejs docs on how to do this
        // await page.setContent(pageContent)


        await page.evaluate((kkk) => {

            document.getElementById('predict').innerHTML = kkk;

        }, 'kkk');
        await browser.close();
    })();*/

    //model.predict(3)
    res.render('index', {prediction:'aaa'});
});

module.exports = router;