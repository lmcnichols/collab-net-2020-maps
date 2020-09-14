var map;
const CURVATURE = 0.5;
const CALPOLYLATLNG = {lat: 35.3, lng: -120.65};
const ZOOM = 6;

function initMap() {
  var options = {
    center: CALPOLYLATLNG,
    zoom: ZOOM
  };

  map = new google.maps.Map(document.getElementById('map'), options);
  createMarkers();
}

function createMarkers() {
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
        var marker = new google.maps.Marker({
          position: pos,
          map: map
        })
      }
    });
}