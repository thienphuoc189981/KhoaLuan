"use strict";
var PouchDB = require('pouchdb');
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
    var api = (function () {
        // contructor
        function api(dbName) {
            this.host = 'http://127.0.0.1:5984/'; // set server CouchDB
            this.dbName = 'project';
        }
        //Create Design document
        api.prototype.createDdoc = function (dbName) {
            //check database name
            if (checkNull(dbName) == true)
                var db = new PouchDB('http://username:password@127.0.0.1:5984/project');
            else
                var db = new PouchDB('http://username:password@127.0.0.1:5984/project');
            function createDoc(dbName) {
                var db = new PouchDB(dbName);
                var remoteCouch = 'http://username:password@127.0.0.1:5984/' + dbName;
                var ddoc = {
                    _id: '_design/index',
                    views: {
                        jobsByUsers: {
                            map: function (doc) {
                                if (doc.type === 'jobs') {
                                    if (doc.users.postId) {
                                        emit(doc.users.postId);
                                    }
                                }
                            }.toString()
                        },
                        jobsByStatus: {
                            map: function (doc) {
                                if (doc.type === 'jobs') {
                                    if (doc.status) {
                                        emit(doc.status);
                                    }
                                }
                            }.toString()
                        },
                        usersByEmail: {
                            map: function (doc) {
                                if (doc.type === 'users') {
                                    if (doc.email) {
                                        emit(doc.email);
                                    }
                                }
                            }.toString()
                        },
                        usersById: {
                            map: function (doc) {
                                if (doc.type === 'users') {
                                    if (doc._id) {
                                        emit(doc._id);
                                    }
                                }
                            }.toString()
                        },
                        searchDataAll: {
                            map: function (doc) {
                                if (doc.type === 'searchData') {
                                    if (doc.jobs.idJobs) {
                                        emit(doc.jobs.idJobs, doc.categories.name);
                                    }
                                }
                            }.toString()
                        },
                        keywordAll: {
                            map: function (doc) {
                                if (doc.type === 'keyword') {
                                    emit(doc.content);
                                }
                            }.toString()
                        },
                        cacheByKeyword: {
                            map: function (doc, idKeyword) {
                                if (doc.type === 'cache') {
                                    if (doc.keyword.idKeyword === idKeyword) {
                                        emit(doc.jobs);
                                    }
                                }
                            }.toString()
                        },
                        cacheByCacheAt: {
                            map: function (doc) {
                                if (doc.type === 'cache') {
                                    if (doc.cacheAt) {
                                        emit(doc.cacheAt);
                                    }
                                }
                            }.toString()
                        },
                        categoriesAll: {
                            map: function (doc) {
                                if (doc.type === 'categories') {
                                    if (doc.name) {
                                        emit(doc.name);
                                    }
                                }
                            }.toString()
                        }
                    }
                };
                var ddoc2 = {
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
                //save it
                db.put(ddoc, function (err) {
                    if (err && err.status !== 409) {
                        return console.log(err);
                    }
                });
                db.put(ddoc2, function (err) {
                    if (err && err.status !== 409) {
                        return console.log(err);
                    }
                });
                var opts = { live: true };
                db.sync(remoteCouch, opts);
            }
        };
        //call query
        api.prototype.indexView = function (view, dbName) {
            var result;
            //check database name
            if (checkNull(dbName) == true)
                var db = new PouchDB(this.host + this.dbName);
            else
                var db = new PouchDB(this.host + dbName);
            //query data
            return db.query('index/' + view, { include_docs: true });
        };
        //Select Object with id and emit's parameter
        api.prototype.selectObj = function (view, field, dbName) {
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
        };
        ;
        //function get a json document objects from ID array
        api.prototype.getData = function (item, dbName) {
            if (checkNull(dbName) == true)
                var db = new PouchDB(this.host + this.dbName);
            else
                var db = new PouchDB(this.host + dbName);
            return db.get(item);
        };
        //Get multiple data with key
        api.prototype.getMultipleData = function (arrKey, view, dbName) {
            if (checkNull(dbName) == true)
                var db = new PouchDB(this.host + this.dbName);
            else
                var db = new PouchDB(this.host + dbName);
            return db.query("index/" + view, { keys: arrKey, include_docs: true });
        };
        //Get multiple data with key
        api.prototype.findData = function (key, view, dbName) {
            if (checkNull(dbName) == true)
                var db = new PouchDB(this.host + this.dbName);
            else
                var db = new PouchDB(this.host + dbName);
            return db.query("index/" + view, { key: key, include_docs: true });
        };
        //-------function insert data to database------//
        //-------data: insert data
        //-------dbName: database name (can be null)
        api.prototype.insertData = function (data, dbName) {
            if (checkNull(dbName) == true)
                var db = new PouchDB(this.host + this.dbName);
            else
                var db = new PouchDB(this.host + dbName);
            return db.post(data);
        };
        api.prototype.updateData = function (data, dbName) {
            if (checkNull(dbName) == true)
                var db = new PouchDB(this.host + this.dbName);
            else
                var db = new PouchDB(this.host + dbName);
            return db.put(data);
        };
        api.prototype.deleteData = function (_id, _rev, dbName) {
            if (checkNull(dbName) == true)
                var db = new PouchDB(this.host + this.dbName);
            else
                var db = new PouchDB(this.host + dbName);
            return db.remove(_id, _rev);
        };
        api.prototype.searchView = function (view, dbName) {
            if (checkNull(dbName) == true)
                var db = new PouchDB(this.host + this.dbName);
            else
                var db = new PouchDB(this.host + dbName);
            return db.query('search/' + view, { include_docs: true });
        };
        api.prototype.syncDB = function (dbName) {
            if (checkNull(dbName) == true)
                var db = new PouchDB(this.host + this.dbName);
            else
                var db = new PouchDB(this.host + dbName);
            db.sync(this.host + dbName, { live: true }); //sync localStorage to CouchDB server
        };
        return api;
    }());
    Project.api = api;
})(Project = exports.Project || (exports.Project = {}));
//# sourceMappingURL=database.js.map