var map;
const CURVATURE = 0.5;
const CALPOLYLATLNG = {lat: 35.3, lng: -120.65};
const ZOOM = 6;

var markers = [];

function initMap() {
  var options = {
    center: CALPOLYLATLNG,
    zoom: ZOOM,
    mapTypeControl: false

  };

  map = new google.maps.Map(document.getElementById('map'), options);
  createMarkers(function(){
    renderMarkers();
  });
}

function createMarkers(_callback) {
  const url = new URL('http://localhost:3000/api/map/collaborators');
  fetch(url)
    .then(function(data) {
        return data.json();
    }).then(function (schoolsMap) {
      /* The commented out code below is used when the response is
         in the format of an array, as opposed to just a JSON object
         where the name of the school is the property of the object */
      /*schoolsMap.forEach(function(value, key) {
        var lat = value.lat;
        var lng = value.lng;
        var pos = new google.maps.LatLng(lat, lng);
        var marker = new google.maps.Marker({
          position: pos,
          map: map
        });
      });*/

      for (var school in schoolsMap) {
        var pos = new google.maps.LatLng(schoolsMap[school]["lat"], schoolsMap[school]["lng"]);
        var name = school;
        addMarker(map, pos, name);
      }
<<<<<<< HEAD
        
  /*      var infowindow = new google.maps.InfoWindow();
        // When marker is clicked infowindow pops up
        google.maps.event.addListener(marker, 'click', function(){
          populateInfoWindow(map, marker, infowindow)
        });
        // Two event listeners - one for mouseover, one for mouseout,
        // to change the colors back and forth.
        // Two event listeners - one for mouseover, one for mouseout,
        // to change the colors back and forth.
        marker.addListener('mouseover', function() {
          this.setIcon(highlightedIcon);
        });
        marker.addListener('mouseout', function() {
          this.setIcon(defaultIcon);
<<<<<<< HEAD
        });
      }

      _callback();
    });
}

function renderMarkers() {
  console.log(markers);
  markers.forEach(function(school){
    var pos = new google.maps.LatLng(school['position']['lat'], school['position']['lng']);
    new google.maps.Marker({
      position: pos,
      map: map
=======
        }); */
=======
>>>>>>> Update script.js
    
>>>>>>> Update script.js
    });
<<<<<<< HEAD
  });
}
=======
}

function addMarker(map, position, name){
  var defaultIcon = makeMarkerIcon('0091ff');
  // Create a "highlighted location" marker color for when the user
  // mouses over the marker.
  var highlightedIcon = makeMarkerIcon('FFFF24');

  const marker = new google.maps.Marker({
      position: position,
      map: map,
      icon: defaultIcon,
      title: name,
  });
    
  var infowindow = new google.maps.InfoWindow();
  // When marker is clicked infowindow pops up
  google.maps.event.addListener(marker, 'click', function(){
      populateInfoWindow(map, marker, infowindow)
  });
  // Two event listeners - one for mouseover, one for mouseout,
  // to change the colors back and forth.
  marker.addListener('mouseover', function() {
    this.setIcon(highlightedIcon);
  });
  marker.addListener('mouseout', function() {
    this.setIcon(defaultIcon);
  });
}

// This function takes in a COLOR, and then creates a new marker
// icon of that color. The icon will be 21 px wide by 34 high, have an origin
// of 0, 0 and be anchored at 10, 34).
function makeMarkerIcon(markerColor) {
  var markerImage = new google.maps.MarkerImage(
    'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
    '|40|_|%E2%80%A2',
    new google.maps.Size(21, 34),
    new google.maps.Point(0, 0),
    new google.maps.Point(10, 34),
    new google.maps.Size(21,34));
  return markerImage;
}

function populateInfoWindow(map, marker, infowindow) {
  // Check to make sure the infowindow is not already opened on this marker.
  if (infowindow.marker != marker) {
    infowindow.setContent(marker.title);
    infowindow.marker = marker;
    // Make sure the marker property is cleared if the infowindow is closed.
    infowindow.addListener('closeclick', function () {
      infowindow.marker = null;
    });
    infowindow.open(map, marker);
  }
<<<<<<< HEAD
}
}
>>>>>>> Update script.js
=======
} 


>>>>>>> Update script.js
