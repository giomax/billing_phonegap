
	

var app = {
    initialize: function() {
        this.bindEvents();
    },    
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },    
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
    },
    receivedEvent: function(id) {
		console.log("------");
		console.log(id);
		console.log("------");
        
		
		
		var onSuccess = function(position) {
			console.log('Latitude: '          + position.coords.latitude          + '\n' +
				  'Longitude: '         + position.coords.longitude         + '\n' +
				  'Altitude: '          + position.coords.altitude          + '\n' +
				  'Accuracy: '          + position.coords.accuracy          + '\n' +
				  'Altitude Accuracy: ' + position.coords.altitudeAccuracy  + '\n' +
				  'Heading: '           + position.coords.heading           + '\n' +
				  'Speed: '             + position.coords.speed             + '\n' +
				  'Timestamp: '         + position.timestamp                + '\n');	


			  $('body').append('Latitude: '          + position.coords.latitude          + '\n' +
				  'Longitude: '         + position.coords.longitude         + '\n' +
				  'Altitude: '          + position.coords.altitude          + '\n' +
				  'Accuracy: '          + position.coords.accuracy          + '\n' +
				  'Altitude Accuracy: ' + position.coords.altitudeAccuracy  + '\n' +
				  'Heading: '           + position.coords.heading           + '\n' +
				  'Speed: '             + position.coords.speed             + '\n' +
				  'Timestamp: '         + position.timestamp                + '\n');
				  
		};

		// onError Callback receives a PositionError object
		//
		function onError(error) {
			$('body').append('code: '    + error.code    + '\n' +
				  'message: ' + error.message + '\n');
		}

		navigator.geolocation.getCurrentPosition(onSuccess, onError);


			
		
    }
};