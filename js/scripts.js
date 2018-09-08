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

function updatePosition(event) {
  var userLocation = {
    lat: event.coords.latitude,
    lng: event.coords.longitude
  };
  map.setCenter(userLocation);
}

navigator.geolocation.watchPosition(updatePosition);

var facilityIcon = new H.map.Icon("images/FacilityIcon.png");

var behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));

var ui = H.ui.UI.createDefault(map, maptypes);

// var geocoder = platform.getGeocodingService();
var metainfoService = platform.getMetaInfoService();

facilityLocations = new H.map.Group();
map.addObject(facilityLocations);

// var onLocate = function(result) {
// 	var locating = result.Response.View[0].Result,
// 	position,
// 	marker;

// 	for (i = 0; i < locating.length; i++) {
// 		position = {
// 			lat: locating[i].Location.DisplayPosition.Latitude,
// 			lng: locating[i].Location.DisplayPosition.Longitude
// 		};
// 		marker = new H.map.Marker(position, {icon: facilityIcon});
// 		facilityLocations.addObject(marker);
// 	}
// }

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
			marker = new H.map.Marker(position, {icon: facilityIcon});
			facilityLocations.addObject(marker);
			// geocoder.geocode({
			// 	searchText: facilities[locationId].facilityAddress
			// }, onLocate, function(err) {
			// 	alert(err);
			// });
		}
	}
});
