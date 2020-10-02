"use strict";

// import nodejs dependencies
const express = require('express');
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
//var data = {};
var institutionData = new Map();
var collaboratorData = new Map();
var publicationData = new Map();
/* ================================================== */

/* Populate global data objects */
router.get('/scrapeData', function(req, res) {
    var t1 = performance.now();
    var count = 0;

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
        if (institutionData.has(instname)) {
            var inst = institutionData.get(instname);
            inst.addPublications(publications);
            inst.addCollaborator(name);
        } else {
            var newInst = new Institution(instname, count, location, publications, name);
            institutionData.set(instname, newInst);
            count++;
        }

        // make new collaborator object
        var newCollab = new Collaborator(name, scopusid, publications, instname)
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

    /*var localInstMap = {};
    institutionData.forEach(function (value, key) {
        localInstMap[key] = value;
    })
    res.json(localInstMap)*/

    /*var localColMap = {};
    collaboratorData.forEach(function (value, key) {
        localColMap[key] = value;
    })
    res.json(localColMap)*/

    /*var localPubMap = {};
    publicationData.forEach(function (value, key) {
        localPubMap[key] = value;
    })
    res.json(localPubMap)*/
    res.sendStatus(200)

    var t2 = performance.now();
    console.log(`This took ${(t2 - t1) / 1000} seconds`);
})

// Cleanup publications array scraped from file
function cleanPublications(pubs) {
    for (var i = 0; i < pubs.length; i++) {
        pubs[i] = pubs[i].trim();
    }
}

/* Get all marker locations */
router.get('/markerLocations', function(req, res) {
    var institutions = {};

    institutionData.forEach(function(instobject, instname) {
        institutions[instname] = {
            "location" : {
                "lat" : instobject.location[0],
                "lng" : instobject.location[1]
            },
            "collaborators" : instobject.collaborators
    
        };
    });

    res.send(institutions);
})

module.exports = router;