"use strict";

// import nodejs dependencies
const express = require('express');
const url = require('url');
const router = express.Router();

// import data objects
var preprocess = require('../libs/modules/preprocess');
var institutionData = preprocess.institutionData;
var collaboratorData = preprocess.collaboratorData;
var publicationData = preprocess.publicationData;

// create all edges for a given institution
router.get('/getEdges', function(req, res) {
    const searchParams = url.parse(req.url, true).query;
    const sourceid = parseInt(searchParams["instid"]);
    const source = institutionData.get(sourceid);
    var edgeMap = {};

    // getting all collaborating institutions for each publication
    source["publications"].forEach(function (title) {
        // getting all authors for the current title
        publicationData.get(title)["authors"].forEach(function (authorId) {
            var colInst = collaboratorData.get(authorId)["instid"];

            // if the collaborating inst is not the current inst AND
            // if the current inst's edgeMap does not contain an edge to
            // the collaborating inst add it
            if (colInst != sourceid) {
                // if we've already seen this institution, add author to collabs
                if (edgeMap.hasOwnProperty(colInst)) {
                    edgeMap[colInst].push(authorId);
                } else {
                    edgeMap[colInst] = [authorId];
                }
            }
        })
    })

    res.json(edgeMap);
});

router.get('/getCollabEdges', function(req, res) {
    const searchParams = url.parse(req.url, true).query;
    const sourceid = parseInt(searchParams["instid"]);
    const source = institutionData.get(sourceid);
    var edgeMap = {};

    // getting all collaborating institutions for each publication
    source["publications"].forEach(function (title) {
        // getting all authors for the current title
        publicationData.get(title)["authors"].forEach(function (authorId) {
            var colInst = collaboratorData.get(authorId)["instid"];

            // if the collaborating inst is not the current inst AND
            // if the current inst's edgeMap does not contain an edge to
            // the collaborating inst add it
            if (colInst != sourceid) {
                // if we've already seen this institution, add author to collabs
                if (edgeMap.hasOwnProperty(colInst)) {
                    edgeMap[colInst].push(authorId);
                } else {
                    edgeMap[colInst] = [authorId];
                }
            }
        })
    })

    res.json(edgeMap);
});


module.exports = router;