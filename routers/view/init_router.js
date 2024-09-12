"use strict"

const express = require("express");
const router = express.Router();
const cors = require("cors");
const bodyParser = require('body-parser');
const store = require('../../interfaces/stateManager');
const socket = require('../../src/socket/server');

router.use(bodyParser.json());
router.use(cors());

//초기 페이지 랜더링 시 서버 상태 요청
//SLAMNAV2 : Map Load Name, Localization, //////
router.get("/view/init",(req,res) =>{
    res.send('not updated yet');
});

module.exports = router;
