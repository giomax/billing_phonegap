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
	page:function(page){
		$('.app').html();
		if(page == 'login'){
			if($('.login').length > 0)
				$('.login').show();
			else 
				location.reload();
		}else{
			$.ajax({
					  method: "GET",
					  url: page+'.html'					
					}).done(function(data){
						$('.app').html(data);
					});
		}
	},
    receivedEvent: function(id) {
		var base_url = "http://82.211.132.146:1881/api/";
		var storage = window.localStorage;
		var networkState = navigator.connection.type;
		console.log(networkState);
		
		if(storage.getItem('access_token')){
			page('home');
		}
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
		//first STEP LOGIN PAGE
		app.page('login');
		$(document).on('submit', '#login', function(e){
			var $btn = $("#login [type='submit']");
			$btn.html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> იტვირთება...').prop('disabled',true);
			e.preventDefault();
				$.ajax({
					  method: "POST",
					  url: base_url+'auth/login',
					  data:{
						  'email':$("[name='email']").val(),
						  'password':$("[name='password']").val()
					  },error:function(row,e,data){
						  console.log(row);
						  console.log(e);
						  console.log(data);
						swal('ვერ მოხერხდა სერვერთან დაკავშირება გთხოვთ ცადეთ მოგვიანებით');  
						$btn.prop('disabled',false).html("ავტორიზაცია");
					  },
					}).done(function(data){
						if(data.code == 0){
							swal(data.text);							
							$btn.prop('disabled',false).html("ავტორიზაცია");
						}
						if(data.code == 1){
							storage.setItem('token_type',data.token_type);
							storage.setItem('access_token',data.access_token);
							app.page('home');
						}
					});
		});
		$(document).on('click', '.logout', function(e){			
			storage.removeItem('access_token');
			app.page('login');
		});
		
		
    }
};