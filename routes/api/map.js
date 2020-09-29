"use strict";

// import nodejs dependencies
const express = require('express');
const router = express.Router();
const fs = require('fs');
const { performance } = require('perf_hooks');

// import classes
var Institution = require('../classes/Institution');

/*
    GLOBAL VARIABLES
    BE CAREFUL NOT TO USE THESE NAMES
    or else you're gonna pay
*/

/* ================================================== */
const GRAPH_FILE = 'outGraph.json';
var data = {};
var institutionData = {};
var collaboratorData = {};
var publicationData = {};
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
        var name = collaborator["properties"]["name"];
        var scopusid = collaborator["properties"]["personalInfo"]["attributes"]["SCOPUSID"];

        // scrape institution information
        var instname = collaborator["properties"]["personalInfo"]["attributes"]["AffName"];
        if (instname === null)
            instname = "Unknown Institution";
        var publications = collaborator["properties"]["personalInfo"]["publications"];
        var location = collaborator["geometry"]["coordinates"];

        // remove space at beginning of titles
        cleanPublications(publications);

        // make new school object or add to existing school object
        if (institutionData.hasOwnProperty(instname)) {
            var inst = institutionData[instname];
            inst.addPublications(publications);
            inst.addCollaborator(name);
        } else {
            var newInst = new Institution(instname, count, location, publications, name);
            institutionData[instname] = newInst;
            count++;
        }

        // 
    });

    res.send(institutionData);

    var t2 = performance.now();
    console.log(`This took ${(t2 - t1) / 1000} seconds`);
})

// Cleanup publications array scraped from file
function cleanPublications(pubs) {
    for (var i = 0; i < pubs.length; i++) {
        pubs[i] = pubs[i].substring(1);
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