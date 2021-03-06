const flamelinkApp = flamelink({
	apiKey: "AIzaSyDn5-6aVdeMXS7R7itaztAey5FEIuVwT6g",
	authDomain: "findrecycler2-heremyhack.firebaseapp.com",
	databaseURL: "https://findrecycler2-heremyhack.firebaseio.com",
	projectId: "findrecycler2-heremyhack",
	storageBucket: "findrecycler2-heremyhack.appspot.com",
	messagingSenderId: "638462441882"
});

//Here map init.
var platform = new H.service.Platform({
  'app_id': 'NeRPU29PEGJp2dUcxQ0I',
  'app_code': 'Rxe-ZiugFebz076B3aWQGw',
  'useHTTPS': true
});

// Obtain the default map types from the platform object
var maptypes = platform.createDefaultLayers();

// Instantiate (and display) a map object:
var map = new H.Map(
	document.getElementById('mapContainer'),
	maptypes.normal.map,
	{
		zoom: 12,
		center: {
			lat: 3.922072,
			lng: 102.209385
		}
	});

var facilityIcon = new H.map.Icon("images/FacilityIcon.png");

var behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));

var ui = H.ui.UI.createDefault(map, maptypes);

var metainfoService = platform.getMetaInfoService();

var router = platform.getRoutingService(); //To calculate routes.

facilityLocations = new H.map.Group();
map.addObject(facilityLocations);

function addMarkerToGroup(group, coordinate, html) {
	var groupMarker = new H.map.Marker(coordinate, {icon: facilityIcon});
	groupMarker.setData(html);
	group.addObject(groupMarker);
}

// function facilityImgUrl(imgObject) {
// 	var facilityImg = flamelinkApp.storage.getURL(imgObject);
// 	return facilityImg.then(function(result) {
// 		return result;
// 	});	
// }

flamelinkApp.content.subscribe('facilities', function(error, facilities) {
	if (error) {
		return console.error('Some error: ', error);
	}
	// for(var locationId in facilities) {
	// 	if (facilities.hasOwnProperty(locationId)) {
	// 		facilities[locationId].facilityImgUrl = '';
	// 		flamelinkApp.storage.getURL(facilities[locationId].facilityImage)
	// 		.then(function(url) {
	// 			facilities[locationId].facilityImgUrl = url;
	// 		});
	// 	}
	// }
	for(var locationId in facilities) {
		if (facilities.hasOwnProperty(locationId)) {
			position = {
				lat: facilities[locationId].latitude,
				lng: facilities[locationId].longitude
			};
			// marker = new H.map.Marker(position, {icon: facilityIcon});
			facilityLocations.addEventListener('tap', function(event) {
				var infobox = new H.ui.InfoBubble(event.target.getPosition(), {
					content: event.target.getData()
				});
				ui.addBubble(infobox);
			}, false);
			// var facilityImgUrl = facilityImg.then(function(result) {
			// 	return result;
			// });
			// console.log(facilities[locationId]);
			addMarkerToGroup(facilityLocations, position, 
                '<p class="uk-text-large uk-text-bold">'+facilities[locationId].facilityName+'</p>'+
                // '<img src="'+facilities[locationId].facilityImgUrl+'" uk-img>'+
                '<p>'+facilities[locationId].facilityDescription+'</p>'
				);
			// facilityLocations.addObject(marker);
		}
	}
});

function addRouteShapeToMap(route){
	var lineString = new H.geo.LineString(),
	routeShape = route.shape,
	polyline;

	routeShape.forEach(function(point) {
		var parts = point.split(',');
		lineString.pushLatLngAlt(parts[0], parts[1]);
	});

	polyline = new H.map.Polyline(lineString, {
		style: {
			lineWidth: 10,
			strokeColor: 'green'
		},
		arrows: { fillColor: 'white', frequency: 2, width: 0.8, length: 0.7 }
	});
	map.addObject(polyline);
	map.setViewBounds(polyline.getBounds(), true);
}

function addWaypointsToPanel(waypoints) {
	var nodeH3 = document.createElement('h3'),
	waypointLabels = [],
    i;
    for (i = 0;  i < waypoints.length; i += 1) {
    	waypointLabels.push(waypoints[i].label)
    }
    nodeH3.textContent = waypointLabels.join(' - ');
    // routeInstructionsContainer.innerHTML = '';
    UIkit.notification(nodeH3, {
    	pos: 'top-right'
    });
}

