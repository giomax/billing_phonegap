//var base_url = "http://billing.com.ge/api/";
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
		storage.setItem('menu',page);
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
			order: [[0, 'desc']],
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
			if(storage.getItem('menu')){
				return app.page(storage.getItem('menu'));
			}else{
				return app.page('home');
			}
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
							$('.app').hide();
							$('body').append("<div class='gis_map'></div>");
							$('.gis_map').html(data);
					});
			
		});
		
		$(document).on('click','.zoom',function(){			
			var service = $('[name="service"]').val();
			var id = $(this).data('id');
			var active_menu = $('.main_menu.active').data('menu');
			
			$.ajax({
					  method: "POST",
					  url: base_url+'auth/load_zoom',
						headers:{'Authorization': storage.getItem('token_type')+' '+storage.getItem('access_token') },			
						data:{
							'region_id':region_id,
							'service_center_id':service_center_id,
						}
					}).done(function(data){
							$('.modal:visible').modal('hide').remove();
							$('.app').hide();
							$('body').append("<div class='gis_map'></div>");
							$('.gis_map').html(data);
					});
			
		});
		
		$(document).on('change', '.change_district',function(){
	 var type = $(this).data('type');
		 var $this = $(this);
		
		 //1 radio
		 //2 select
		 //3 select
		 $.ajax({
				  method: 'POST',
				  url: base_url+'auth/retreive_channels',
				  headers:{'Authorization': storage.getItem('token_type')+' '+storage.getItem('access_token') },			
					data:{
						  'district_id':$('[name="district_id"]').val(),
						  'type':type,
					  },			
		  }).done(function( data) {
				if(type == 1){
				  $('.channels').html(data);
				}
				if(type == 2){
					$('[name="channel_id"]')[0].selectize.destroy();
					$('[name="channel_id"] option:not(:first-child)').remove();
	
				$('[name="channel_id"]').append(data);			
				reform('[name="channel_id"]','select');
				}
				if(type == 3){
					$('.change_channel, .for_channel_id').remove();
					$('.change_first_channel, .for_first_channel_id').remove();
					$('.change_second_channel, .for_second_channel_id').remove();
					$('.change_third_channel, .for_third_channel_id').remove();
					
					$('.connect_channels').remove();
					
					$this.after('<label class="for_channel_id marginTop">მაგისტრალური არხი</label><select class="form-control non change_channel form-control-sm" name="channel_id" data-type="3"><option value=""></option>'+data+'</select>');
				}
            });
	});
	
	$(document).on('change', '[name="inspection_file"]',function(){
		if($('.ijaraFiles li').length == 25){
			swal("თქენ აღარ შეგიძლიათ მეტი ფაილის ატვირთვა, მაქსიმუმი ფაილების რაოდენობა 25");
			return false;
		}
	$this = $(this).parent();
	
	$('.btnUpload:visible').html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> იტვირთება...').prop('disabled',true);
	
	var name = $(this).attr('name');
        var fd = new FormData();
        var files = $(this)[0].files[0];
        fd.append('file',files);

        $.ajax({
            url: base_url+'auth/upload_inspection',
            type: 'post',
            data: fd,
			headers:{'Authorization': storage.getItem('token_type')+' '+storage.getItem('access_token') },			
            contentType: false,
            processData: false,
			error:function(data){
				swal("შეცდომა: გაფართოების ფაილი ვერ იტვირთება. შეგიძლიათ ['jpg','jpeg','png','pdf','doc','docx','xls','xlsx'] გაფართების ფაილების ატვირთვა.");
			
	$('.btnUpload:visible').html('ატვირთვა').prop('disabled',false);
			},
        }).done(function(data){
			$this.find('.ijaraFiles').append("<li><a href='"+data[1]+"' target='_BLANK'>"+data[0]+"</a><input name='"+name+"_id[]' type='hidden' value='"+data[1]+"'/><input name='"+name+"_file[]' type='hidden' value='"+data[0]+"'/><span class='fileDelete btn btn-sm btn-danger'>X</span></li>");
			$("[name='inspection_file']").val('');
			$('.btnUpload:visible').html('ატვირთვა').prop('disabled',false);
		
		});
    });
	
	$(document).on('click', '.ijaraFiles .fileDelete',function(){
		$this = $(this);
			swal({
		title:'დარწმუნებული ხართ რომ გსურთ ფაილის წაშლა?',
		confirmButtonText:'დიახ',
		cancelButtonText: 'არა',
  showCancelButton: true,
  showCloseButton: true
		}).then(function(result){
			if(result.value){
				$this.parent().remove();
				$("[name='in_moijare']").val('');
				$("[name='in_contract']").val('');
			
			}
		});
	});
	}
};