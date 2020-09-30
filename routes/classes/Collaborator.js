"use strict";

// class representing a collaborator

class Collaborator {
    constructor(name, scopusid, publications, instname) {
        this.name = name;
        this.scopusid = scopusid;
        this.publications = publications;
        this.friends = {};
        this.instname = instname;
    }
}

module.exports = Collaborator;