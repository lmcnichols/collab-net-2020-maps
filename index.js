const express = require('express');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

const app = express();

/* Enable cors */
app.use(cors())

app.get('/api/collaborators', function(req, res) {
    var obj = fs.readFileSync('outGraph.json', 'utf-8', function(err, data) {
        if (err) throw err;
        return data;
    });

    res.send(obj);
});

/* Setting a static folder. This doesnt really do anything for single
   page web apps but automatically routes the html */
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3000;

app.listen(PORT, function() {
    console.log(`Server started on port ${PORT}`);
});