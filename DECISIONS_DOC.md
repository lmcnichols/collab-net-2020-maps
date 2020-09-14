# Design Decisions Log
## In this document we will log the design decisions and explanations of why we went with a certain tool, algorithm, etc...

</br>

**Base Code** - The base code for this project was a package of python programs which parsed the original CSV and used a geocoding API to create a JSON file containing information about all collaborators on the dataframe. This JSON file was then used to generate a file containing static JavaScript code to render the Google Map, markers, and edges connecting institutions. The format of the JSON file is included below.
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