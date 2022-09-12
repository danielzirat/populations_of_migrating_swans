const express = require('express');
const router = express.Router();
const tf = require("@tensorflow/tfjs");
const tfn = require("@tensorflow/tfjs-node");

// get a reference to your required module
//const myModule = require('./module');
// name is a member of myModule due to the export above
//const model = myModule.model;

router.get('/', (req, res, next) => {
    res.render('index');
});

// Login endpoint
router.post('/', (req, res, next) =>{
    //console.log(req.query);
    console.log("req.body.date")


    tf.setBackend('cpu')
    const handler = tfn.io.fileSystem("./public/model/my_model/model.json");
    tf.loadLayersModel(handler).then(model => {
        res.render('index',{prediction: model.predict(tf.tensor([7])).dataSync()[0]});
    });
    //model.predict(3)
    //res.render('index');
});

module.exports = router;