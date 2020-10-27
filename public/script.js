"use strict";

// Keeps track of the marker that was most recently clicked 
var lastClickedMarker = null;

var map;
const CURVATURE = 0.5;
const CALPOLYLATLNG = {lat: 37, lng: -115.65};
const ZOOM = 6;
var infowindow;

var data;
var institutions;
var collaborators;
var publications;
var markers = new Map();
var edges = new Map();

var sidehtml = '';



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
  const url = new URL('http://localhost:3000/api/map/scrapeData');
  
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
  const defaultIcon = makeMarkerIcon('0091ff');
  // Create a "highlighted location" marker color for when the user
  // mouses over the marker.
  const highlightedIcon = makeMarkerIcon('FFFF24');
  

  const marker = new google.maps.Marker({
      position: position,
      icon: defaultIcon,
      title: inst["name"],
      instid: inst["id"],
      lines: [],
      collabhtml: ''
  });
  

  // When marker is clicked infowindow pops up
  marker.addListener('click', function(){
    if (lastClickedMarker != null) {
     console.log("last"+lastClickedMarker.title);
    console.log(lastClickedMarker.lines)}
      console.log("current"+marker.title)
      var clickStatus = determineClickStatus(marker);
      showHideInfoWindow(map, marker, infowindow, clickStatus);
      showHideEdges(marker.instid, clickStatus, lastClickedMarker);
      showHideCollaboratorPanel(marker.instid, clickStatus);
   //   console.log("last"+marker.title);
      lastClickedMarker = marker;
      lastClickedMarker.lines = marker.lines;

  
     // getCollaborators(marker.instid);
     // buildCollabHTML(marker);
      // Store this marker as the most recently clicked marker 
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


function determineClickStatus(marker){
  // If last clicked is null, this is the first click
  if (lastClickedMarker == null) {
    return 'firstclick'
  } else if (marker == lastClickedMarker) {
    return 'doubleclick'
  } else {
    return 'newclick'
  }
  
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

function myclick(instid) {
  google.maps.event.trigger(markers.get(instid), "click");
}



/* ------------EDGES------------*/

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

  var curMarker = markers.get(sourceid);

  Object.keys(obj).forEach(function(instidstr) {
    var instid = parseInt(instidstr);
    var marker2 = markers.get(instid)

    drawCurve(curMarker, marker2);
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
  // This code would highlight the line when moused over 
 /* google.maps.event.addListener(line, 'mouseover', function() {
    console.log("mouseover");
     highlightLine(line, path);
}); */
}


async function showHideEdges(instid, clickStatus, lastClickedMarker) {
  // if the marker doesn't have its edges yet, get them
  if (!edges.has(instid)) {
    await getEdges(instid);
  }

  var curMarker = markers.get(instid);
  if (clickStatus === 'newclick') {
   // console.log(lastClickedMarker.lines);
    //console.log(lastClickedMarker.title);
    lastClickedMarker.lines.forEach(function(line) {
     // console.log("setting null")
      line.setMap(null);
    })
    curMarker.lines.forEach(function(line) {
      line.setMap(map);
    });
  // Hide edges on double click 
  } else if (clickStatus === 'doubleclick') { 
    curMarker.lines.forEach(function(line) {
      line.setMap(null);
    })
    lastClickedMarker = null;
  // Show the new edges 
  } else {
    curMarker.lines.forEach(function(line) {
      line.setMap(map);
    });
  }
  // If the marker was clicked twice, hide lines 
 /* curMarker.lines.forEach(function(line) {
    if (line.getMap() == null) {
      line.setMap(map);
    } else {
      line.setMap(null);
    }
  })*/

  //lastClickedMarker = curMarker;
  // Set this marker to be the most recently clicked marker 
  
}

// Not being used 
function highlightLine(line, path){
  line.setMap(null);
  var highlightedLine = new google.maps.Polyline({
          path: path,
          geodesic: true,
          strokeColor: '#FFFF24',
          strokeOpacity: 1.0,
          strokeWeight: 3
      });
      highlightedLine.setMap(map);

      google.maps.event.addListener(highlightedLine, 'mouseout', function(){
        console.log('mouseout');
        highlightedLine.setMap(null);
        line.setMap(map);
    });
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

async function showHideCollaboratorPanel(instid, clickStatus){
  var curMarker = markers.get(instid);
  // If the marker doesn't have collaborator html yet, get it 
  if (curMarker.collabhtml == ''){
    await getCollaborators(instid);
  }

  // If the marker is clicked twice, load a blank side panel
  if (clickStatus == 'doubleclick') {
    loadSideBar('');
  // Generate a new information on this marker's side panel
  } else {
    loadSideBar(curMarker.collabhtml);
  }
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

function showHideInfoWindow(map, marker, infowindow, clickStatus) {
  // Open info window on desired marker 
  if (clickStatus === 'firstclick' || clickStatus === 'newclick') {
    infowindow.setContent(marker.title);
    infowindow.marker = marker;
    infowindow.open(map,marker);
  } else {
  // Double clicked, so close info window 
    infowindow.close();
    infowindow.marker = null;
  } 
}




