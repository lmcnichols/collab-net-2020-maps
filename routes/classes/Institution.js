"use strict";

// class representing an institution
class Institution {
    constructor(name, id, location, publications, collaborator) {
        this.name = name;
        this.id = id;
        this.location = location;
        this.publications = publications;
        this.collaborators = [collaborator];
    }

    addPublications(publications) {
        for (var i = 0; i < publications.length; i++) {
            if (!this.publications.includes(publications[i])) {
                this.publications.push(publications[i])
            }
        }
    }

    addCollaborator(collaborator) {
        this.collaborators.push(collaborator);
    }
}

module.exports = Institution;