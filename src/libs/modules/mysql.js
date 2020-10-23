"use strict"

// import mysql module
const mysql = require('mysql');

// set CONSTANTS
const HOST = "cpcollabnetwork8.cn244vkxrxzn.us-west-1.rds.amazonaws.com";
const USER = "kevin";
const PASSWORD = "%Gwe%.A.puP'^/8j";
const DBNAME = "cpcollabnet2019";

const connection = mysql.createConnection({
  host: HOST,
  user: USER,
  password: PASSWORD,
  database: DBNAME
});

connection.connect((err) => {
  if (err) throw err;
  console.log('Connected!');

  const qstring = "SELECT ResearcherMerged.rid, ResearcherMerged.name, CurrentEmployment.iid FROM ResearcherMerged INNER JOIN CurrentEmployment ON ResearcherMerged.rid = CurrentEmployment.rid LIMIT 5";
  
  connection.query(qstring, function (err, result, fields) {
    if (err) throw err;
    console.log(result);
  });

});