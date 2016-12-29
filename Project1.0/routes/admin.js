"use strict";
var database_1 = require("./database");
var api = new database_1.Project.api();
var async = require("async");
var request = require('request');
var http = require('http');
var datetime = require('node-datetime');
var fs = require('fs');
function index(req, res) {
    var json = [];
    //if (req.session.privilege == 'admin') {
    api.indexView('usersById').then(function (rs) {
        rs.rows.forEach(function (u) {
            json.push(u.doc);
        });
        res.render('./admin/index', {
            json: json, layout: 'admin', session: req.session, message: req.flash(),
            helpers: {
                eq: function (v1) { return v1 == json.status; }
            }
        });
    });
    //} else {
    //    res.redirect('/login');
    //}
}
exports.index = index;
function managementUsers(req, res) {
    var json = [];
    //if (req.session.privilege == 'admin') {
    api.indexView('usersById').then(function (rs) {
        rs.rows.forEach(function (u) {
            json.push(u.doc);
        });
        res.render('./admin/managementUsers', {
            json: json, layout: 'admin', session: req.session, message: req.flash(),
            helpers: {
                eq: function (v1) { return v1 == json.status; }
            } });
    });
    //} else {
    //    res.redirect('/login');
    //}
}
exports.managementUsers = managementUsers;
function updateUser(req, res) {
    var json;
    var id = req.params.id;
    //if (req.session.privilege == 'admin') {
    api.findData(id, 'usersById').then(function (rs) {
        json = rs.rows[0].doc;
        res.render('./admin/updateUser', {
            json: json, layout: 'admin', session: req.session,
            helpers: {
                eq: function (v1) { return v1 == 'Active'; }
            }
        });
    });
    //} else {
    //    res.redirect('/login');
    //}
}
exports.updateUser = updateUser;
function updateUserSubmit(req, res) {
    var json;
    var id = req.body._id;
    var body = req.body;
    //if (req.session.privilege == 'admin') {
    api.findData(id, 'usersById').then(function (rs) {
        json = rs.rows[0].doc;
        json.name = body.name;
        json.email = body.email;
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
    var id = req.params.id;
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
//------jobs-------//
function managementJobs(req, res) {
    var json = [];
    //console.log(req.flash);
    //if (req.session.privilege == 'admin') {
    api.indexView('jobsById').then(function (rs) {
        rs.rows.forEach(function (u) {
            json.push(u.doc);
        });
        res.render('./admin/managementJobs', {
            json: json, layout: 'admin', session: req.session, message: req.flash()
        });
    });
    //} else {
    //    res.redirect('/login');
    //}
}
exports.managementJobs = managementJobs;
function deleteJob(req, res) {
    var id = req.params.id;
    //if (req.session.privilege == 'admin') {
    api.findData(id, 'jobsById').then(function (rs) {
        api.deleteData(rs.rows[0].doc._id, rs.rows[0].doc._rev).then(function () {
            req.flash('successUpdate', 'You are successfully deleting !', { maxage: 6000 });
            res.redirect('/admin/jobs-management');
        });
    });
    //} else {
    //    res.redirect('/login');
    //}
}
exports.deleteJob = deleteJob;
function updateJob(req, res) {
    var idJob = req.params.id;
    var json = [];
    var cats = [];
    //if (req.session.privilege == 'admin') {
    api.findData(idJob, 'jobsById').then(function (result) {
        api.indexView("categoriesAll").then(function (data) {
            data.rows.forEach(function (item) {
                cats.push(item.key);
            });
            json.push(result.rows[0].doc);
            //console.log(json[0]);
            res.render('./admin/updateJob', {
                session: req.session, job: json[0], cats: cats, layout: 'admin',
                helpers: {
                    eq: function (v1) { return v1 == json[0].category; }
                }
            });
        });
    });
    //} else {
    //    res.redirect('/login');
    //}
}
exports.updateJob = updateJob;
function updateJobSubmit(req, res) {
    var idJob = req.body._id;
    var body = req.body;
    var json;
    //if (req.session.privilege == 'admin') {
    console.log(body.photo);
    api.findData(idJob, 'jobsById').then(function (job) {
        json = job.rows[0].doc;
        if (job.rows[0].doc.image && req.file && job.rows[0].doc.image != "") {
            var oldImg = job.rows[0].doc.image;
            fs.unlink(oldImg);
        }
        if (req.file) {
            json.image = '/uploads/' + req.file.filename;
        }
        console.log(req.file);
        json.title = body.title;
        json.description = body.description;
        json.location = body.location;
        json.salary = body.salary;
        json.expireDate = body.expireDate;
        json.category = body.category;
        api.updateData(json).then(function () {
            req.flash('successUpdate', 'You are successfully updating !', { maxage: 6000 });
            res.redirect('/admin/jobs-management');
        });
    });
    //} else {
    //    res.redirect('/login');
    //}
}
exports.updateJobSubmit = updateJobSubmit;
//# sourceMappingURL=admin.js.map