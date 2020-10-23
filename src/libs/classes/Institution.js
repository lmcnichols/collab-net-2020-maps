"use strict";

// class representing an institution
class Institution {
    constructor(name, id, location, publications, colScopus) {
        this.name = name;
        this.id = id;
        this.location = location;
        this.publications = publications;
        this.collaborators = [colScopus];
    }

    addPublications(publications) {
        for (var i = 0; i < publications.length; i++) {
            if (!this.publications.includes(publications[i])) {
                this.publications.push(publications[i]);
            }
        }
    }

    addCollaborator(colScopus) {
        this.collaborators.push(colScopus);
    }
}

module.exports = Institution;