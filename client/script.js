"use strict";


var map;
const CALPOLYLATLNG = {lat: 37, lng: -115.65};
const ZOOM = 6;
var infowindow;

// Keeps track of the current marker 
var curMarker = null;
// Keeps track of the previous marker 
var lastMarker = null;

var data;
var institutions;
var collaborators;
var publications;
var markers = new Map();

var sidehtml = '';

var defaultIcon;
var highlightedIcon;
var clickedIcon;





/* ------------MAP------------*/

async function initMap() {
  var options = {
    center: CALPOLYLATLNG,
    zoom: ZOOM,
    minZoom: 1,
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
  const url = new URL('http://localhost:3000/api/data/scrapeData');
  
  var response = await fetch(url);

  if (response.ok) {
    return response.json();
  }
}

/* ------------MARKERS------------*/

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
  defaultIcon = makeMarkerIcon('0091ff');
  highlightedIcon = makeMarkerIcon('FFFF24');
  clickedIcon = makeMarkerIcon('FFAA00');

  const marker = new google.maps.Marker({
      position: position,
      icon: defaultIcon,
      title: inst["name"],
      instid: inst["id"],
      lines: [],
      collabhtml: '',
      highlight: ""
  });
  

  // When marker is clicked infowindow pops up
  marker.addListener('click', function(){
      curMarker = marker;
      parseClickEvent(marker)
  });

  // Two event listeners - one for mouseover, one for mouseout,
  // to change the colors back and forth.
  marker.addListener('mouseover', function() {
    if (marker.highlight==""){
      this.setIcon(highlightedIcon);
    }
  });
  marker.addListener('mouseout', function() {
    if (marker.highlight==""){
      this.setIcon(defaultIcon);
    }
  });
  return marker;
}


function parseClickEvent(marker){

  // FIRST CLICK
  if (lastMarker == null) {
    marker.setIcon(clickedIcon);
    marker.highlight = "set";
    showInfoWindow(marker);
    showCollaboratorPanel(marker);
    showEdges(marker);

    lastMarker = curMarker; 

  // DOUBLE CLICK
  } else if (marker == lastMarker) {
    marker.setIcon(defaultIcon);
    marker.highlight = "";
    hideInfoWindow(marker);
    hideCollaboratorPanel();
    hideEdges(marker);

    lastMarker = null; 

  // NEW MARKER 
  } else {
    lastMarker.setIcon(defaultIcon);
    lastMarker.highlight = "";
    marker.setIcon(clickedIcon);
    marker.highlight = "set";
    showInfoWindow(marker);
    showCollaboratorPanel(marker);
    hideEdges(lastMarker);
    showEdges(marker);

    lastMarker = curMarker;
  }
  
}



/* ------------EDGES------------*/

async function getEdges(instid) {
  // build URL with search params
  const url = new URL("http://localhost:3000/api/edges/getEdges"),
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

  var curMarker = markers.get(sourceid);

  Object.keys(obj).forEach(function(instidstr) {
    var instid = parseInt(instidstr);
    var marker2 = markers.get(instid)

    drawCurve(curMarker, marker2);
  });
  
}
  
function drawCurve(currentMarker, marker2){
  var path = [currentMarker.getPosition(), marker2.getPosition()];
  //console.log(path);
  var line = new google.maps.Polyline({
        path: path,
        geodesic: true,
        strokeColor: '#000000',
        strokeOpacity: 1.0,
        strokeWeight: 1,
        marker2: marker2
  });
  currentMarker.lines.push(line); 
}


async function showEdges(marker){
    if (marker.lines != []){
      await getEdges(marker.instid);
    }
    marker.lines.forEach(function(line) {
      line.setMap(map);
      line.marker2.setIcon(clickedIcon);
      line.marker2.highlight = "set";
    });
}

function hideEdges(marker){
  marker.lines.forEach(function(line) {
    line.setMap(null);
    line.marker2.setIcon(defaultIcon);
    line.marker2.highlight = "";
  })
}




/* ------------SIDEBAR------------*/

async function getCollaborators(instid) {
  // build URL with search params
  const url = new URL("http://localhost:3000/api/map/getCollaborators"),
    params = {instid : instid}
  Object.keys(params).forEach(key => url.searchParams.append(key, params[key]))

  // call fetch
  var obj = await fetch(url).
    then(function(res) {
      return res.json();
    })

  buildCollabHTML(instid, obj);
}

function buildCollabHTML(instid, obj) {
  var curMarker = markers.get(instid);
  // Traverse each author in the json object and author name
  // and publications to the html code
  // associated with the school 
  var collab_html= '<h2>'+curMarker.title+'</h2> <div id= "sidebar">';
 /* for (var author in obj) {
    collab_html += '<div class="collaborator"> \
    <input type="checkbox" />' + author 
    var publications = obj[author];
    for (var pub in publications){
      collab_html += '<p>' + publications[pub] + '<br />'
    }
    collab_html += '</p></div>'
  }*/

  for (var author in obj) {
    collab_html += ' \
    <button type="button" class="collapsible">' 
    + author +
    ' </button> \
    <div class="content">'
  var publications = obj[author];
  for (var pub in publications){
    collab_html += '<p>' + publications[pub] + '<br />'
  }
  collab_html += '</p> </div> <div>' 
      
  }
  // Set the marker's html property to the html just built 
  curMarker.collabhtml = collab_html;
}


function hideCollaboratorPanel(){
  loadSideBar('');
}

async function showCollaboratorPanel(marker){
  if (marker.collabhtml == ''){
    await getCollaborators(marker.instid);
  }
  loadSideBar(marker.collabhtml);
}


function loadSideBar(html){
    document.getElementById("sidepanel").innerHTML = html;
    sidehtml = html;
    var coll = document.getElementsByClassName("collapsible");
    var i;

    for (i = 0; i < coll.length; i++) {
      coll[i].addEventListener("click", function() {
        this.classList.toggle("active");
        var content = this.nextElementSibling;
        if (content.style.display === "block") {
          content.style.display = "none";
        } else {
          content.style.display = "block";
        }
      });
    }   
}




/* ------------INFOWINDOW------------*/

function showInfoWindow(marker){
  infowindow.setContent(marker.title);
  infowindow.marker = marker;
  infowindow.open(map,marker);
}

function hideInfoWindow(marker){
  infowindow.close();
  infowindow.marker = null;
}


/* ------------HIGHLIGHTING------------*/

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




