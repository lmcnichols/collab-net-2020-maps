"use strict";

// class representing an institution
export class Institution {
    constructor(name, id, location, publications, collaborator) {
        this.name = name;
        this.id = id;
        this.location = location;
        this.publications = publications;
        this.collaborators = [collaborator];
    }

    addPublications(publications) {
        this.publications.forEach(function(pub) {
            if (!this.publications.includes(pub)) {
                this.publications.push(pub);
            }
        });
    }

    addCollaborator(collaborator) {
        this.collaborators.push(collaborator);
    }
}