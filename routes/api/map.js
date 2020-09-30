"use strict";

// import nodejs dependencies
const express = require('express');
const router = express.Router();
const fs = require('fs');
const { performance } = require('perf_hooks');

// import classes
var Institution = require('../classes/Institution');
var Collaborator = require('../classes/Collaborator');

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

    /* These local objects are only for testing, we send them as
       JSON response to check formatting */
    /*var localInstMap = {};
    institutionData.forEach(function (value, key) {
        localInstMap[key] = value;
    })

    var localColMap = {};
    collaboratorData.forEach(function (value, key) {
        localColMap[key] = value;
    })*/
    
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

/* Get all schools */
router.get('/collaborators', function(req, res) {
    var obj = fs.readFileSync(GRAPH_FILE, 'utf-8', function(err, fileContents) {
        if (err) throw err;
        return fileContents;
    });

    /* The commented out code below is used when the response is
       in the format of an array, as opposed to just a JSON object
       where the name of the school is the property of the object */
    /*var schoolsSet = new Set();
    var schools = [];
    
    JSON.parse(obj).features.forEach(function(collaborator) {
        var schoolName = collaborator.properties.personalInfo.attributes.AffName;
        if (!schoolsSet.has(schoolName)) {
            schoolsSet.add(schoolName);
            var lat = collaborator.geometry.coordinates[0];
            var lng = collaborator.geometry.coordinates[1];
            schools.push({
                "lat": lat,
                "lng": lng
            })
        };
    });*/

    var schools = {};
    JSON.parse(obj).features.forEach(function(collaborator) {
        var schoolName = collaborator.properties.personalInfo.attributes.AffName;
        if (!schools.hasOwnProperty(schoolName)) {
            var lat = collaborator.geometry.coordinates[0];
            var lng = collaborator.geometry.coordinates[1];
            schools[schoolName] = {
                "lat": lat,
                "lng": lng
            };
        }
    });

    res.send(schools);
})

module.exports = router;