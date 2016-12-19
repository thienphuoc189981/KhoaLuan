"use strict";
const database_1 = require("./database");
let api = new database_1.Project.api();
let async = require("async");
var request = require('request');
var http = require('http');
var datetime = require('node-datetime');
function index(req, res) {
    let json = [];
    //if (req.session.privilege == 'admin') {
    api.indexView('usersById').then(function (rs) {
        rs.rows.forEach(function (u) {
            json.push(u.doc);
        });
        res.render('./admin/index', {
            json: json, layout: 'admin', session: req.session,
            helpers: {
                eq: function (v1) { return v1 == json.status; }
            } });
    });
    //} else {
    //    res.redirect('/login');
    //}
}
exports.index = index;
function updateUser(req, res) {
    let json;
    let id = req.params.id;
    //if (req.session.privilege == 'admin') {
    api.findData(id, 'usersById').then(function (rs) {
        json = rs.rows[0].doc;
        console.log(json.status);
        res.render('./admin/updateUser', {
            json: json, layout: 'admin', session: req.session, message: req.flash,
            helpers: {
                eq: function (v1) { return v1 == json.status; }
            }
        });
    });
    //} else {
    //    res.redirect('/login');
    //}
}
exports.updateUser = updateUser;
function updateUserSubmit(req, res) {
    let json;
    let id = req.body._id;
    let body = req.body;
    //if (req.session.privilege == 'admin') {
    api.findData(id, 'usersById').then(function (rs) {
        json = rs.rows[0].doc;
        json.name = body.name;
        json.email = body.enail;
        json.phone = body.phone;
        json.status = body.status;
        api.updateData(json).then(function () {
            req.flash('successUpdate', 'You are successfully updating !', { maxage: 6000 });
            res.redirect('/admin/dashboard');
        });
    });
    //} else {
    //    res.redirect('/login');
    //}
}
exports.updateUserSubmit = updateUserSubmit;
function deleteUser(req, res) {
    let id = req.body._id;
    //if (req.session.privilege == 'admin') {
    api.findData(id, 'usersById').then(function (rs) {
        api.deleteData(rs.rows[0].doc._id, rs.rows[0].doc._rev).then(function () {
            req.flash('successUpdate', 'You are successfully deleting !', { maxage: 6000 });
            res.redirect('/admin/dashboard');
        });
    });
    //} else {
    //    res.redirect('/login');
    //}
}
exports.deleteUser = deleteUser;
function addUser(req, res) {
    //if (req.session.privilege == 'admin') {
    res.render('./admin/addUser', {
        layout: 'admin', session: req.session
    });
    //} else {
    //    res.redirect('/login');
    //}
}
exports.addUser = addUser;
function insertJob(req, res) {
    //if (req.session.privilege == 'admin') {
    let user = req.body;
    user.type = 'user';
    res.render('./admin/addUser', {
        layout: 'admin', session: req.session
    });
    //} else {
    //    res.redirect('/login');
    //}
}
exports.insertJob = insertJob;
//# sourceMappingURL=admin.js.map