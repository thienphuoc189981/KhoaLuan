"use strict";
//------import module Project from database.ts-----//
/// <reference path="database.ts" />
const database_1 = require("./database");
let api = new database_1.Project.api();
let async = require("async");
var request = require('request');
var http = require('http');
var datetime = require('node-datetime');
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
                if (encodeURIComponent(arrKeyword[i].key.toLowerCase()) == encodeURIComponent(query.toLowerCase())) {
                    //console.log(arrKeyword[i].key);
                    if (arrKeyword[i].doc.cache == true) {
                        //console.log(arrKeyword[i].doc._id);
                        //Get list of job's id cached
                        api.findData(arrKeyword[i].doc._id, "cacheByKeyword").then(function (rs) {
                            //console.log(rs);
                            let jobs = rs.rows[0];
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
function solrIndex(req, res) {
    var data = req.body.rows;
    var json;
    var i;
    for (i = 0; i < data.length; i++) {
        data[i].link = encodeURIComponent(data[i].link);
        data[i].image = encodeURIComponent(data[i].image);
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
    res.json({ 'status': true });
    res.end();
}
exports.solrIndex = solrIndex;
function solrSearch(req, res) {
    var q = encodeURIComponent(req.query.q);
    var data;
    let result = [];
    var z;
    if (q.length == 0 || q == '') {
        q = '*:*';
    }
    request.get('http://localhost:8983/solr/search/select/?q='
        + q + '&indent=on&rows=999&wt=json&callback=?&sort=score desc&fl=*,score', function (error, response, body) {
        body = JSON.parse(body);
        data = body.response.docs;
        for (z = 0; z < data.length; z++) {
            data[z].rank = z + 1;
            result.push(data[z]);
        }
        res.json(result);
        res.end;
    });
}
exports.solrSearch = solrSearch;
function saveCache(req, res) {
    var data = req.body;
    var q = req.query.q.toLowerCase();
    let keyword;
    let cache;
    let dt = datetime.create();
    let fomratted = dt.format('m/d/Y H:M:S');
    console.log(q);
    api.findData(q, 'keywordAll').then(function (rs) {
        //console.log(rs);
        if (rs.rows.length != 0) {
            //console.log('vao if');
            keyword = rs.rows[0].doc;
            keyword.count = keyword.count + 1;
            keyword.cache = true;
            api.updateData(keyword).then(function (error, result) {
                console.log(error);
            });
            cache = {
                cacheAt: fomratted,
                type: "cache",
                keyword: {
                    "idKeyword": keyword._id,
                    "content": q
                },
                jobs: data
            };
            api.insertData(cache).then(function (error, result) {
                console.log(error);
                res.json({ 'status': true });
                res.end();
            });
        }
        else {
            let id = guid();
            keyword = {
                _id: id,
                content: q,
                type: "keyword",
                cache: true,
                count: 1
            };
            //console.log(keyword);
            api.updateData(keyword).then(function (error, result) {
                console.log(error);
            });
            cache = {
                cacheAt: fomratted,
                type: "cache",
                keyword: {
                    "idKeyword": id,
                    "content": q
                },
                jobs: data
            };
            api.insertData(cache).then(function (error, result) {
                console.log(error);
                res.json({ 'status': true });
                res.end();
            });
        }
    });
}
exports.saveCache = saveCache;
function deleteCache(req, res) {
    let cacheAt;
    let now = datetime.create();
    let q = req.query.q.toLowerCase();
    api.findData(q, 'keywordAll').then(function (rs) {
        //if (rs.rows[0].key == ){
        //console.log(rs.rows.length);
        //console.log(rs.rows[0].key);
        if (rs.rows.length != 0) {
            //console.log('vao if 1');
            if (rs.rows[0].doc.cache) {
                //console.log('vao if 2');
                rs.rows[0].doc.cache = false;
                api.updateData(rs.rows[0].doc).then(function () {
                    //console.log('update keyword');
                    api.findData(rs.rows[0].id, 'cacheByKeyword').then(function (cache) {
                        //console.log('find cache');
                        //console.log(cache.rows[0].doc.cacheAt);
                        cacheAt = datetime.create(cache.rows[0].doc.cacheAt);
                        //console.log(now);
                        //console.log(cacheAt);
                        //console.log(now.getTime());
                        //console.log(cacheAt.getTime());
                        //console.log(((now.getTime() - cacheAt.getTime()) / 3600000));
                        if (((now.getTime() - cacheAt.getTime()) / 3600000) >= 24) {
                            //console.log('vao if 3');
                            api.deleteData(cache.rows[0].doc._id, cache.rows[0].doc._rev).then(function () {
                                console.log('delete');
                                request.get('http://localhost:8983/solr/search/update?stream.body=<delete><query>*:*</query></delete>&commit=true');
                                res.json({ "status": true });
                                res.end();
                            });
                        }
                        else {
                            res.json({ "status": false });
                            res.end();
                        }
                    });
                });
            }
            else {
                res.json({ "status": false });
                res.end();
            }
        }
        else {
            res.json({ "status": false });
            res.end();
        }
        //                        res.end();
        //}
    });
    //api.indexView('cacheByCacheAt').then(function (rs) {
    //    rs.rows.forEach(function (cache) {
    //        cacheAt = datetime.create(cache.key);
    //        if (((now.getTime() - cacheAt.getTime()) / 3600000) >= 24) {
    //            api.findData(cache.doc.keyword.content, 'keywordAll').then(function (k) {
    //                k.rows[0].doc.cache = false;
    //                api.updateData(k.rows[0].doc.cache).then(function () {
    //                    api.deleteData(cache.doc._id, cache.doc._rev).then(function () {
    //                        request.get('http://localhost:8983/solr/search/update?stream.body=<delete><query>*:*</query></delete>&commit=true');
    //                        res.json({"status":true});
    //                        res.end();
    //                    });
    //                });
    //            });
    //        }
    //    });
    //});
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