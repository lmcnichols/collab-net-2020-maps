"use strict";

// class representing an institution
class Institution {
    constructor(name, id, location) {
        this.name = name;
        this.id = id;
        this.location = location;
        this.publications = new Set();
        this.collaborators = new Set();
    }

    addPublication(id) {
        this.publications.add(id);
    }

    addCollaborator(id) {
        this.collaborators.add(id);
    }
}

module.exports = Institution;