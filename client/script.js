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
      var clickStatus = determineClickStatus(marker);
      showHideInfoWindow(map, marker, infowindow, clickStatus);
      showHideEdges(marker.instid, clickStatus);
      showHideCollaboratorPanel(marker.instid, clickStatus);
      lastClickedMarker = marker;
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
   // lastClickedMarker = marker;
   // console.log('firstlick');
    return 'firstclick'
  // If last clicked equals current marker, it has been 
  // double clicked
  } else if (marker == lastClickedMarker) {
   // lastClickedMarker = marker;
   // console.log('doubleclick');
    return 'doubleclick'
  // If marker and last clicked are different, 
  // a new marker has been clicked 
  } else {
   // lastClickedMarker = marker;
   // console.log('newclick');
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


async function showHideEdges(instid, clickStatus) {
  // if the marker doesn't have its edges yet, get them
  if (!edges.has(instid)) {
    await getEdges(instid);
  }
  var curMarker = markers.get(instid);

  // On new click hide the edges from the previous marker 
  // and show new edges 
  if (clickStatus === 'newclick') {
    console.log('newclick');
    console.log(lastClickedMarker.lines);
    lastClickedMarker.lines.forEach(function(line) {
      console.log("setting null")
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
  // Show the new edges 
  } else {
    console.log('firstclick');
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
  var collab_html = '';
 /* for (var author in obj) {
    collab_html += '<div class="collaborator"> \
    <input type="checkbox" />' + author 
    var publications = obj[author];
    for (var pub in publications){
      collab_html += '<p>' + publications[pub] + '<br />'
    }
    collab_html += '</p></div>'
  }*/
  var id = 0;
  for (var author in obj) {
    id++;
    collab_html += '<div class="card"> \
    <div class="card-header" id="heading"'+id+'> \
      <h5 class="mb-0"> \
      <button class="btn btn-link" data-toggle="collapse" data-target="#collapse"'+id+ '\
      aria-expanded="true" aria-controls="collapse"'+id+'>' + author +
      ' </button> \
      </h5> \
    </div> \
    <div class="collapse show" aria-labelledby="heading"'+id+ 'data-parent="#accordion"> \
      <div class="card-body"></div>';
  var publications = obj[author];
  for (var pub in publications){
    collab_html += '<p>' + publications[pub] + '<br />'
  }
  collab_html += '</p> </div> \
  </div> \
</div>' 
      
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


// Loads the plain sideabar with heading 
function loadSideBar(html){
  /*document.getElementById("sidebar").innerHTML = 
      '<h1>Academic Collaboration Network</h1>' + html;*/
    document.getElementById("accordian").innerHTML = html;
    sidehtml = html;

    //console.log(document.getElementById("checklist").innerHTML);
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



