var app = {
	debug:function(text){
		console.log(text);
		$('.debug').html(text);
	},
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
		var base_url = "http://billing.com.ge/login";
		var onSuccess = function(position) {
			app.debug('Latitude: '          + position.coords.latitude          + '\n' +
				  'Longitude: '         + position.coords.longitude         + '\n' +
				  'Altitude: '          + position.coords.altitude          + '\n' +
				  'Accuracy: '          + position.coords.accuracy          + '\n' +
				  'Altitude Accuracy: ' + position.coords.altitudeAccuracy  + '\n' +
				  'Heading: '           + position.coords.heading           + '\n' +
				  'Speed: '             + position.coords.speed             + '\n' +
				  'Timestamp: '         + position.timestamp                + '\n');	
		};
		function onError(error) {
			app.debug('code: '    + error.code    + '\n' +
				  'message: ' + error.message + '\n');
		}
		navigator.geolocation.getCurrentPosition(onSuccess, onError);
		app.debug('shemovida');
		  
		$(document).on('submit', '#login', function(e){
			var $btn = $("#login [type='submit']");
			$btn.html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> იტვირთება...').prop('disabled',true);
			e.preventDefault();
				$.ajax({
					  method: "POST",
					  url: base_url+'login',
					  data:{
						  'email':$("[name='email']").val(),
						  'password':$("[name='password']").val(),
						  'captcha':$("[name='captcha']").val(),
					  }
					}).done(function(data){
						
						if(data.code == 0){
							swal(data.text);
							$('.capchaform').html(data.capcha+'<i class="fas fa-sync" style="margin-left:10px;cursor:pointer;"></i>');
							$('[name="captcha"]').val('');
							$btn.prop('disabled',false).html("ავტორიზაცია");
						}
						if(data.code == 1){
							window.location.href = base_url;
						}
						if(data.code == 2){
							window.location.href = base_url+"password_reset";
						}
					});
		});
		
		
    }
};