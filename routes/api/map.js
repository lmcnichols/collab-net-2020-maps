const express = require('express');
const router = express.Router();
const fs = require('fs');

const GRAPH_FILE = 'outGraph.json';

/* Get all schools */
router.get('/collaborators', function(req, res) {
    var obj = fs.readFileSync(GRAPH_FILE, 'utf-8', function(err, data) {
        if (err) throw err;
        return data;
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