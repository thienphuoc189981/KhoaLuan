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
    class api {
        // contructor
        constructor(dbName) {
            this.host = 'http://127.0.0.1:5984/'; // set server CouchDB
            this.dbName = 'project';
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
        getMultipleData(arrKey, dbName) {
            if (checkNull(dbName) == true)
                var db = new PouchDB(this.host + this.dbName);
            else
                var db = new PouchDB(this.host + dbName);
            return db.allDocs({ keys: arrKey, include_docs: true });
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
    }
    Project.api = api;
})(Project = exports.Project || (exports.Project = {}));
//# sourceMappingURL=database.js.map