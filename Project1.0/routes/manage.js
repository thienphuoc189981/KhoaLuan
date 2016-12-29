"use strict";
/*
 * GET manage jobs.
 */
var database_1 = require("./database");
var api = new database_1.Project.api();
var async = require("async");
var fs = require('fs');
var passwordHash = require('password-hash');
function index(req, res) {
    var json = [];
    if (req.session.email) {
        api.syncDB();
        api.findData(req.session.userId, 'jobsByUsers').then(function (result) {
            result.rows.forEach(function (row) {
                json.push(row.doc);
            });
            //console.log(json);
            res.render('./manageJobs', { session: req.session, jobs: json, message: req.flash() });
        });
    }
    else {
        res.render('./login', { nextlink: '/' });
    }
}
exports.index = index;
;
function viewApplicator(req, res) {
    var idJob = req.params.id;
    var json = [];
    var idTemps = [];
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
                res.render('./applicator', { session: req.session, users: json });
            });
        });
    }
    else {
        res.render('./login', { nextlink: '/' });
    }
}
exports.viewApplicator = viewApplicator;
;
function updateJob(req, res) {
    var idJob = req.params.id;
    var json = [];
    var cats = [];
    if (req.session.email) {
        api.findData(idJob, 'jobsById').then(function (result) {
            api.indexView("categoriesAll").then(function (data) {
                data.rows.forEach(function (item) {
                    cats.push(item.key);
                });
                json.push(result.rows[0].doc);
                //console.log(json[0]);
                res.render('./updateJob', {
                    session: req.session, job: json[0], cats: cats,
                    helpers: {
                        eq: function (v1) { return v1 == json[0].category; }
                    }
                });
            });
        });
    }
    else {
        res.render('./login', { nextlink: '/' });
    }
}
exports.updateJob = updateJob;
function updateJobSubmit(req, res) {
    var idJob = req.body._id;
    var body = req.body;
    var json;
    api.findData(idJob, 'jobsById').then(function (job) {
        json = job.rows[0].doc;
        if (req.session.userId == job.rows[0].doc.users.postId) {
            if (job.rows[0].doc.image && req.file && job.rows[0].doc.image != "") {
                var oldImg = job.rows[0].doc.image;
                fs.unlink(oldImg);
            }
            if (req.file) {
                json.image = '/uploads/' + req.file.filename;
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
        }
        else {
            res.render('./login', { nextlink: '/' });
        }
    });
}
exports.updateJobSubmit = updateJobSubmit;
function deleteJob(req, res) {
    var idJob = req.params.id;
    api.findData(idJob, 'jobsById').then(function (job) {
        if (req.session.userId == job.rows[0].doc.users.postId) {
            api.deleteData(job.rows[0].doc._id, job.rows[0].doc._rev).then(function () {
                req.flash('success', 'You are successfully deleting !', { maxage: 6000 });
                res.redirect('/manage-jobs');
            });
        }
        else {
            res.render('./login', { nextlink: '/' });
        }
    });
}
exports.deleteJob = deleteJob;
function viewJob(req, res) {
    var idJob = req.params.id;
    var job = [];
    api.findData(idJob, 'jobsById').then(function (rs) {
        job.push(rs.rows[0].doc);
        console.log(job);
        res.render('./viewJob', { session: req.session, job: job[0], message: req.flash() });
    });
}
exports.viewJob = viewJob;
function applyJob(req, res) {
    var idJob = req.params.id;
    if (req.session.email) {
        api.findData(idJob, 'jobsById').then(function (rs) {
            rs.rows[0].doc.users.applyId.push(req.session.userId);
            console.log(rs.rows[0].doc.users.applyId);
            api.updateData(rs.rows[0].doc).then(function () {
                req.flash('successApply', 'You are successfully applying !', { maxage: 6000 });
                res.redirect('/job-detail/' + idJob);
            });
        });
    }
}
exports.applyJob = applyJob;
function applySignup(req, res) {
    var user = req.body;
    var idJob = user.id;
    delete user['id'];
    var sess = req.session;
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
exports.applySignup = applySignup;
//# sourceMappingURL=manage.js.map