/*"use strict";

// class representing a publication

class Publication {
    constructor(id, title, authors) {
        this.id = id;
        this.title = title;
        this.authors = authors;
    }
}

module.exports = Publication;*/
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
