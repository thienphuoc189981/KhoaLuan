//------import module Project from database.ts-----//
/// <reference path="database.ts" />
import {Project} from "./database";
let api = new Project.api();
let async = require("async");
//-------begin function check cached with input keyword-----//
//-------req: handle request
//-------res: handle response
export function checkCached(req, res) {
    let query = req.query.q; //get keyword from URL with query is 'q'
    let arrKeyword = [];
    let idTemps = [];
    async.waterfall([

        //Get all keyword from database
        function (callback) {
            api.callQuery('keywordAll')
                .then(function (result) {
                    result["rows"].forEach(function (item) {
                        arrKeyword.push(item);
                    });
                    callback(null, arrKeyword);
                });
        },

        //Handle checking cache
        function (arrKeyword, callback) {
            let json: any;
            for (var i = 0; i < arrKeyword.length; i++) {
                if (arrKeyword[i].key.toLowerCase() === query.toLowerCase()) {//check keyword exist in DB?
                    if (arrKeyword[i].doc.cache.status === true) {//check keyword was cached?

                        //Get list of job's id cached
                        api.getData(arrKeyword[i].doc.cache.idCache).then(function (cache) {
                            cache.jobs.forEach(function (cacheIdJobs) {
                                idTemps.push(cacheIdJobs.idJob);
                            });
                            callback(null, idTemps);
                        });
                        return false;
                    }else {
                        //Data found but wasn't cached
                        json = {
                            'message': 'No data cached !',
                            'status': false
                        };
                        return callback(true, json);
                    }
                }else {
                    if (i === arrKeyword.length - 1) {//end of loop
                        console.log("excute else");
                        //Data not found then we'll insert new keyword to database
                        //Prepare data
                        let data = {
                            "content": query,
                            "type": "keyword",
                            "cache": {
                                "status": false,
                                "idCache": null
                            }
                        };
                        api.insertData(data); //Call insert function from Project module
                        json = {
                            'message': 'Data not found !',
                            'action': 'insert into keyword table',
                            'status': false
                        };
                        return callback(true, json);
                    }
                }
            }
        },

        //Get JSON jobs
        function (idTemps, callback) {
            api.getMultipleData(idTemps).then(function (result) {
                result.status = true;
                callback(null, result);
            });
        }
    ], function (err, data) {
        // Code to execute after everything is done.
        if (data.status == false) {
            res.json(data);
            return res.end();
        } else {
            //console.log(data);
            res.json(data);
            return res.end();
        }
    });
}

