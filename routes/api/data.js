"use strict";

// import nodejs dependencies
const express = require('express');
const url = require('url');
const router = express.Router();

// import data objects
var preprocess = require('./preprocess');
var institutionData = preprocess.institutionData;
var collaboratorData = preprocess.collaboratorData;
var publicationData = preprocess.publicationData;

/* Populate global data objects */
router.get('/scrapeData', function(req, res) {
    // scrape the data
    preprocess.scrapeData();

    /* These local objects are only for testing, we send them as
       JSON response to check formatting */

    var localInstMap = {};
    institutionData.forEach(function (value, key) {
        localInstMap[key] = value;
    })

    var localColMap = {};
    collaboratorData.forEach(function (value, key) {
        localColMap[key] = value;
    })

    var localPubMap = {};
    publicationData.forEach(function (value, key) {
        localPubMap[key] = value;
    })

    var data = {
        "institutions" : localInstMap,
        "collaborators" : localColMap,
        "publications" : localPubMap
    };

    res.send(data);
})

router.get('/getCollaborators', function(req, res) {
    const searchParams = url.parse(req.url, true).query;
    const sourceid = parseInt(searchParams["instid"]);
    const source = institutionData.get(sourceid);
    var collabMap = {};

    // getting all collaborators for each publication
    source["collaborators"].forEach(function (authorId) {
        // getting all publications for each collaborator
        //publicationData.get(title)["authors"].forEach(function (authorId) {
        var publications = collaboratorData.get(authorId)["publications"];
        var name = collaboratorData.get(authorId)["name"];
        collabMap[name] = publications;
    })

    res.json(collabMap);
    
});

module.exports = router;