"use strict"
const sql = require('mysql');

const versiondb = sql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'rainbow',
    database: 'versiondb'
});

// versiondb.connect((err) =>{
//     if(err){
//         console.error("versiondb : connet error ",err);
//         throw err;
//     }
//     console.log("versiondb : connected");
// });


async function setQuery(query){
    return await new Promise((resolve, reject) => {
        try {
            versiondb.query(query, (err, result) => {
                if (err) {
                    reject({ 'error': err });
                }
                resolve(result);
            });
        } catch (error) {
            console.log("SetQuery Catch:",error);
            reject({ 'error': error });
        }
    });
}

module.exports = {
    setQuery:setQuery
};