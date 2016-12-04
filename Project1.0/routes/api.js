"use strict";
//------import module Project from database.ts-----//
/// <reference path="database.ts" />
const database_1 = require("./database");
let api = new database_1.Project.api();
let async = require("async");
var request = require('request');
var http = require('http');
//-------begin function check cached with input keyword-----//
//-------req: handle request
//-------res: handle response
function checkCached(req, res) {
    let query = req.query.q; //get keyword from URL with query is 'q'
    let arrKeyword = [];
    let idTemps = [];
    async.waterfall([
        //Get all keyword from database
        function (callback) {
            api.indexView('keywordAll')
                .then(function (result) {
                result["rows"].forEach(function (item) {
                    arrKeyword.push(item);
                });
                callback(null, arrKeyword);
            });
        },
        //Handle checking cache
        function (arrKeyword, callback) {
            let json;
            for (var i = 0; i < arrKeyword.length; i++) {
                if (arrKeyword[i].key.toLowerCase() === query.toLowerCase()) {
                    if (arrKeyword[i].doc.cache.status === true) {
                        //Get list of job's id cached
                        api.getData(arrKeyword[i].doc.cache.idCache).then(function (cache) {
                            cache.jobs.forEach(function (cacheIdJobs) {
                                idTemps.push(cacheIdJobs.idJob);
                            });
                            callback(null, idTemps);
                        });
                        return false;
                    }
                    else {
                        //Data found but wasn't cached
                        json = {
                            'message': 'No data cached !',
                            'status': false
                        };
                        return callback(true, json);
                    }
                }
                else {
                    if (i === arrKeyword.length - 1) {
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
            api.getMultipleData(idTemps, "jobsById").then(function (result) {
                result.status = true;
                callback(null, result);
            });
        }
    ], function (err, data) {
        // Code to execute after everything is done.
        if (data.status == false) {
            res.json(data);
            return res.end();
        }
        else {
            //console.log(data);
            res.json(data);
            return res.end();
        }
    });
}
exports.checkCached = checkCached;
function dbSearch(req, res) {
    let q = req.query.q;
    q = q.toLowerCase();
    let arrKey = [];
    let obj = new Object();
    let rows = [];
    let json = {
        rows: []
    };
    let i, j;
    if (q.indexOf(' ') !== -1) {
        arrKey = (q.split(' '));
        api.searchView('byTitleAndDescription').then(function (result) {
            for (j = 0; j < result.rows.length; j++) {
                for (i = 0; i < arrKey.length; i++) {
                    if (result.rows[j].key.indexOf(arrKey[i]) !== -1) {
                        rows.push(result.rows[j]);
                        break;
                    }
                }
            }
            json['status'] = true;
            json.rows = rows;
            res.json(json);
            res.end();
        }).catch(function (err) {
            console.log(err);
        });
    }
    else {
        api.searchView('byTitleAndDescription').then(function (result) {
            result.rows.forEach(function (r) {
                if (r.key.indexOf(q) !== -1) {
                    rows.push(r);
                }
            });
            json['status'] = true;
            json.rows = rows;
            res.json(json);
            res.end();
        }).catch(function (err) {
            console.log(err);
        });
    }
}
exports.dbSearch = dbSearch;
function solrSearch(req, res) {
    var data = req.body.rows;
    console.log(data);
    //var json = { rows: [] };
    var q = req.query.q;
    //var q = "developer";
    var source = "";
    var i;
    //for (i = 0; i < data.length; i++) {
    //    json.rows.push(data[i].doc);
    //}
    console.log(data.length);
    //----Handle index----//
    async.waterfall([
        function (callback) {
            for (i = 0; i < data.length; i++) {
                //console.log(json.rows[i].title);
                var updateQuery = "<add><doc><field name='id'>" + (data[i]._id) +
                    "</field><field name='title'>" + (data[i].title) +
                    "</field><field name='description'>" + (data[i].description) +
                    "</field><field name='company'>" + (data[i].company) +
                    "</field><field name='salary'>" + (data[i].salary) +
                    "</field><field name='location'>" + (data[i].location) +
                    "</field><field name='link'>" + (data[i].link) +
                    "</field><field name='source'>" + (source) + "</field></doc></add>";
                updateQuery = encodeURIComponent(updateQuery);
                request.get("http://localhost:8983/solr/search/update?commit=true&stream.body=" + updateQuery + "&wt=json");
            }
            console.log("Index thanh cong !");
            callback(null, true);
        },
        //----Handle search----//
        function (data, callback) {
            if (data == true) {
                if (q.length == 0 || q == '') {
                    q = '*:*';
                }
                request.get('http://localhost:8983/solr/search/select/?q='
                    + q + '&indent=on&rows=999&wt=json&callback=?&sort=score desc&fl=*,score', function (error, response, body) {
                    //body = body.replace(/[]/, "");
                    body = JSON.parse(body);
                    //console.log(body.response.docs[0]);
                    callback(null, body.response.docs);
                });
            }
        }
    ], function (err, data) {
        let result = [];
        var z;
        for (z = 0; z < data.length; z++) {
            data[z].rank = z + 1;
            result.push(data[z]);
        }
        res.json(data);
        res.end();
    });
}
exports.solrSearch = solrSearch;
function createDoc() {
    api.createDdoc();
}
exports.createDoc = createDoc;
//# sourceMappingURL=api.js.map