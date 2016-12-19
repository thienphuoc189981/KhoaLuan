import {Project} from "./database";
import express = require('express');
let api = new Project.api();
let async = require("async");
var request = require('request');
var http = require('http');
var datetime = require('node-datetime');
var fs = require('fs');


export function index(req, res) {
    let json = [];
    //if (req.session.privilege == 'admin') {
    api.indexView('usersById').then(function (rs) {
        rs.rows.forEach(function (u) {
            json.push(u.doc);
        });
        res.render('./admin/index', {
            json: json, layout: 'admin', session: req.session, message: req.flash(),
            helpers: {
                eq: function (v1) { return v1 == json.status; }
            }});
        });
    //} else {
    //    res.redirect('/login');
    //}
   
}

export function updateUser(req, res) {
    let json: any;
    let id = req.params.id;
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

export function updateUserSubmit(req, res) {
    let json: any;
    let id = req.body._id;
    let body = req.body;
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

export function deleteUser(req, res) {
    let id = req.params.id;
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

//------jobs-------//
export function managementJobs(req, res) {
    let json = [];
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

export function deleteJob(req, res) {
    let id = req.params.id;
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

export function updateJob(req, res) {
    let idJob = req.params.id;
    let json = [];
    let cats = [];
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

export function updateJobSubmit(req: express.Request, res: express.Response) {
    let idJob = req.body._id;
    let body = req.body;
    let json: any;
    //if (req.session.privilege == 'admin') {
    console.log(body.photo);
    api.findData(idJob, 'jobsById').then(function (job) {
        json = job.rows[0].doc;
            if (job.rows[0].doc.attachment && req.file && job.rows[0].doc.attachment != "") {
                let oldImg = job.rows[0].doc.attachment;
                fs.unlink(oldImg);
            }

            if (req.file) {
                json.attachment = '/uploads/' + req.file.filename;
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