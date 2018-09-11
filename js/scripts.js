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
  'app_id': 'NeRPU29PEGJp2dUcxQ0I ',
  'app_code': 'Rxe-ZiugFebz076B3aWQGw ',
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

facilityLocations = new H.map.Group();
map.addObject(facilityLocations);

function addMarkerToGroup(group, coordinate, html) {
	var groupMarker = new H.map.Marker(coordinate, {icon: facilityIcon});
	groupMarker.setData(html);
	group.addObject(groupMarker);
}

flamelinkApp.content.subscribe('facilities', function(error, facilities) {
	if (error) {
		return console.error('Some error: ', error);
	}
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
			addMarkerToGroup(facilityLocations, position, 
                '<p class="uk-text-large uk-text-bold">'+facilities[locationId].facilityName+'</h3>'+
                '<p>'+facilities[locationId].facilityDescription+'</p>'
				);
			// facilityLocations.addObject(marker);
		}
	}
});

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
    // iterate over objects and calculate distance between them
	for (i = 0; i < len; i += 1) {
		markerDist = objects[i].getPosition().distance(userLocation);
		// console.log(markerDist);
		if (markerDist < minDist) {
			minDist = markerDist;
			nearest_text = objects[i].getData();
		}
	}
	UIkit.notification('The nearest recycling facility within 3km is: ' + nearest_text, {
		pos: 'top-right'
	});
}

navigator.geolocation.watchPosition(updatePosition);