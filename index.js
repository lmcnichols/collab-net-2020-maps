"use strict";

const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();

/* Enable cors */
app.use(cors())

/* Use express router */
app.use('/api/data', require('./routes/api/data'));
app.use('/api/edges', require('./routes/api/edges'));

/* Setting a static folder. This doesnt really do anything for single
   page web apps but automatically routes the html */
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3000;

app.listen(PORT, function() {
    console.log(`Server started on port ${PORT}`);
});