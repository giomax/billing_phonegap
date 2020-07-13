//var base_url = "http://82.211.132.146:1881/api/";
var base_url = "http://192.168.1.103:1881//api/";
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
					  url: 'header.html'					
					}).done(function(data){
						$('.app').html(data);
						$('.userName').html(storage.getItem('user_name'));
						$('.'+page).addClass('active');
			});
			
			$.ajax({
					  method: "GET",
					  url: page+'.html'					
					}).done(function(data){
						$('header').after(data);
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
						app.debug(storage.getItem('user_name'));
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
			  url: base_url+"auth/inspection/"+$('[name="service"]').val(),
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
		bluetoothle.hasPermission(hasPermissionSuccess);
		bluetoothle.isLocationEnabled(isLocationEnabledSuccess, isLocationEnabledError);
		  function hasPermissionSuccess(data){
			  console.log(data);
			  if(!data.hasPermission){
				  bluetoothle.requestPermission(requestPermissionSuccess, requestPermissionError);
			  }
		  }
		  
		  function requestPermissionSuccess(data){
			  console.log("PERMISSION GRANTED");
			  console.log(data);
		  }
		  function requestPermissionError(data){
			  console.log("__ERROR PERMISSION");
			  console.log(data);
		  }
		  
		    
		function isLocationEnabledSuccess(data){
			console.log('LOCATION ENABLED');
			console.log(data);
		}
		function isLocationEnabledError(data){
			console.log('LOCATION DISABLED');
			console.log(data);
		}
		
		
		new Promise(function (resolve) {
			bluetoothle.initialize(resolve, { request: true, statusReceiver: false });
		}).then(initializeSuccess);	  
			  function initializeSuccess(result) {
			console.log("INITIALIZE SUCCESS");
			if (result.status === "enabled") {
				console.log("Bluetooth is enabled.");
			}
			else {
				bluetoothle.enable();	
				console.log("Bluetooth is disabled");
			}
			bluetoothle.connect(conSuccess,connectFail,{'address':'00:1B:C1:08:19:58'});
		}
		
		
		function conSuccess(data){
			console.log("CONNECT SUCCESS");
			console.log(data);
			bluetoothle.retrieveConnected(retrieveConnectedSuccess);
		}

		function connectFail(data){
			console.log("CONNECT FAILED");
			console.log(data);
			bluetoothle.reconnect(conSuccess,connectFail,{'address':'00:1B:C1:08:19:58'});
		}

		function retrieveConnectedSuccess(data){
			console.log('connect list');
			console.log(data);
			console.log('connect list');
			
			/*
			if (data.length == 0){
				
				bluetoothle.isScanning(function(data){
					console.log(data);
					if(data){
						stopScan();
					}
						startScan();
				});
			}
			*/
			
		}
		
		
		
function handleError(error) {
 
    var msg;
 
    if (error.error && error.message) {
 
        var errorItems = [];
 
        if (error.service) {
 
            errorItems.push("service: " + (uuids[error.service] || error.service));
        }
 
        if (error.characteristic) {
 
            errorItems.push("characteristic: " + (uuids[error.characteristic] || error.characteristic));
        }
 
        msg = "Error on " + error.error + ": " + error.message + (errorItems.length && (" (" + errorItems.join(", ") + ")"));
    }
 
    else {
 
        msg = error;
    }
 
    console.log(msg, "error");
 
    if (error.error === "read" && error.service && error.characteristic) {
 
        reportValue(error.service, error.characteristic, "Error: " + error.message);
    }
}


function connectSuccess(result) {
 
    console.log("- " + result.status);
 
    if (result.status === "connected") {
 
        getDeviceServices(result.address);
    }
    else if (result.status === "disconnected") {
 
        console.log("Disconnected from device: " + result.address, "status");
    }
}

function connectFailed(result){
	console.log("CONNECT FAILED ========");
    console.log("- " + result.status);
}

	  
		
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
			storage.clear();
			app.page('login');
		});
		
		$(document).on('click','.pic_open',function(e){
			e.preventDefault();
			var id = $(this).data('id');			
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
		
		$(document).on('click','header .nav-link',function(e){
			e.preventDefault();
			app.page($(this).data('menu'));
		});
		
		$(document).on('click','.choose_inspection',function(e){
			e.preventDefault();
			$btn = $(this);
			var type = $(this).data('type');
			var btn_text = $btn.text();
			$btn.html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> იტვირთება...').prop('disabled',true);
			$.ajax({
					  method: "POST",
					  url: base_url+'auth/get_regions',
						headers:{'Authorization': storage.getItem('token_type')+' '+storage.getItem('access_token') },					  
					}).done(function(data){
							$('body').append(data);
							$('#regions').modal('show');
							$btn.prop('disabled',false).text(btn_text);
							$('.inspection_continue').data('type',type);
					});
		});
		
		$(document).on('click','.remove_modal',function(){
			$('.modal:visible').modal('hide').remove();
		});
		
		$(document).on('change', '.change_region',function(){
			var val = $(this).val();
			$btn = $('.inspection_continue');
			var btn_text = $btn.text();
			$btn.html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> იტვირთება...').prop('disabled',true);
			$.ajax({
					  method: "POST",
					  url: base_url+'auth/get_service_centers',
						headers:{'Authorization': storage.getItem('token_type')+' '+storage.getItem('access_token') },			
						data:{
							'region_id':val
						}
					}).done(function(data){
							$('[name="service_center_id"]').html(data);
							$btn.prop('disabled',false).text(btn_text);
					});
			
		});
		
		$(document).on('change','.red_border',function(){
			$(this).removeClass('red_border');
		});
		
		$(document).on('click','.inspection_continue',function(){
			var region_id = $('[name="region_id"]').val();
			var service_center_id = $('[name="service_center_id"]').val();
			var service = $('[name="service"]').val();
			var type = $(this).data('type');
			if(!region_id){
				$('[name="region_id"]').addClass('red_border');
				return false;
			}
			if(!service_center_id){
				$('[name="service_center_id"]').addClass('red_border');
				return false;
			}
			
			$.ajax({
					  method: "POST",
					  url: base_url+'auth/load_map',
						headers:{'Authorization': storage.getItem('token_type')+' '+storage.getItem('access_token') },			
						data:{
							'region_id':region_id,
							'service_center_id':service_center_id,
							'service':service,
							'type':type
						}
					}).done(function(data){
							$('.modal:visible').modal('hide').remove();
							$('body').append("<div class='gis_map'></div>");
							$('.gis_map').html(data);
					});
			
		});
	}
};