"use strict";

// class representing a collaborator

class Collaborator {
    constructor(name, scopusid, publications, instid) {
        this.name = name;
        this.scopusid = scopusid;
        this.publications = publications;
        this.instid = instid;
    }
}

module.exports = Collaborator;