"use strict";

// class representing a publication

class Publication {
    constructor(id, title, authors) {
        this.id = id;
        this.title = title;
        this.authors = authors;
    }
}

module.exports = Publication;