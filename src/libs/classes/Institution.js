/*"use strict";

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

module.exports = Institution;*/
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