"use strict"
const express = require("express");
const bodyParser = require('body-parser');
const path = require("path")
const cors = require("cors");
const router = express.Router();
const moment = require('moment');
const logDB = require('../../src/db/logdb.js');


router.use(bodyParser.json());
router.use(cors());

router.get('/log/state', (req,res) =>{
    try{
        var sql = "SELECT * from state;"
        logDB.setQuery(sql).then((result) =>{
            res.send(result);
        })
    }catch(error){
        console.error("SelectStateAll Error : ", error);
        res.sendStatus(500);
    }
})
router.get('/log/state/state', (req,res) =>{
    try{
        var sql = "SELECT * from state;"
        logDB.setQuery(sql).then((data) =>{
                    
        // 2. 상태 변경 사이에 `discon` 추가하기
        const addDisconForGaps = (filteredArray) => {
            const result = [];


            // console.log(filteredArray[0].time, moment(filteredArray[0].time), moment(filteredArray[0].time).format('YYYY-MM-DD HH:mm:ss.SSS').toString(),new Date(moment(filteredArray[0].time).format('YYYY-MM-DD HH:mm:ss.SSS').toString()), new Date('2024-09-11 11:55:13'))
            for (let i = 0; i < filteredArray.length; i++) {
                result.push({time:new Date(moment(filteredArray[i].time)),state:filteredArray[i].state});
                if (i < filteredArray.length - 1) {
                    const currentEndTime = filteredArray[i].time;
                    const nextStartTime = filteredArray[i + 1].time;
                    const gap = (nextStartTime - currentEndTime) / (1000); // 간격을 분 단위로 계산

                    if (gap > 20) { // 20초 이상 공백이 있을 때
                        const disconEntry = {
                            time: new Date(currentEndTime.getTime() + 10000),
                            state: 'Discon'
                        };
                        result.push(disconEntry);
                    }
                }
            }
            const finalEntry = {
                time: new Date(result[result.length-1].time.getTime() + 10000),
                state: 'Final'
            };
            result.push(finalEntry);

            return result;
        };

        const finalArray = addDisconForGaps(data.map(({time,state}) => ({time,state})));
        // 1. 상태가 변경되는 순간만 남기기
        const filteredChanges = finalArray.filter((item, index, arr) => {
            if (index === 0) return true; // 첫 번째 항목은 항상 포함
            return item.state !== arr[index - 1].state;
        });

        res.send(filteredChanges);
        })
    }catch(error){
        console.error("SelectStateAll Error : ", error);
        res.sendStatus(500);
    }
})

router.get('/log/power', (req,res) =>{
    try{
        var sql = "SELECT * from power;"
        logDB.setQuery(sql).then((result) =>{
            res.send(result);
        })
    }catch(error){
        console.error("SelectPowerAll Error : ", error);
        res.sendStatus(500);
    }
})


module.exports = router;