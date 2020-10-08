# Design Decisions Log

### In this document we will log the design decisions and explanations of why we went with a certain tool, algorithm, etc...

**Base code** - The base code for this project was a package of python programs which parsed the original CSV and used a geocoding API to create a JSON file containing information about all collaborators on the dataframe. This JSON file was then used to generate a file containing static JavaScript code to render the Google Map, markers, and edges connecting institutions. The result was this [webpage](http://users.csc.calpoly.edu/~zwood/research/RSCAMap/papermaps.html). An error saying "This page can't load Google Maps correctly." will pop up; this is just the result of an expired API key. The format of the JSON file is included below.
```
{"type": "FeatureCollection",
    "features": [
        {
            "type": "Feature",
            "geometry": {
                "coordinates": [
                    36.3697191,
                    127.362537001151
                ],
                "type": "Point"
            },
            "properties": {
                "name": "Kyungmook Kwon",
                "personalInfo": {
                    "attributes": {
                        "City": " Yusong",
                        "S2016": 0,
                        "S2015": 0,
                        "Country": " South Korea",
                        "S2011": 0,
                        "Dept": null,
                        "S2012": 0,
                        "STot": 0,
                        "PostCode": null,
                        "CountryCode": " kor",
                        "PubNum": 4,
                        "S2014": 0,
                        "Name": "Kyungmook Kwon",
                        "Race": null,
                        "Verified": null,
                        "S2010": 0,
                        "S2013": 0,
                        "AffName": " Korea Advanced Institute of Science & Technology",
                        "Position": null,
                        "Gender": null,
                        "SCOPUSID": 54794209900,
                        "UCID": null
                    },
                    "publications": [
                        " Direction-Selective Emission With Small Angular Divergence From A Subwavelength Aperture Using Radiative Waveguide Modes",
                        " Lasing In Hybrid Metal-Bragg Nanocavities",
                        " Open Nanopatch Cavity With Annular Bragg Reflector And Bottom Metal Plane",
                        " Room-Temperature Lasing Of A Circular Bragg Cavity Laser With A Bottom Metal Plane"
                    ]
                }
            }
        },...]
}
```

**Switching framework** - In order to produce an interactive map with added features and various options for viewing, we decided to refactor the code into a client-server web application using Node.js. The goal is that a request can be made on the client side (i.e. view all edges coming from a selected institution) and the necessary computations can be done on the server side. The client will use the response to display the desired features on the map.

**Deciding Data Structures to build graph** - The original base code used an adjacency matrix to represent the graph. Because we need to eventually operate on the collaborator level, we needed a way to access institution information, collaborator information as well as publication information. At this point we're creating a bunch of maps in the backend and when we need to do some kind of computation (i.e. finding all the outgoing edges from a single publication), we send an API request to the server where the maps are used for the computation.

**Visual representation of the edges** - Currently, the "object" used to render the line between two institutions is what is called a "projection" in the google maps api. This projection object may be what is causing the slowdown.