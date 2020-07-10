var base_url = "http://82.211.132.146:1881/api/";
var storage = window.localStorage;
var app = {
	debug:function(text){
		console.log(text);
		//$('.debug').html(text);
	},
    initialize: function() {
        this.bindEvents();
    },    
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },    
    onDeviceReady: function() {
        app.receivedEvent('deviceready');		
		app.functions();
    },
	page:function(page){
		$('.app').html();
		if(page == 'login'){
			if($('.login').length > 0)
				$('.login').show();
			else 
				location.reload();
		}else{
			if(!storage.getItem('user_name')){
				app.user();
			}
				$.ajax({
					  method: "GET",
					  url: page+'.html'					
					}).done(function(data){
						$('.app').html(data);
						alert(storage.getItem('user_name'));
						$('.userName').html(storage.getItem('user_name'));
						app.datatable();
					});
			
		}
	},
	user:function(){
		$.ajax({
					  method: "POST",
					  url: base_url+'auth/user',
						headers:{'Authorization': storage.getItem('token_type')+' '+storage.getItem('access_token') },					  
					}).done(function(data){
						storage.setItem('user_id',data.id);
						storage.setItem('user_name',data.name);
						app.debug("----------USER");
						app.debug(data);
						app.debug("----------USER");
					});
	},
	datatable:function(){
		
		if($('#dataTable').length > 0){
		lang_url = "js/dataTables.geo.lang";
		var datatable = $('#dataTable').DataTable({
		lengthMenu: [25,50,100,500],
			processing: true,
			serverSide: true,	
			rowReorder: false,
			 
			dom: "<'row'<'col-sm-6'l><'col-sm-6'f>>" +
			 "<'row'<'col-sm-12'p>>" +
			 "<'row'<'col-sm-12'tr>>" +
			 "<'row'<'col-sm-5'i><'col-sm-7'p>>",
			
			 ajax: {
				 headers:{'Authorization': storage.getItem('token_type')+' '+storage.getItem('access_token') },					 
			  url: base_url+"auth/inspection/1",
			  type: "POST",
			 },
			 columns: columns,
			order: [[0, 'asc']],
			language: {
                url: lang_url
            },
		  });
		}
	},
    receivedEvent: function(id) {
		var networkState = navigator.connection.type;
		app.debug("-------------- NETWORK");
		app.debug(networkState);
		app.debug("-------------- NETWORK");
		
		
		app.debug("-------------- TOKEN");
		app.debug(storage);
		app.debug("-------------- TOKEN");
				
		if(storage.getItem('access_token')){
			return app.page('home');
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
					  },error:function(row,e,k,data){
						  console.log(row);
						  console.log(e);
						  console.log(k);
						  console.log(data);
						  if(row.status == 401){
							  swal(row.responseJSON.message);
						  }else{
							  swal('ვერ მოხერხდა სერვერთან დაკავშირება გთხოვთ ცადეთ მოგვიანებით');  
						  }
						
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
		
		
    },
	functions:function(){
		$(document).on('click', '.logout', function(e){			
			storage.removeItem('access_token');
			app.page('login');
		});
		
		$(document).on('click','.pic_open',function(e){
			e.preventDefault();
			var id = $(this).data('id');
			console.log(storage.getItem('token_type')+' '+storage.getItem('access_token'));
			
					$.ajax({
					  headers:{'Authorization': storage.getItem('token_type')+' '+storage.getItem('access_token') },		
					  method: "POST",
					  url: base_url+'auth/load_pics',
					  data:{
						  'id':id,
					  }
					}).done(function(data){
						$('#pictures .modal-body').html(data);
						$('#pictures .carousel').carousel();
						$('#pictures').modal('show');						
					});
		});
		
		$(document).on('click','.append_delete',function(e){
			e.preventDefault();
			var id = $(this).data('id');
			$('[name="id"]').remove();
			$('#delete button.btn-primary').data('table',$(this).data('table')).prop('disabled',false).html('დიახ');
			$('body').append("<input name='id' value='"+id+"' type='hidden'/>");
						
			var table = $(this).data('table');			
			$('#delete button.btn-primary').data('id', id);
			$('#delete').modal('show');
		});
	}
};