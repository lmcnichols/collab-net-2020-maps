"use strict";

var map;
const CURVATURE = 0.5;
const CALPOLYLATLNG = {lat: 35.3, lng: -120.65};
const ZOOM = 6;
var infowindow;

var data;
var institutions;
var collaborators;
var publications;
var markers = new Map();
var edges = new Map();


async function initMap() {
  var options = {
    center: CALPOLYLATLNG,
    zoom: ZOOM,
    mapTypeControl: false
  };
  map = new google.maps.Map(document.getElementById('map'), options);
  infowindow = new google.maps.InfoWindow();

  // fetch data from the API
  data = await initData();
  institutions = data["institutions"];
  collaborators = data["collaborators"];
  publications = data["publications"];

  // first create markers and render them
  initMarkers();
  renderMarkers();
}

async function initData() {
  const url = new URL('http://localhost:3000/api/map/scrapeData');
  
  var response = await fetch(url);

  if (response.ok) {
    return response.json();
  }
}

function initMarkers() {
  Object.values(institutions).forEach(function (inst) {
    var newMarker = addMarker(inst);
    markers.set(inst["id"], newMarker);
  })
}

function renderMarkers() {
    markers.forEach(function(marker, instname) {
      marker.setMap(map);
    });
}

function addMarker(inst){
  const position = new google.maps.LatLng(inst["location"][0], inst["location"][1]);
  const defaultIcon = makeMarkerIcon('0091ff');
  // Create a "highlighted location" marker color for when the user
  // mouses over the marker.
  const highlightedIcon = makeMarkerIcon('FFFF24');

  const marker = new google.maps.Marker({
      position: position,
      icon: defaultIcon,
      title: inst["name"],
      instid: inst["id"],
      lines: []
  });
    
  // When marker is clicked infowindow pops up
  marker.addListener('click', function(){
      populateInfoWindow(map, marker, infowindow),
      showHideEdges(inst["id"]);
  });

  // Two event listeners - one for mouseover, one for mouseout,
  // to change the colors back and forth.
  marker.addListener('mouseover', function() {
    this.setIcon(highlightedIcon);
  });
  marker.addListener('mouseout', function() {
    this.setIcon(defaultIcon);
  });
  return marker;
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
    infowindow.open(map,marker);
  } 
}


async function getEdges(instid) {
  // build URL with search params
  const url = new URL("http://localhost:3000/api/map/getEdges"),
    params = {instid : instid}
  Object.keys(params).forEach(key => url.searchParams.append(key, params[key]))

  // call fetch
  var obj = await fetch(url).
    then(function(res) {
      return res.json();
    })

  buildEdges(instid, obj);
}

function buildEdges(sourceid, obj) {

  //var edgeMap = new Map();
  var curMarker = markers.get(sourceid);

  Object.keys(obj).forEach(function(instidstr) {
    var instid = parseInt(instidstr);
    var marker2 = markers.get(instid)

    drawCurve(curMarker, marker2);

    // edgeMap maps the instid to a marker that contains a list of edges 
   // edgeMap.set(instid, curMarker);

    edges.set(sourceid, curMarker)
  });
  
}
  
function drawCurve(curMarker, marker2){
  var path = [curMarker.getPosition(), marker2.getPosition()];
  var line = new google.maps.Polyline({
        path: path,
        geodesic: true,
        strokeColor: '#000000',
        strokeOpacity: 1.0,
        strokeWeight: 1
  });
  curMarker.lines.push(line); 
  google.maps.event.addListener(line, 'mouseover', function() {
    console.log("mouseover");
    // highlightLine(line, path);
});
}
  /*var edgeMap = new Map();
  var curMarker = markers.get(sourceid);
  var pos1 = curMarker.getPosition();

  Object.keys(obj).forEach(function(instidstr) {
    var instid = parseInt(instidstr);
    var curveMarker = new google.maps.Marker({
      position: pos1,
      clickable: false,
      zIndex: 0 // behind the other markers
    });
    var pos2 = markers.get(instid).getPosition();
    calculateCurve(pos1, pos2, curveMarker);

    // update the edgeMap
    edgeMap.set(instid, curveMarker);

    // add listeners to the curvemarker to re-draw the projection
    // if the dimensions of the map changes
    map.addListener('projection_changed', function() {
      calculateCurve(pos1, pos2, curveMarker);
    });
    map.addListener('zoom_changed', function() {
      calculateCurve(pos1, pos2, curveMarker);
    });
  });

  // add current inst's edgeMap to the edges map
  edges.set(sourceid, edgeMap)*/




// pass in marker.getPosition()
/*function calculateCurve(pos1, pos2, curveMarker) {
  var projection = map.getProjection(),
  p1 = projection.fromLatLngToPoint(pos1), // xy
  p2 = projection.fromLatLngToPoint(pos2);

  // Calculate the arc.
  // To simplify the math, these points 
  // are all relative to p1:
  var e = new google.maps.Point(p2.x - p1.x, p2.y - p1.y), // endpoint (p2 relative to p1)
      m = new google.maps.Point(e.x / 2, e.y / 2), // midpoint
      o = new google.maps.Point(e.y, -e.x), // orthogonal
      c = new google.maps.Point( // curve control point
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

  curveMarker.setOptions({
      position: pos1,
      icon: symbol,
  });
}*/

async function showHideEdges(instid) {
  // if the marker doesn't have its edges yet, get them
  if (!edges.has(instid)) {
    await getEdges(instid);
  }
  var curMarker = markers.get(instid);
  curMarker.lines.forEach(function(line) {
    if (line.getMap() == null) {
      console.log("map is null, setting now");
      line.setMap(map);
    } else {
      line.setMap(null);
    }
  })
}

