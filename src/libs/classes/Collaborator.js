"use strict";

// class representing a collaborator

class Collaborator {
    constructor(name, id, instid) {
        this.name = name;
        this.id = id;
        this.publications = [];
        this.instid = instid;
    }

    addPublication(id) {
        this.publications.push(id);
    }
}

module.exports = Collaborator;