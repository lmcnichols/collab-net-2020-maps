"use strict";

// import nodejs dependencies
const express = require('express');
const url = require('url');
const router = express.Router();
const fs = require('fs');
const { performance } = require('perf_hooks');

// import classes
var Institution = require('../classes/Institution');
var Collaborator = require('../classes/Collaborator');
var Publication = require('../classes/Publication');

/*
    GLOBAL VARIABLES
    BE CAREFUL NOT TO USE THESE NAMES
    or else you're gonna pay
*/

/* ================================================== */
const GRAPH_FILE = 'outGraph.json';
var institutionData = new Map();
var collaboratorData = new Map();
var publicationData = new Map();
var EDGES = new Map();
/* ================================================== */

/* Populate global data objects */
router.get('/scrapeData', function(req, res) {
    var t1 = performance.now();
    var count = 0;
    var tempMap = new Map();

    var obj = fs.readFileSync(GRAPH_FILE, 'utf-8', function(err, fileContents) {
        if (err) throw err;
        return fileContents;
    });

    JSON.parse(obj).features.forEach(function(collaborator) {
        // scrape collaborator information
        var name = collaborator["properties"]["name"].trim();
        var scopusid = collaborator["properties"]["personalInfo"]["attributes"]["SCOPUSID"];

        // scrape institution information
        var instname = collaborator["properties"]["personalInfo"]["attributes"]["AffName"];
        if (instname === null){
            instname = "Unknown Institution";
        } else {
            instname = instname.trim();
        }
        var publications = collaborator["properties"]["personalInfo"]["publications"];
        var location = collaborator["geometry"]["coordinates"];

        // remove white spaces at the ends of publication names
        cleanPublications(publications);

        // make new institution object or add to existing institution object
        // update dictionary with "instname" : new inst object
        if (tempMap.has(instname)) {
            var inst = institutionData.get(tempMap.get(instname));
            inst.addPublications(publications);
            inst.addCollaborator(scopusid);
        } else {
            var newInst = new Institution(instname, count, location, publications, scopusid);
            tempMap.set(instname, count);
            institutionData.set(count, newInst);
            count++;
        }

        // make new collaborator object
        var newCollab = new Collaborator(name, scopusid, publications, tempMap.get(instname))
        collaboratorData.set(scopusid, newCollab);
    });

    collaboratorData.forEach(function(cobject, cname) {
        cobject.publications.forEach(function(pname) {
            if (publicationData.has(pname)) {
                var pub = publicationData.get(pname);
                pub.addAuthor(cobject.scopusid);
            } else {
                var newPub = new Publication(pname, cobject.scopusid);
                publicationData.set(pname, newPub);
            }
        });
    });

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

    var t2 = performance.now();
    console.log(`This took ${(t2 - t1) / 1000} seconds`);
})

// Cleanup publications array scraped from file
function cleanPublications(pubs) {
    for (var i = 0; i < pubs.length; i++) {
        pubs[i] = pubs[i].trim();
    }
}

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

module.exports = router;