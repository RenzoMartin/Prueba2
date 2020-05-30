const express = require('express');
const router = express.Router();

const handler = require('../handler');
const handler2 = require('../handler2');

router.get('/metodo1', (req, res)=>{
    res.render('index');
});

router.get('/metodo2', (req, res)=>{
    res.render('index3');
});

router.post('/res/1', handler.comun);

router.post('/res/2', handler2.comun);

module.exports = router;