function addSummaryToPanel(summary){
	var summaryDiv = document.createElement('div'),
	content = '';
	content += '<b>Total distance</b>: ' + summary.distance  + 'm. <br/>';
	content += '<b>Travel Time</b>: ' + summary.travelTime.toMMSS() + ' (in current traffic)';
	summaryDiv.style.fontSize = 'small';
	summaryDiv.style.marginLeft ='5%';
	summaryDiv.style.marginRight ='5%';
	summaryDiv.innerHTML = content;
	UIkit.notification(summaryDiv, {
		pos: 'top-right'
	});
}

function addManueversToPanel(route){
	var nodeOL = document.createElement('ol'),
	i,
	j;

	nodeOL.style.fontSize = 'small';
	nodeOL.style.marginLeft ='5%';
	nodeOL.style.marginRight ='5%';
	nodeOL.className = 'directions';

	// Add a marker for each maneuver
	for (i = 0;  i < route.leg.length; i += 1) {
		for (j = 0;  j < route.leg[i].maneuver.length; j += 1) {
			// Get the next maneuver.
			maneuver = route.leg[i].maneuver[j];
			var li = document.createElement('li'),
			spanArrow = document.createElement('span'),
			spanInstruction = document.createElement('span');
			spanArrow.className = 'arrow '  + maneuver.action;
			spanInstruction.innerHTML = maneuver.instruction;
			li.appendChild(spanArrow);
			li.appendChild(spanInstruction);
			nodeOL.appendChild(li);
		}
	}
	UIkit.notification(nodeOL, {
		pos: 'top-right'
	});
}

function addManueversToMap(route){
	var svgMarkup = '<svg width="18" height="18" xmlns="http://www.w3.org/2000/svg">' +
	'<circle cx="8" cy="8" r="8" fill="green" stroke="white" stroke-width="1"  />' +
	'</svg>',
	dotIcon = new H.map.Icon(svgMarkup, {anchor: {x:8, y:8}}),
	group = new  H.map.Group(),
	i,
	j;

	// Add a marker for each maneuver
	for (i = 0;  i < route.leg.length; i += 1) {
		for (j = 0;  j < route.leg[i].maneuver.length; j += 1) {
			// Get the next maneuver.
			maneuver = route.leg[i].maneuver[j];
			// Add a marker to the maneuvers group
			var marker =  new H.map.Marker({
				lat: maneuver.position.latitude,
				lng: maneuver.position.longitude},
				{icon: dotIcon});
			marker.instruction = maneuver.instruction;
			group.addObject(marker);
		}
	}

	// group.addEventListener('tap', function (evt) {
	// 	map.setCenter(evt.target.getPosition());
	// 	openBubble(
	// 		evt.target.getPosition(), evt.target.instruction);
	// }, false);

	// Add the maneuvers group to the map
	map.addObject(group);
}

function facilityRouter(result) {
	// console.log(result);
	var routing = result.response.route[0];
	addRouteShapeToMap(routing);
	addManueversToMap(routing);
	// addWaypointsToPanel(routing.waypoint);
	// addManueversToPanel(routing);
	// addSummaryToPanel(routing.summary);
};

function updatePosition(event) {
	var youarehere = new H.map.Icon("images/youarehere.png");
	//Distance to 3 km radius.
	var minDist = 3000,
	nearest_text = '*None*',
    markerDist,
    // get all objects added to the map
    objects = facilityLocations.getObjects(),
    len = facilityLocations.getObjects().length,
    i;
	var userLocation = {
		lat: event.coords.latitude,
		lng: event.coords.longitude
	};
	map.setCenter(userLocation);
	var youareheremark = new H.map.Marker(userLocation, {icon: youarehere});
	map.addObject(youareheremark);
    // Show route to the nearest.
	for (i = 0; i < len; i += 1) {
		markerDist = objects[i].getPosition().distance(userLocation);
		// console.log(markerDist);
		if (markerDist < minDist) {
			minDist = markerDist;
			nearest_text = objects[i].getData();
			var routeParams = {
				mode: 'fastest;car',
				routeattributes : 'waypoints,summary,shape,legs',
				maneuverattributes: 'direction,action',
				waypoint0: userLocation.lat+','+userLocation.lng,
				waypoint1: objects[i].getPosition().lat+','+objects[i].getPosition().lng,
				representation: 'display'
			};
			router.calculateRoute(routeParams, facilityRouter, function(routeErr) {
				alert(routeErr.message);
			});
			UIkit.notification('The nearest recycling facility within 3km is: ' + nearest_text, {
				pos: 'top-right'
			});
		}
	}
}

navigator.geolocation.watchPosition(updatePosition);