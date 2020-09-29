"use strict";

// class representing a collaborator

class collaborator {
    constructor(name, scopusid, publications, instname) {
        this.name = name;
        this.scopusid = scopusid;
        this.publications = publications;
        this.friends = {};
        this.instname = instname;
    }
}