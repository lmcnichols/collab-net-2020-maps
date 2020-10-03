"use strict";

// class representing a publication

class Publication {
    constructor(title, authorId) {
        this.title = title;
        this.authors = [authorId]
    }

    addAuthor(authorId) {
        this.authors.push(authorId)
    }
}

module.exports = Publication;