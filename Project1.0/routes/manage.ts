/*
 * GET manage jobs.
 */
import {Project} from "./database";
let api = new Project.api();
let async = require("async");
var fs = require('fs');
import express = require('express');
var passwordHash = require('password-hash');

export function index(req: express.Request, res: express.Response) {
    let json = [];
    if (req.session.email) {
    api.syncDB();
    api.findData(req.session.userId, 'jobsByUsers').then(function (result) {
        
        result.rows.forEach(function (row) {
            json.push(row.doc);
        });
        //console.log(json);
        res.render('./manageJobs', { session: req.session, jobs: json, message: req.flash()});
        });
    } else {
        res.render('./login', { nextlink: '/' });
    }
};

export function viewApplicator(req: express.Request, res: express.Response) {
    let idJob = req.params.id;
    let json = [];
    let idTemps = [];
    if (req.session.email) {
        async.waterfall([
            //Get all applicator's id from database
            function (callback) {
                api.findData(idJob, 'jobsById').then(function (job) {
                    //console.log(job.rows[0].doc.users.applyId);
                    //console.log(Object.keys(job.rows[0].doc.applyId).length);
                    job.rows[0].doc.users.applyId.forEach(function (applicatorId) {
                        idTemps.push(applicatorId);
                    });
                   
                    callback(null, idTemps);
                });
            }
        ], function (err, idTemps) {
                api.getMultipleData(idTemps, "usersById").then(function (users) {
                    //console.log(users);
                    users.rows.forEach(function (user) {
                        json.push(user.doc);
                    });
                    console.log(json);
                    res.render('./applicator', { session: req.session, users: json});
                });
        });
    } else {
        res.render('./login', { nextlink: '/' });
    }
};

export function updateJob(req: express.Request, res: express.Response) {
    let idJob = req.params.id;
    let json = [];
    let cats = [];
    if (req.session.email) {
        api.findData(idJob, 'jobsById').then(function (result) {
            api.indexView("categoriesAll").then(function (data) {
                data.rows.forEach(function (item) {
                    cats.push(item.key);
                });
                json.push(result.rows[0].doc);
                console.log(json[0]);
                res.render('./updateJob', {
                    session: req.session, job: json[0], cats: cats,
                    helpers: {
                        eq: function (v1) { return v1 == json[0].category; }
                    }
                });
            });
        });
    } else {
        res.render('./login', { nextlink: '/' });
    }
}

export function updateJobSubmit(req: express.Request, res: express.Response) {
    let idJob = req.body._id;
    let body = req.body;
    let json: any;
    api.findData(idJob, 'jobsById').then(function (job) {
        json = job.rows[0].doc;
        if (req.session.userId == job.rows[0].doc.users.postId) {
        if (job.rows[0].doc.attachment && req.file && job.rows[0].doc.attachment!="") {
            let oldImg = job.rows[0].doc.attachment;
            fs.unlink(oldImg);
            }

        if (req.file) {
            json.attachment = '/uploads/' + req.file.filename;
        }
        json.title = body.title;
        json.description = body.description;
        json.location = body.location;
        json.salary = body.salary;
        json.expireDate = body.expireDate;
        json.category = body.category;

        api.updateData(json).then(function () {
            req.flash('success', 'You are successfully updating !', { maxage: 6000 });
            res.redirect('/manage-jobs');
        });
        } else {
            res.render('./login', { nextlink: '/' });
        }
    });
}

export function deleteJob(req: express.Request, res: express.Response) {
    let idJob = req.params.id;
    
    api.findData(idJob, 'jobsById').then(function (job) {
        console.log(req.session.userId == job.rows[0].doc.users.postId);
        if (req.session.userId == job.rows[0].doc.users.postId) {
            console.log("delete now " + job.rows[0].doc._id);
            api.deleteData(job.rows[0].doc._id, job.rows[0].doc._rev).then(function () {
                req.flash('success', 'You are successfully deleting !', { maxage: 6000 });
                res.redirect('/manage-jobs');
            });
        } else {
            res.render('./login', { nextlink: '/' });
        }
    });
}

export function viewJob(req: express.Request, res: express.Response) {
    let idJob = req.params.id;
    let job = [];
    api.findData(idJob, 'jobsById').then(function (rs) {
        job.push(rs.rows[0].doc);
        //console.log(job);
        res.render('./viewJob', { session: req.session, job: job[0], message: req.flash() });
    });
}

export function applyJob(req: express.Request, res: express.Response) {
    let idJob = req.params.id;
    if (req.session.email) {
        api.findData(idJob, 'jobsById').then(function (rs) {
            rs.rows[0].doc.users.applyId.push(req.session.userId);
            //console.log(rs.rows[0].doc.users.applyId);
            api.updateData(rs.rows[0].doc).then(function () {
                req.flash('successApply', 'You are successfully applying !', { maxage: 6000 });
                res.redirect('/job-detail/' + idJob);
            });
        });
    } 
}

export function applySignup(req: express.Request, res: express.Response) {
    let user = req.body;
    let idJob = user.id;
    delete user['id'];
    let sess = req.session;
    user.type = 'users';
    user.status = 'active';
    user.password = passwordHash.generate(user.password);

    api.insertData(user).then(function () {
        api.findData(user.email, 'usersByEmail').then(function (rs) {
            sess.email = rs.rows[0].doc.email;
            sess.name = rs.rows[0].doc.name;
            sess.userId = rs.rows[0].doc._id;
            console.log(sess);
            api.findData(idJob, 'jobsById').then(function (rs) {
                rs.rows[0].doc.users.applyId.push(req.session.userId);
                //console.log(rs.rows[0].doc.users.applyId);
                api.updateData(rs.rows[0].doc).then(function () {
                    req.flash('successApply', 'You are successfully applying !', { maxage: 6000 });
                    res.redirect('/job-detail/' + idJob);
                });
            });
        });
    });
}