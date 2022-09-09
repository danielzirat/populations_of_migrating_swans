const express = require('express');
const fs = require('fs');
const router = express.Router();
const url = require('url');

router.get('/', (req, res, next) => {
    res.render('index');
});

module.exports = router;