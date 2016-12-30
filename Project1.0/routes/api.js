"use strict";
//------import module Project from database.ts-----//
/// <reference path="database.ts" />
var database_1 = require("./database");
var api = new database_1.Project.api();
var async = require("async");
var request = require('request');
var http = require('http');
var datetime = require('node-datetime');
//-------begin function check cached with input keyword-----//
//-------req: handle request
//-------res: handle response
function checkCached(req, res) {
    var query = req.query.q; //get keyword from URL with query is 'q'
    var arrKeyword = [];
    var idTemps = [];
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
            var json;
            for (var i = 0; i < arrKeyword.length; i++) {
                if (arrKeyword[i].key.toLowerCase() === query.toLowerCase()) {
                    if (arrKeyword[i].doc.cache === true) {
                        //console.log(arrKeyword[i].doc._id);
                        //Get list of job's id cached
                        api.findData(arrKeyword[i].doc._id, "cacheByKeyword").then(function (rs) {
                            //console.log(rs);
                            var jobs = rs.rows[0];
                            jobs.status = true;
                            callback(null, jobs);
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
                        //console.log("excute else");
                        //Data not found then we'll insert new keyword to database
                        //Prepare data
                        var data = {
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
        }
    ], function (err, data) {
        // Code to execute after everything is done.
        //if (data.status == false) {
        res.json(data);
        return res.end();
        //} else {
        //    //console.log(data);
        //    res.json(data);
        //    return res.end();
        //}
    });
}
exports.checkCached = checkCached;
//export function checkCached(req, res) {
//    let query = req.query.q; //get keyword from URL with query is 'q'
//    let arrKeyword = [];
//    let idTemps = [];
//    async.waterfall([
//        //Get all keyword from database
//        function (callback) {
//            api.indexView('keywordAll')
//                .then(function (result) {
//                    result["rows"].forEach(function (item) {
//                        arrKeyword.push(item);
//                    });
//                    callback(null, arrKeyword);
//                });
//        },
//        //Handle checking cache
//        function (arrKeyword, callback) {
//            let json: any;
//            for (var i = 0; i < arrKeyword.length; i++) {
//                if (arrKeyword[i].key.toLowerCase() === query.toLowerCase()) {//check keyword exist in DB?
//                    if (arrKeyword[i].doc.cache.status === true) {//check keyword was cached?
//                        //Get list of job's id cached
//                        api.getData(arrKeyword[i].doc.cache.idCache).then(function (cache) {
//                            cache.jobs.forEach(function (cacheIdJobs) {
//                                idTemps.push(cacheIdJobs.idJob);
//                            });
//                            callback(null, idTemps);
//                        });
//                        return false;
//                    }else {
//                        //Data found but wasn't cached
//                        json = {
//                            'message': 'No data cached !',
//                            'status': false
//                        };
//                        return callback(true, json);
//                    }
//                }else {
//                    if (i === arrKeyword.length - 1) {//end of loop
//                        console.log("excute else");
//                        //Data not found then we'll insert new keyword to database
//                        //Prepare data
//                        let data = {
//                            "content": query,
//                            "type": "keyword",
//                            "cache": {
//                                "status": false,
//                                "idCache": null
//                            }
//                        };
//                        api.insertData(data); //Call insert function from Project module
//                        json = {
//                            'message': 'Data not found !',
//                            'action': 'insert into keyword table',
//                            'status': false
//                        };
//                        return callback(true, json);
//                    }
//                }
//            }
//        },
//        //Get JSON jobs
//        function (idTemps, callback) {
//            api.getMultipleData(idTemps, "jobsById").then(function (result) {
//                result.status = true;
//                callback(null, result);
//            });
//        }
//    ], function (err, data) {
//        // Code to execute after everything is done.
//        if (data.status == false) {
//            res.json(data);
//            return res.end();
//        } else {
//            //console.log(data);
//            res.json(data);
//            return res.end();
//        }
//    });
//}
function dbSearch(req, res) {
    var q = req.query.q;
    q = q.toLowerCase();
    var arrKey = [];
    var obj = new Object();
    var rows = [];
    var json = {
        rows: []
    };
    var i, j;
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
    var json;
    var q = encodeURIComponent(req.query.q);
    //console.log(data);
    var source = "";
    var i;
    //console.log(data.length);
    //console.log(data)
    //----Handle index----//
    async.waterfall([
        function (callback) {
            for (i = 0; i < data.length; i++) {
                data[i].link = encodeURIComponent(data[i].link);
                //console.log(data[i].link);
                var updateQuery = "<add><doc><field name='id'>" + (data[i]._id) +
                    "</field><field name='title'>" + (data[i].title) +
                    "</field><field name='postDate'>" + (data[i].postDate) +
                    "</field><field name='expireDate'>" + (data[i].expireDate) +
                    "</field><field name='description'>" + (data[i].description) +
                    "</field><field name='company'>" + (data[i].company) +
                    "</field><field name='image'>" + (data[i].image) +
                    "</field><field name='salary'>" + (data[i].salary) +
                    "</field><field name='location'>" + (data[i].location) +
                    "</field><field name='link'>" + (data[i].link) +
                    "</field><field name='source'>" + (data[i].source) + "</field></doc></add>";
                updateQuery = encodeURIComponent(updateQuery);
                request.get("http://localhost:8983/solr/search/update?commit=true&stream.body=" + updateQuery + "&wt=json");
            }
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
                    //console.log("Seach");
                    callback(null, body.response.docs);
                });
            }
        }
    ], function (err, data) {
        var result = [];
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
function saveCache(req, res) {
    var data = req.body;
    var q = req.query.q.toLowerCase();
    var keyword;
    var cache;
    var dt = datetime.create();
    var fomratted = dt.format('m/d/Y H:M:S');
    api.findData(q, 'keywordAll').then(function (rs) {
        if (rs) {
            keyword = rs.rows[0].doc;
            keyword.count = keyword.count + 1;
            keyword.cache = true;
            api.updateData(keyword);
            cache = {
                cacheAt: fomratted,
                type: "cache",
                keyword: {
                    "idKeyword": keyword._id,
                    "content": q
                },
                jobs: data
            };
            api.insertData(cache);
        }
        else {
            var id = guid();
            keyword = {
                _id: id,
                content: q,
                type: "keyword",
                cache: true,
                count: 1
            };
            api.updateData(keyword);
            cache = {
                cacheAt: fomratted,
                type: "cache",
                keyword: {
                    "idKeyword": id,
                    "content": q
                },
                jobs: data
            };
            api.insertData(cache);
        }
    });
    res.json(data);
    res.end();
}
exports.saveCache = saveCache;
function deleteCache(req, res) {
    var cacheAt;
    var now = datetime.create();
    api.indexView('cacheByCacheAt').then(function (rs) {
        rs.rows.forEach(function (cache) {
            cacheAt = datetime.create(cache.key);
            if (((now.getTime() - cacheAt.getTime()) / 3600000) >= 24) {
                api.findData(cache.doc.keyword.content, 'keywordAll').then(function (k) {
                    k.rows[0].doc.cache = false;
                    api.updateData(k.rows[0].doc.cache);
                });
                api.deleteData(cache.doc._id, cache.doc._rev).then(function () {
                    request.get('http://localhost:8983/solr/search/update?stream.body=<delete><query>*:*</query></delete>&commit=true');
                    res.end();
                });
                ;
            }
        });
    });
}
exports.deleteCache = deleteCache;
function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
}
;
function createDoc() {
    api.createDdoc();
}
exports.createDoc = createDoc;
//# sourceMappingURL=api.js.map