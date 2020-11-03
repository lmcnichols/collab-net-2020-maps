"use strict"

// import mysql module
//const mysql = require('mysql');
const { performance } = require('perf_hooks');

// import classes
var Institution = require('../classes/Institution');
var Collaborator = require('../classes/Collaborator');
var Publication = require('../classes/Publication');


// set CONSTANTS
const GRAPH_FILE = 'outGraph.json';

const fs = require('fs');

const HOST = "cpcollabnetwork8.cn244vkxrxzn.us-west-1.rds.amazonaws.com";
const USER = "kevin";
const PASSWORD = "%Gwe%.A.puP'^/8j";
const DBNAME = "cpcollabnet2019";
/*const pool = mysql.createPool({
  host: HOST,
  user: USER,
  password: PASSWORD,
  database: DBNAME
});*/

/* ================================================== */
const institutionData = new Map();
const collaboratorData = new Map();
const publicationData = new Map();
/* ================================================== */

/*async function scrapeData() {
    // start timer
    var t1 = performance.now();

    // get institutions and collaborators
    await fillInstitutions();
    await fillCollaborators();
    fillPublications();
    //console.log(institutionData);
    //console.log(collaboratorData);

    // end timer
    var t2 = performance.now();
    console.log(`This took ${(t2 - t1) / 1000} seconds`);
}

// query and fill collaborator data
async function fillCollaborators() {
    // make query
    const qstring = "SELECT AuthorMerged.rid, ResearcherMerged.name, EmploymentMerged.iid " +
                    "FROM " +
                    "AuthorMerged " +
                        "INNER JOIN " +
                    "ResearcherMerged ON AuthorMerged.rid = ResearcherMerged.rid " + 
                        "LEFT JOIN " +
                    "EmploymentMerged ON EmploymentMerged.rid = AuthorMerged.rid";
    const rows = await makeQuery(qstring);

    // fill collaborators data
    rows.forEach(function(row) {
        var name = row["name"];
        var id = row["rid"];
        var instid = row["iid"];
        var newCollab = new Collaborator(name, id, instid);
        //console.log(newCollab);
        if (institutionData.has(instid)) {
            institutionData.get(instid).addCollaborator(id);
        }
        collaboratorData.set(id, newCollab);
    });
}

// query and fill institution data
async function fillInstitutions() {
    // make query
    const qstring = "SELECT iid, institution, lat, lng " +
              "FROM InstitutionMerged";
    const rows = await makeQuery(qstring);
    
    // fill institution data
    rows.forEach(function(row) {
        var name = row["institution"];
        var id = row["iid"];
        var loc = [row["lat"], row["lng"]];
        var newInst = new Institution(name, id, loc);
        institutionData.set(id, newInst);
    });
}

// query and fill publication data
async function fillPublications() {
    // make query
    const qstring = "SELECT AuthorMerged.cid, CollaborationMerged.title, GROUP_CONCAT(AuthorMerged.rid) AS rids " +
                        "FROM AuthorMerged " +
                            "INNER JOIN " +
                        "CollaborationMerged ON CollaborationMerged.cid = AuthorMerged.cid " +
                        "GROUP BY AuthorMerged.cid;"
    const rows = await makeQuery(qstring);

    // fill publications data
    rows.forEach(function(row) {
        var id = row["cid"];
        var title = row["title"];
        var authors = row["rids"].split(",").map(rid => parseInt(rid));
        var newPub = new Publication(id, title, authors);
        publicationData.set(id, newPub);
        
        // update institution and collaborator data
        authors.forEach(function(rid) {
            //console.log(row);
            //console.log(collaboratorData.get(rid));
            if (collaboratorData.has(rid)) {
                var instid = collaboratorData.get(rid)["instid"];
            } else {
                console.log(rid);
            }

            if (institutionData.has(instid)) {
                institutionData.get(instid).addPublication(id);
            }

            if (collaboratorData.has(rid)) {
                collaboratorData.get(rid).addPublication(id);
            }
        });
    });
}

function makeQuery(qstring, binding) {
    return new Promise(function(resolve, reject) {
        pool.query(qstring, binding, function (err, result, fields) {
            if (err)  reject(err);
            resolve(result);
        });
    });
}
*/

function scrapeData() {
    
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
        if (instname === null) {
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

    var t2 = performance.now();
    console.log(`This took ${(t2 - t1) / 1000} seconds`);
}

// Cleanup publications array scraped from file
function cleanPublications(pubs) {
    for (var i = 0; i < pubs.length; i++) {
        pubs[i] = pubs[i].trim();
    }
}

module.exports = {
    scrapeData : scrapeData,
    institutionData : institutionData,
    collaboratorData : collaboratorData,
    publicationData : publicationData
}