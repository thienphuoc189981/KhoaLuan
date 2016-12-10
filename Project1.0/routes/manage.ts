﻿/*
 * GET manage jobs.
 */
import {Project} from "./database";
let api = new Project.api();
var fs = require('fs');
import express = require('express');

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
    let json = req.body;
    api.findData(idJob, 'jobsById').then(function (job) {
        if (req.session.userId == job.rows[0].doc.users.postId) {
        if (job.rows[0].doc.attachment && req.file && job.rows[0].doc.attachment!="") {
            let oldImg = job.rows[0].doc.attachment;
            fs.unlink(oldImg);
        }
        if (req.file) {
            json.attachment = '/uploads/' + req.file.filename;
        }
        api.updateData(json).then(function () {
            req.flash('success', 'You are successfully updating !');
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
                req.flash('success', 'You are successfully deleting !');
                res.redirect('/manage-jobs');
            });
        } else {
            res.render('./login', { nextlink: '/' });
        }
    });
}