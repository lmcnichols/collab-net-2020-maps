var map;
const CURVATURE = 0.5;
const CALPOLYLATLNG = {lat: 35.3, lng: -120.65};
const ZOOM = 6;

function initMap() {
  const Map = google.maps.Map,
      LatLng = google.maps.LatLng,
      LatLngBounds = google.maps.LatLngBounds,
      Marker = google.maps.Marker,
      Point = google.maps.Point;

  var options = {
    center: CALPOLYLATLNG,
    zoom: ZOOM
  };

  map = new Map(document.getElementById('map'), options);

  const url = new URL('http://localhost:3000/api/collaborators');
  fetch(url)
    .then(function(data) {
        return data.json();
    }).then(function (obj) {
      obj.features.forEach(function(c) {
        var lat = c.geometry.coordinates[0];
        var lng = c.geometry.coordinates[1];
        var pos = new LatLng(lat, lng);
        var marker = new Marker({
          position: pos,
          map: map
        });
      });
    });

  

  /*var pos1 = new LatLng(37.8719, -122.2585);
  var pos2 = new LatLng(35.3, -120.65);

  var markerP1 = new Marker({
    position: pos1,
    label: "1",
    map: map
  });

  var markerP2 = new Marker({
    position: pos2,
    label: "2",
    map: map
  });

  var curveMarker;*/

  function updateCurveMarker() {
    var pos1 = markerP1.getPosition(), // latlng
        pos2 = markerP2.getPosition(),
        projection = map.getProjection(),
        p1 = projection.fromLatLngToPoint(pos1), // xy
        p2 = projection.fromLatLngToPoint(pos2);

    // Calculate the arc.
    // To simplify the math, these points 
    // are all relative to p1:
    var e = new Point(p2.x - p1.x, p2.y - p1.y), // endpoint (p2 relative to p1)
        m = new Point(e.x / 2, e.y / 2), // midpoint
        o = new Point(e.y, -e.x), // orthogonal
        c = new Point( // curve control point
            m.x + CURVATURE * o.x,
            m.y + CURVATURE * o.y);

    var pathDef = 'M 0,0 ' +
        'q ' + c.x + ',' + c.y + ' ' + e.x + ',' + e.y;

    var zoom = map.getZoom(),
        scale = 1 / (Math.pow(2, -zoom));

    var symbol = {
        path: pathDef,
        scale: scale,
        strokeWeight: 2,
        fillColor: 'none'
    };

    if (!curveMarker) {
        curveMarker = new Marker({
            position: pos1,
            clickable: false,
            icon: symbol,
            zIndex: 0, // behind the other markers
            map: map
        });
    } else {
        curveMarker.setOptions({
            position: pos1,
            icon: symbol,
        });
    }
  }

  /*google.maps.event.addListener(map, 'projection_changed', updateCurveMarker);
  google.maps.event.addListener(map, 'zoom_changed', updateCurveMarker);
  google.maps.event.addListener(markerP1, 'position_changed', updateCurveMarker);
  google.maps.event.addListener(markerP2, 'position_changed', updateCurveMarker);*/
}