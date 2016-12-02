"use strict";
var PouchDB = require('pouchdb');
PouchDB.plugin(require('pouchdb-quick-search'));
var Project;
(function (Project) {
    // fuction check null parameter
    function checkNull(content) {
        if (content == null || content == '') {
            return true;
        }
        else
            return false;
    }
    // Class API couchDB
    class api {
        // contructor
        constructor(dbName) {
            this.host = 'http://127.0.0.1:5984/'; // set server CouchDB
            this.dbName = 'project';
        }
        //Create Design document
        createDdoc(dbName) {
            //check database name
            if (checkNull(dbName) == true)
                var db = new PouchDB('http://username:password@127.0.0.1:5984/project');
            else
                var db = new PouchDB('http://username:password@127.0.0.1:5984/project');
            var ddoc = {
                _id: '_design/search',
                views: {
                    byTitleAndDescription: {
                        map: function (doc) {
                            if (doc.type == 'jobs' && doc.status == 'post') {
                                emit((doc.title + ' ' + doc.description).toLowerCase());
                            }
                        }.toString()
                    }
                }
            };
            db.put(ddoc, function (err) {
                if (err && err.status !== 409) {
                    return console.log(err);
                }
            });
            var opts = { live: true };
            db.sync('http://username:password@127.0.0.1:5984/project', opts);
        }
        //call query
        callQuery(view, dbName) {
            var result;
            //check database name
            if (checkNull(dbName) == true)
                var db = new PouchDB(this.host + this.dbName);
            else
                var db = new PouchDB(this.host + dbName);
            //query data
            return db.query('index/' + view, { include_docs: true });
        }
        //Select Object with id and emit's parameter
        selectObj(view, field, dbName) {
            if (checkNull(dbName) == true)
                var db = new PouchDB(this.host + this.dbName);
            else
                var db = new PouchDB(this.host + dbName);
            db.query('index/' + view).then(function (res) {
                var idTemp = new Array();
                for (var y = 0; y < res["rows"].length; y++) {
                    //console.log(res["rows"][y]["id"]);
                    idTemp.push(res["rows"][y][field]);
                }
                console.log(idTemp);
                idTemp.forEach(function (item, index) {
                    //console.log(index + ' : ' + item);
                    db.get(item).then(function (doc) {
                        //console.log(doc);
                        //index_solr(doc._id, doc.title, doc.description);
                        console.log(doc);
                    }).catch(function (err) {
                        console.log(err);
                    });
                });
            }).catch(function (err) {
                // some error
            });
        }
        ;
        //function get a json document objects from ID array
        getData(item, dbName) {
            if (checkNull(dbName) == true)
                var db = new PouchDB(this.host + this.dbName);
            else
                var db = new PouchDB(this.host + dbName);
            return db.get(item);
        }
        //Get multiple data with key
        getMultipleData(arrKey, view, dbName) {
            if (checkNull(dbName) == true)
                var db = new PouchDB(this.host + this.dbName);
            else
                var db = new PouchDB(this.host + dbName);
            return db.query("index/" + view, { keys: arrKey, include_docs: true });
        }
        //-------function insert data to database------//
        //-------data: insert data
        //-------dbName: database name (can be null)
        insertData(data, dbName) {
            if (checkNull(dbName) == true)
                var db = new PouchDB(this.host + this.dbName);
            else
                var db = new PouchDB(this.host + dbName);
            db.post(data, function callback(err, result) {
                if (!err) {
                    console.log('Successfully posted a project!');
                }
            });
            db.sync(this.host + dbName, { live: true }); //sync localStorage to CouchDB server
        }
        searchView(view, dbName) {
            if (checkNull(dbName) == true)
                var db = new PouchDB(this.host + this.dbName);
            else
                var db = new PouchDB(this.host + dbName);
            return db.query('search/' + view, { include_docs: true });
        }
        searchQuery(query, dbName) {
            console.log('Im in');
            //var db = new PouchDB('http://username:password@127.0.0.1:5984/project');
            var pouch = new PouchDB('http://username:password@127.0.0.1:5984/project');
            //var doc = { _id: 'mydoczzz', title: "Guess who?", text: "It's-a me, Mario!" };
            //return pouch.put(doc).then(function () {
            return pouch.search({
                query: 'mario',
                fields: ['title', 'text'],
                include_docs: true,
                highlighting: true
            });
            //});
            //return db.search({
            //    query: query,
            //    fields: 'title',
            //    include_docs: true
            //});
            //console.log('end searching');
        }
        createIndex() {
            var db = new PouchDB('http://username:password@127.0.0.1:5984/project');
            db.createIndex({
                index: {
                    fields: ['title', 'discription'],
                    name: 'search',
                    ddoc: 'byTitleAndDis'
                }
            });
        }
        find(query, dbName) {
            if (checkNull(dbName) == true)
                var db = new PouchDB(this.host + this.dbName);
            else
                var db = new PouchDB(this.host + dbName);
            return db.find({
                selector: {
                    $and: [
                        { title: query },
                        { discription: query }
                    ]
                }
            });
        }
    }
    Project.api = api;
})(Project = exports.Project || (exports.Project = {}));
//# sourceMappingURL=database.js.map