"use strict";
var exec = require('child_process').exec;
var fs = require("fs");
var path = require('path');
function analyzeData(req, res) {
    var data = req.body;
    //console.log(data);
    var json = { rows: [] };
    var i;
    for (i = 0; i < data.length; i++) {
        json.rows.push(data[i]);
    }
    //console.log(json);
    var r = JSON.stringify(json);
    //console.log(data[1].doc);
    //console.log("ccucuccc" + r);
    fs.writeFile('public/vn.hus.nlp.tokenizer-4.1.1-bin/samples/input.txt', r, function (err) {
        if (err) {
            return console.error(err);
        }
    });
    var cmd = '""E:\\VS_workspace\\project\\KhoaLuan\\Project1.0\\public\\vn.hus.nlp.tokenizer-4.1.1-bin\\vnTokenizer.bat -i samples/input.txt -o samples/output.tok.txt""';
    exec(cmd, function (error, stdout, stderr) {
        console.log(error);
        //console.log("sdf");
        fs.readFile('public/vn.hus.nlp.tokenizer-4.1.1-bin/samples/output.tok.txt', function (err, data) {
            if (err) {
                return console.error(err);
            }
            var a = data.toString().replace(/" _ id "/g, '"_id"');
            a = a.replace(/" title "/g, '"title"');
            a = a.replace(/" description "/g, '"description"');
            a = a.replace(/" salary "/g, '"salary"');
            a = a.replace(/" datetime "/g, '"datetime"');
            a = a.replace(/" location "/g, '"location"');
            a = a.replace(/" company "/g, '"company"');
            a = a.replace(/" image "/g, '"image"');
            a = a.replace(/" link "/g, '"link"');
            a = a.replace(/" _ rev "/g, '"_rev"');
            a = a.replace(/" city "/g, '"city"');
            a = a.replace(/" tag "/g, '"tag"');
            a = a.replace(/" status "/g, '"status"');
            a = a.replace(/" type "/g, '"type"');
            a = a.replace(/" rows "/g, '"rows"');
            a = a.replace(/" district "/g, '"district"');
            //a = a.replace(/" http : / / "/g, '"type"');
            console.log(a); // data
            res.json(a);
            return res.end();
        });
    });
    //if (fs.existsSync('public/vn.hus.nlp.tokenizer-4.1.1-bin/samples/output.tok.txt')) {
    //console.log('Found file');
    //}
}
exports.analyzeData = analyzeData;
//# sourceMappingURL=vnTokenizer.js.map