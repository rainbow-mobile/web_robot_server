"use strict"

const express = require("express");
const router = express.Router();
const cors = require("cors");
const bodyParser = require('body-parser');
const store = require('../../interfaces/stateManager');
const slam = require('../../src/socket/slamnav');

router.use(bodyParser.json());
router.use(cors());

router.post("/jog/manual",(req,res) =>{
    slam.sendJog(req.body);
    res.send();
});

router.get("/motor/init",(req,res) =>{
    res.send(store.getState());
});

module.exports = router;
