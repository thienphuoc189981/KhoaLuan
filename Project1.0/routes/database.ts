var PouchDB = require('pouchdb');
declare var index_solr: any;
export module Project {
    // fuction check null parameter
    function checkNull(content: any | string): boolean {
        if (content == null || content == '') {
            return true;
        }
        else
            return false;
    }

    // Class API couchDB
    export class api {
        host: string;
        dbName: string;

        // contructor
        constructor(dbName?: string) {
            this.host = 'http://127.0.0.1:5984/';// set server CouchDB
            this.dbName = 'project';
        }

        //call query
        callQuery(view: string, dbName?: string): any {
            var result;
            //check database name
            if (checkNull(dbName) == true)
                var db = new PouchDB(this.host + this.dbName);
            else
                var db = new PouchDB(this.host + dbName);

            //query data
            return db.query('index/' + view, { include_docs:true });
        }

        //Select Object with id and emit's parameter
        selectObj(view: string, field: string, dbName?: string) {
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


        //function get a json document objects from ID array
        getData(item: string, dbName?: string):any {
            if (checkNull(dbName) == true)
                var db = new PouchDB(this.host + this.dbName);
            else
                var db = new PouchDB(this.host + dbName);

            return db.get(item);
        }
        getMultipleData(arrKey:any, dbName?: string): any {
            if (checkNull(dbName) == true)
                var db = new PouchDB(this.host + this.dbName);
            else
                var db = new PouchDB(this.host + dbName);

            return db.allDocs({ keys: arrKey, include_docs: true });
        }


        //-------function insert data to database------//
        //-------data: insert data
        //-------dbName: database name (can be null)
        insertData(data: any, dbName?: string) {
            if (checkNull(dbName) == true)
                var db = new PouchDB(this.host + this.dbName);
            else
                var db = new PouchDB(this.host + dbName);

            db.post(data, function callback(err, result) {
                if (!err) {
                    console.log('Successfully posted a project!');
                }
            });

            db.sync(this.host + dbName, { live: true });//sync localStorage to CouchDB server
        }

    }
}