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
		
		/*
		AdvancedGeolocation.start(function(data){

                try{

                    var jsonObject = JSON.parse(data);

                    switch(jsonObject.provider){
                        case "gps":
                            if(jsonObject.latitude != "0.0"){
                                console.log("GPS location");
                                console.log("GPS location detected - lat:" +
                                    jsonObject.latitude + ", lon: " + jsonObject.longitude +
                                    ", accuracy: " + jsonObject.accuracy);
                                
                            }
                            break;

                        case "network":
                            if(jsonObject.latitude != "0.0"){
                                
                                console.log("Network ");
                                console.log("Network location detected - lat:" +
                                    jsonObject.latitude + ", lon: " + jsonObject.longitude +
                                    ", accuracy: " + jsonObject.accuracy);
                               
                            }
                            break;

                        case "satellite":
                            console.log("Satellites  ");
                            console.log("Satellites detected " + (Object.keys(jsonObject).length - 1));
                            console.log("Satellite meta-data: " + data);
                          
                            break;

                        case "cell_info":
						console.log("CELL cell_info -------------------");
                            console.log("cell_info JSON: " + data);
                            break;

                        case "cell_location":
							console.log("CELL LOCATION -------------------");
                            console.log("cell_location JSON: " + data);
                            break;

                        case "signal_strength":
                            console.log("SIGNAL STRENGTH: --------------------");
                            console.log("Signal strength JSON: " + data);
                            break;
                    }
                }
                catch(exc){
                    console.log("Invalid JSON: " + exc);
                }
            },
            function(error){
                console.log("Error JSON: " + JSON.stringify(error));
                var e = JSON.parse(error);
                console.log("Error no.: " + e.error + ", Message: " + e.msg + ", Provider: " + e.provider);
            },
            /////////////////////////////////////////
            //
            // These are the required plugin options!
            // README has API details
            //
            /////////////////////////////////////////
            {
                "minTime":0,
                "minDistance":0,
                "noWarn":false,
                "providers":"all",
                "useCache":true,
                "satelliteData":true,
                "buffer":true,
                "bufferSize":10,
                "signalStrength":false
            });

		*/
		
		
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
	gpsReady:function(data){
		app.debug("GPS READY");
		navigator.geolocation.getCurrentPosition(onLocate, onError, {enableHighAccuracy:true});
	},
	gpsfailed:function(data){
		app.debug(data);
		swal("ვერ მოხერხდა GPS მოწყობილობასთან დაკავშირება გთხოვთ ჩართოთ ბლუთუსი და დაუკავშირდეთ GPS");
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
		
			
	$(document).on('click','.my_coortinates',function(){
				console.log("DAECHIRA");
				navigator.geolocation.setSource('external', app.gpsReady,app.gpsfailed); 									
		});
	}
};