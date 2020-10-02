"use strict";

// class representing a publication

class Publication {
    constructor(title, authorId) {
        this.title = title;
        this.authorsById = [authorId]
    }

    addAuthor(authorId) {
        this.authorsById.push(authorId)
    }
}

module.exports = Publication;