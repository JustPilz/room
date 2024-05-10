function load_v2_modal(method) {
	$.ajax({
		url: '/planner/modal/',
	    cache: false,
	    dataType : "html",
	    timeout: 15000,
	    data: "method="+method,
	    success: function (data, textStatus) {	
			$("#canvas_v2_wrapper").append(data);
		},
	    beforeSend: function(){
	    	$("#fog").addClass("sticky").show();
    	},
	   	error: function(data){
	   		console.log(data);
	    	$("#fog").removeClass("sticky").hide();
	   	},
		type : "POST"
	});
}

function load_v2_modal_from_id(method) {
	if (!$("#"+method).length) return false;
	$("#fog").addClass("sticky").show();
	var content = $("#"+method).html();
	var content_class = $("#"+method).attr("data-class");
	$("#canvas_v2_wrapper").append('<div id="fog_window_wrapper" class="'+content_class+'"><div id="fog_window"><div id="fog_window_close" onclick="return close_v2_modal();">'+l10n.interface_close_modal+'</div><div id="fog_window_content">'+content+'</div></div></div>');
}

function send_bugreport(text) {
	let bugreport_data = {};
	bugreport_data.data = project.copy();
	bugreport_data.comment = text;
	$("#planner_report_error").removeClass("active");
	$("#planner_report_body").removeClass("done");
	$("#fog_window_content textarea").blur();
	setTimeout(function(){
		svgAsPngUri(document.getElementById("main_svg")).then(function(uri) {
			bugreport_data.image = uri;
			$.ajax({
				url: '/setup/api/bugreport/?object_id='+$("body").attr("data-object-id")+'&authkey='+$("body").attr("data-authkey"),
			    cache: false,
			    timeout: 30000,
			    data: JSON.stringify(bugreport_data),
				contentType: "application/json",
				dataType: "json",
			    success: function (data, textStatus) {
					if (data.result == 'success') {
						close_v2_modal();
						planner_chat_open();
					} else if (data.error_text != 'undefined') {
						$("#fog_window_content textarea").focus();
						$("#planner_report_error").text(data.error_text).addClass("active");
					}
				},
			    complete: function(){
			    	$("#planner_report_body").addClass("done");
			    	$("#fog_window_content textarea").focus();
		    	},
			    error: function(data){
			    	console.log(data);
		    	},
				type : "POST"
			});
		});
	}, 100);
}

function planner_direct_init(directdata) {
	if (!$("#planner_ui_direct").length) {
		return false;
	}
	planner_direct_size();
	planner_direct_open(directdata);
}

function planner_direct_size() {
	if ($(window).width() < 1200) {
		$("#planner_ui_direct").addClass("blocked");
	} else if ($(window).width() < 1500) {
		$("#planner_ui_direct").removeClass("blocked");
		$("#planner_ui_direct").addClass("compact");
	} else {
		$("#planner_ui_direct").removeClass("blocked");
		$("#planner_ui_direct").removeClass("compact");
	}
}

function planner_direct_open(directdata) {
	if (!$("#planner_ui_direct").length) {
		return false;
	}
	if (getCookie('direct_locked')) {
		console.log("direct locked");
		planner_direct_minibanner_open(directdata);
		return true;
	}
	if (!directdata.id) {
		console.log("no direct");
		planner_direct_minibanner_open(directdata);
		return true;
	}
	setTimeout(function(){
		$("#planner_ui_direct").removeClass("minibanner");
		$("#planner_ui_direct").removeClass("closed");
		if ($("#planner_ui_direct").attr("data_id") != directdata.id) {
			$("#planner_ui_direct").attr("data_id", directdata.id);
			$("#planner_ui_direct_content").html(directdata.html);
		} else {
			console.log("direct same id");
		}
	}, 1000);
}

function planner_direct_minibanner_open(directdata) {
	console.log('mini');
	if (!directdata || !directdata.minibanner) {
		console.log('no minibanner id');
		return false;
	}
	
	if (getCookie('direct_mini_locked')) {
		console.log("direct mini locked");
		return false;
	}
	
	setTimeout(function(){
		$("#planner_ui_direct").removeClass("closed");
		$("#planner_ui_direct").addClass("minibanner");
		if ($("#planner_ui_direct").attr("data_id") != directdata.minibanner.id) {
			$("#planner_ui_direct").attr("data_id", directdata.minibanner.id);
			$("#planner_ui_direct_content").html(directdata.minibanner.html);
		} else {
			console.log("direct same id");
		}
	}, 1000);
}

function planner_direct_click() {
	var id = $("#planner_ui_direct").attr("data_id");
	var a = document.createElement('a');
	a.target="_blank";
	a.href='/direct/click/'+id+'/';
	a.click();
}

function planner_direct_close(is_forced) {
	$("#planner_ui_direct").addClass("closed");
	if (is_forced === true) {
		attempts_count = getCookie('direct_close_count');
		
		if (!attempts_count) {
			attempts_count = 0;
		} else {
			attempts_count = parseInt(attempts_count);
		}
		
		if (!$("#planner_ui_functions .planner_ui_function.pro").hasClass("is_pro")) {
			var next_time = 300 + attempts_count*300;
		} else {
			var next_time = 3600 + attempts_count*3600*2;
		}
		
		if ($("#planner_ui_direct").hasClass("minibanner")) {
			var expdate = new Date();
			expdate.setTime(expdate.getTime() + (600*1000));
			setCookie('direct_mini_locked', '1', expdate, '/');
		}
		
		var expdate = new Date();
		expdate.setTime(expdate.getTime() + (3600*24*30*1000));
		setCookie('direct_close_count', attempts_count+1, expdate, '/');
		
		var expdate = new Date();
		expdate.setTime(expdate.getTime() + (next_time*1000));
		setCookie('direct_locked', '1', expdate, '/');
	}
}

function close_v2_modal() {
	$("#fog").removeClass("sticky").hide();
	$("#fog_window_wrapper").remove();
}

function set_planner_guest_mode() {
	$("#save_v2_plan").addClass("guest_mode");
	$("#fog").html("").hide().removeClass("done");
}

function open_help_window(id) {
	close_help_window();
	if(!$(".planner_help_window_wrapper#"+id).length) return false;
	$(".planner_help_window_wrapper#"+id).addClass("active");
}

function close_help_window () {
	$(".planner_help_window_wrapper").removeClass("compact");
	$(".planner_help_window_wrapper").removeClass("active");
}

function close_footer_bar() {
	$("#footer_bar_consultant").removeClass("hidden");
	$("#planner_ui_tools_wrapper").removeClass("hidden");
	$("#footer_bar").removeClass("open");
	$("#footer_bar_folders .footer_bar_folder").removeClass("active");
	$("#footer_bar_content .footer_bar_content").removeClass("active");
	$("#footer_bar_content").css("height", "0px");
	if (plan === 'init') {
		// возвращаем инструмент, который был активным до открытия footer_bar
		if (tool_save !== null) {
			tool = tool_save;
			tool_save = null
		}
	}
}

function open_footer_bar(id) {
	$("#footer_bar_consultant").addClass("hidden");
	$("#planner_ui_tools_wrapper").addClass("hidden");
	$("#footer_bar .footer_bar_comment").removeClass("expandUp");
	$("#footer_bar_tools .footer_bar_tool").removeClass("active");
	$("#footer_bar .footer_bar_tip_wrapper").removeClass("visible");
	$("#footer_bar_folders .footer_bar_folder").removeClass("active");
	$("#footer_bar_folders .footer_bar_folder.dir_"+id).addClass("active");
	$("#footer_bar_content .footer_bar_content").removeClass("active");
	$("#footer_bar_content .footer_bar_content.tab_"+id).addClass("active");
	$("#footer_bar_content").css("height", $("#footer_bar_content .footer_bar_content.tab_"+id).outerHeight()+"px");
	$("#footer_bar").addClass("open");
	$(".planner_help_window_wrapper.active").addClass("compact");
	tool_save = tool;
	tool = 'none';
	$('body').css('cursor', 'default');
}

function init_navi_bar() {
	if ($("#planner_ui_functions").length) {
		var margin_left = parseInt($("#planner_ui_functions").outerWidth());
		if ($("#planner_header").css("z-index") != '100001') {
			$("#planner_header").css("left", margin_left+"px");
		}
	}
	
	var current = $("#groups_navi .groups_navi_item.active");
	var wrapper = $("#groups_navi");
	if (!wrapper.length) return false;
	if (!current.length) init_active_tools();
	var current = $("#groups_navi .groups_navi_item.active");
	let window_width = $("#groups_navi_wrapper").width();

	if (current.length && (current.offset().left) > window_width*0.80)
	{
		var half = window_width/2 - current.outerWidth()/2;
		var left_offset = parseInt(half - current.position().left);
		var max_offset = window_width - (wrapper.width()-0);
		if (max_offset > left_offset-100) left_offset = max_offset;
		if (left_offset > 0) left_offset = 0;
		if ($("#planner_header").css("z-index") != '100001') {
			wrapper.css("left", left_offset+"px");
		}
	}

	if (current.length && (current.offset().left) < window_width*0.80)
	{
		var half = window_width/2 - current.outerWidth()/2;
		var left_offset = parseInt(half - current.position().left);
		if (left_offset > -100) left_offset = 0;
		if ($("#planner_header").css("z-index") != '100001') {
			wrapper.css("left", left_offset+"px");
		}
	}

	if ($("#planner_header").css("z-index") != '100001') {
		setTimeout(function(){
			init_navi_arrows();
		}, 300);
	}

	check_tools_placement();
}

function navi_next()
{
	if ($("#planner_header").css("z-index") == '100001') {
		$("#groups_next").slideUp(300);
		$("#groups_navi").animate({scrollTop: $("#groups_navi")[0].scrollHeight + 'px'}, 300);
		//$("#groups_navi").scrollTop($("#groups_navi")[0].scrollHeight);
		return false;
	}
	var wrapper = $("#groups_navi");
	let window_width = $("#groups_navi_wrapper").width();
	var left_offset = wrapper.position().left - parseInt(window_width/2);
	var max_offset = window_width - (wrapper.width()-0);
	if (max_offset > left_offset-100) left_offset = max_offset;
	wrapper.css("left", left_offset+"px");
	setTimeout(function(){
		init_navi_arrows();
	}, 300);
}

function navi_prev()
{
	var wrapper = $("#groups_navi");
	let window_width = $("#groups_navi_wrapper").width();
	var left_offset = wrapper.position().left + parseInt(window_width/2);
	if (left_offset > -100) left_offset = 0;
	wrapper.css("left", left_offset+"px");
	setTimeout(function(){
		init_navi_arrows();
	}, 300);
}

function init_navi_arrows(terminate = false)
{
	if (!$("#groups_navi_wrapper").length) return false;
	let window_width = $("#groups_navi_wrapper").width();
	var first_child = $("#groups_navi .groups_navi_item:first-child");
	if (first_child.offset().left != $("#groups_navi_wrapper").offset().left)
	{
		$("#groups_prev").addClass("active");
	}
	else
	{
		$("#groups_prev").removeClass("active");
	}

	var last_child = $("#groups_navi .groups_navi_item:last-child");
	var current = Math.floor(last_child.offset().left+last_child.outerWidth());

	if ($("#planner_ui_functions").length)
	{
		current = current - parseInt($("#planner_ui_functions").outerWidth());
	}

	if (current > window_width)
	{
		$("#groups_next").addClass("active");
	}
	else
	{
		$("#groups_next").removeClass("active");
	}

	if (!terminate)
	{
		setTimeout(function(){
			init_navi_arrows(true);
		}, 300);
	}
}

var current_plan = false;
function show_tracker(plan)
{
	if (plan) current_plan = plan;
	$("#planner_ui_tracker .planner_ui_track").removeClass("slideUp");
	var banners = $("#planner_ui_tracker .planner_ui_track.show_on_"+current_plan);
	if (banners.length)
	{
		banners.eq(0).addClass("slideUp");
	}
}

function next_track()
{
	$("#planner_ui_tracker .planner_ui_track.slideUp").remove();
	show_tracker(current_plan);
}

function force_planner_track(ind = false)
{
	if (!ind) return false;
	if ($("#planner_ui_tracker .planner_ui_track."+ind).length)
	{
		$("#planner_ui_tracker .planner_ui_track").removeClass("slideUp");
		$("#planner_ui_tracker .planner_ui_track."+ind).addClass("slideUp");
	}
}

function remove_planner_track(ind = false)
{
	if (!ind) return false;
	if ($("#planner_ui_tracker .planner_ui_track."+ind).length)
	{
		$("#planner_ui_tracker .planner_ui_track."+ind).remove();
		show_tracker();
	}

	if ($(".planner_custom_track."+ind).length)
	{
		$(".planner_custom_track."+ind).remove();
	}
}

function deactivate_current_tool_menuitem(toolname = false)
{
	if (!toolname) $(".tools_item.active").removeClass('active');
	$(".options_preset").removeClass("slideFastLeft");
	$(".planner_custom_track").removeClass("slideUp");
}

tool_events.scroller_closed = 0;
tool_events.tool_selection = 0;
function set_scroller(element, height) {
	if (!$(element).length) return false;
	$(element).slimScroll({
		height: height+'px',
		railVisible: true,
		size: '4px',
		distance: '3px',
		color: '#e68506',
		railColor: '#000',
		opacity: 1,
		railOpacity: 0.3,
		disableFadeOut: true,
		alwaysVisible: false
	});
	$(element).scroll(function() {
		console.log(tool_events.scroller_closed);
		if (tool_events.scroller_closed < 10 && $("#planner_ui_guide_scroll_menu").hasClass("active")) {
			$("#planner_ui_guide_scroll_menu").removeClass("active");
			tool_events.scroller_closed++;
		} else if (tool_events.scroller_closed >= 10) {
			console.log('die');
			$("#planner_ui_guide_scroll_menu").remove();
		}
	});
}

function check_tools_placement() {
	if ($("#planner_ui_tools").length) {
		//$("#planner_ui_tools_scroller").slimScroll({destroy: true});
		//$(".scroller").slimScroll({destroy: true});
		$(".slimScrollBar, .slimScrollRail").remove();
		$(".slimScrollDiv").contents().unwrap();
		
		$("#planner_ui_tools_scroller").css("max-height", "auto");
		$("#planner_ui_tools_scroller").css("height", "auto");

		var max_height = parseInt($("#canvas_wrapper").height()) - 80;
		var tools_height = parseInt($("#planner_ui_tools_scroller").outerHeight());

		if (tools_height >= max_height && !$("#planner_ui_tools_wrapper").hasClass("compact")) {
			$("#planner_ui_tools_wrapper").addClass("compact");
		}

		var max_height = parseInt($("#canvas_wrapper").height()) - 80;
		var tools_height = parseInt($("#planner_ui_tools_scroller").outerHeight());

		if (tools_height+90 < max_height) {
			$("#planner_ui_tools_wrapper").removeClass("compact");
			var max_height = parseInt($("#canvas_wrapper").height()) - 90;
			var tools_height = parseInt($("#planner_ui_tools_scroller").outerHeight());
			if (tools_height >= max_height) {
				$("#planner_ui_tools_wrapper").addClass("compact");
			}
		}

		var max_height = parseInt($("#canvas_wrapper").height()) - 80;
		var tools_height = parseInt($("#planner_ui_tools_scroller").outerHeight());

		if (tools_height >= max_height) {
			$("#planner_ui_tools_scroller").css("height", "auto");
			$("#planner_ui_tools_scroller").css("max-height", max_height+"px");
			set_scroller("#planner_ui_tools_scroller", tools_height);
		} else {
			$("#planner_ui_tools_scroller").css("max-height", "10000px");
			$("#planner_ui_tools_scroller").css("height", "auto");
		}

		set_scroller(".scroller", tools_height);
	}
}

function open_subtools_wrapper(target) {
	$(".planner_ui_subtools").removeClass("active");
	var wrapper = $(".planner_ui_subtools[data-parent='"+target+"']");
	if (!wrapper.length) return false;
	
	wrapper.siblings(".planner_ui_subtools").find(".subtools_group").removeClass("active");;
	
	var width = parseInt($("#planner_ui_tools").outerWidth());
	var this_width = parseInt(wrapper.outerWidth());
	
	$(".slimScrollBar, .slimScrollRail").fadeOut(0);

	wrapper.css("left", width+"px");
	wrapper.addClass("active");
	if ($("#planner_ui_guide_scroll_menu").length) {
		var last_item = wrapper.find(".scroller").children('.subtools_item:last-child');
		if (last_item.length) {
			if (wrapper.height() <= last_item.position().top) {
				$("#planner_ui_guide_scroll_menu").addClass("active");
				$("#planner_ui_guide_scroll_menu").css("width", (this_width-2)+"px");
			}
		}
	}
	//$("#planner_ui_tools_wrapper").css("width", width+this_width+"px");
	set_subtools_width();
}

function set_subtools_width () {
	wrapper = $(".planner_ui_subtools.active");
	if (!wrapper.length) return false;
	var width = parseInt($("#planner_ui_tools").outerWidth());
	var this_width = parseInt(wrapper.outerWidth());
	$("#planner_ui_tools_wrapper").css("width", width+this_width+"px");
}

function ui_open_help(plan = false, button = false)
{
	if (button) $("#planner_ui_help").addClass("active");
	if (!plan) {
		if ($("#planner_ui_help_options a.current").length) {
			$("#planner_ui_help_options a.current").trigger("click");
		} else {
			$("#planner_ui_help_options a").eq(1).trigger("click");
		}

		return false;
	}

	$("#planner_ui_help .planner_ui_help_adbanner").removeClass("active");
	$("#planner_ui_help .planner_ui_help_adbanner.show_on_"+plan).addClass("active");

	if (!$("#planner_ui_help .planner_ui_help_content."+plan).length) return false;

	$("#planner_ui_help .planner_ui_help_content").removeClass("active");
	$("#planner_ui_help .planner_ui_help_content."+plan).addClass("active");
	$("#planner_ui_help_options").removeClass("slideFastUp");

	$("#planner_ui_help_options a").removeClass("current");
	var active_option = $("#planner_ui_help_options a.plan_"+plan);
	active_option.addClass("current");
	$("#planner_ui_help_select > a").text(active_option.text());
	$("#planner_ui_help_tabs .planner_ui_help_tab").removeClass("active");
	$("#planner_ui_help_tabs .planner_ui_help_tab.help").addClass("active");
	$("#planner_ui_help_navi").addClass("active");
	$("#planner_ui_help .planner_ui_help_content_title").addClass("active");

	$(".planner_ui_subtools").removeClass("active");
	$("#planner_ui_tools_wrapper").css("width", "40px");
	$("#planner_ui_guide_scroll_menu").removeClass("active");
	$("#planner_ui_tools_wrapper").removeClass("active");
}

function ui_open_designer_help(button = false)
{
	if (button) $("#planner_ui_help").addClass("active");
	$("#planner_ui_help .planner_ui_help_content").removeClass("active");
	$("#planner_ui_help_options").removeClass("slideFastUp");
	$("#planner_ui_help_tabs .planner_ui_help_tab").removeClass("active");
	$("#planner_ui_help_tabs .planner_ui_help_tab.designer").addClass("active");
	$("#planner_ui_help .planner_ui_help_content.designer").addClass("active");
	$("#planner_ui_help_navi").removeClass("active");
	$("#planner_ui_help .planner_ui_help_content_title").removeClass("active");
	$("#planner_ui_help .planner_ui_help_adbanner").addClass("active");
	$(".planner_ui_subtools").removeClass("active");
	$("#planner_ui_guide_scroll_menu").removeClass("active");
	$("#planner_ui_tools_wrapper").css("width", "40px");
	$("#planner_ui_tools_wrapper").removeClass("active");
}

function ui_close_help()
{
	$("#planner_ui_help").removeClass("active");
}

function init_active_tools()
{
	var first_item = $("#groups_navi_wrapper .groups_navi_item").eq(0);
	var active_item = $("#groups_navi_wrapper .groups_navi_item.active");
	if (!$("#canvas_v2_wrapper").length) return false;

	if (!active_item.length)
	{
		var current_cookie = getCookie('active_plan_name');

		if (current_cookie)
		{
			change_group(current_cookie, true);
		}
		else
		{
			change_group(first_item.attr("data-plan"), true);
		}
	}
	else
	{
		change_group(active_item.attr("data-plan"));
	}
}

function click_on_navi_group_from_cookie() {
	var name = getCookie('active_plan_name');
	if (name) click_on_navi_group(name);
}

function click_on_navi_group(name) {
	//$("#groups_navi_wrapper .groups_navi_item[data-plan='"+name+"']").click();
}

function send_save_reqeust() {
	$("#footer_bar_save_status .save_status").removeClass("active");
	$("#footer_bar_save_status .save_status.loading").addClass("active");
}

function save_project_from_fog() {
	$("#fog .fog_done_wrapper").remove();
	$("#fog").removeClass("done");
	project.save(false, true);
}

tool_events.esc_guide_closed = 0;
tool_events.wallpoint_selected = 0;
function planner_guide_show() {
	if (!walls || !walls.db || !$(".planner_ui_guide").length) return false;
	if (walls.db.length > 0 && tool_events.wall < 1) {
		tool_events.wall = 1;
	}
	//console.log(items.db.length);
	//console.log(tool_events.tool_selection);
	if (rooms1.data.length > 0) {
		$("#preplan_promo_video").remove();
	}
	
	if (selected.wallPoint && $("#planner_ui_guide_markers").length && tool_events.wallpoint_selected < 3) {
		$(".planner_ui_guide.active:not(#planner_ui_guide_markers)").removeClass("active");
		$("#planner_ui_guide_markers").addClass("active");
		$("#planner_ui_direct").addClass("hidden");
		return false;
	} else if ($("#planner_ui_guide_markers").hasClass("active")) {
		$("#planner_ui_guide_markers").removeClass("active");
		$("#planner_ui_direct").removeClass("hidden");
		tool_events.wallpoint_selected++;
	} else if (!$("#planner_ui_guide_markers").length && $("#planner_ui_direct").hasClass("hidden")) {
		$("#planner_ui_direct").removeClass("hidden");
	}

	if (item_resizing && $("#planner_ui_guide_resizing").length) {
		$(".planner_ui_guide.active:not(#planner_ui_guide_resizing)").removeClass("active");
		$("#planner_ui_guide_resizing").addClass("active");
		$("#planner_ui_direct").addClass("hidden");
		return false;
	} else if ($("#planner_ui_guide_resizing").hasClass("active")) {
		$("#planner_ui_guide_resizing").removeClass("active");
		$("#planner_ui_direct").removeClass("hidden");
	} else if (!$("#planner_ui_guide_resizing").length && $("#planner_ui_direct").hasClass("hidden")) {
		$("#planner_ui_direct").removeClass("hidden");
	}
	
	if ($("#canvas_v2_wrapper").hasClass("background_mode")) {
		$(".planner_ui_guide").removeClass("active");
		$("#planner_ui_guide_clear_background").addClass("active");

		if (!$("#planner_ui_guide_clear_background .show_hide_image").text()) {
			$("#planner_ui_guide_clear_background .show_hide_image").text(l10n.hide);
		}

		if ($("#canvas_v2_wrapper").hasClass("background_mode_active")) {
			$("#planner_ui_guide_walls").addClass("active");
		} else if ($("#planner_ui_guide_walls").hasClass("active")) {
			$("#planner_ui_guide_walls").removeClass("active");
		}
		
		return false;
	} else if ($("#planner_ui_guide_clear_background").hasClass("active")) {
		$("#planner_ui_guide_clear_background").removeClass("active");
	}
	
	if (plan == 'init' && (!tool_events.wall || tool_events.wall < 1) && walls.db.length < 1) {
		$("#planner_ui_guide_walls").addClass("active");
	} else if ($("#planner_ui_guide_walls").hasClass("active")) {
		$("#planner_ui_guide_walls").removeClass("active");
	}
	
	if (plan == 'init' && walls.db.length < 6 && walls.db.length > 0 && items.db.length < 1) {
		$("#eraser_guide").addClass("active");
	} else if ($("#eraser_guide").hasClass("active")) {
		$("#eraser_guide").removeClass("active");
	}
	
	if ((tool_group == 'walls' || tool_group == 'sockets' || tool_group == 'doors' || tool_group == 'lights') && tool_events.wall > 0 
		&& tool_events.esc_guide_closed < 5 && walls.db.length > 0 && tool != 'air') {
		$("#planner_ui_guide_esc").addClass("active");
		if (tool == 'pillar' || tool == 'air' || tool == 'pillar_air' || tool_group == 'doors') {
			$("#planner_ui_guide_esc").addClass("with_modal");
		} else if ($("#planner_ui_guide_esc").hasClass("with_modal")) {
			$("#planner_ui_guide_esc").removeClass("with_modal");
		}
	} else if ($("#planner_ui_guide_esc").hasClass("active")) {
		tool_events.esc_guide_closed++;
		$("#planner_ui_guide_esc").removeClass("active");
	}
		
	if (plan == 'init' && (tool == 'pillar' || tool == 'air') && pillars.db.length < 1) {
		$("#planner_ui_guide_walls").removeClass("active");
		$("#planner_ui_guide_pillars").addClass("active");
	} else if ($("#planner_ui_guide_pillars").hasClass("active")) {
		$("#planner_ui_guide_pillars").removeClass("active");
	}
	
	var isOpera = (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
	if (isOpera) {
		if (plan == 'init' && (tool == 'none' || tool == 'wall') && !getCookie('guestures_guide_closed')) {
			$("#planner_ui_guide_guestures").addClass("active");
		} else if ($("#planner_ui_guide_guestures").hasClass("active")) {
			$("#planner_ui_guide_guestures").removeClass("active");
		}
	} else {
		if (plan == 'init' && tool == 'wall' && walls.db.length < 1) {
			$("#planner_ui_guide_cm").addClass("active");
		} else if ($("#planner_ui_guide_cm").hasClass("active")) {
			$("#planner_ui_guide_cm").removeClass("active");
		}
		
		if (plan == 'init' && walls.db.length > 0 && rooms1.data.length < 1 && tool != 'pillar' && tool != 'air') {
			$("#planner_ui_guide_video").addClass("active");
		} else if ($("#planner_ui_guide_video").hasClass("active")) {
			$("#planner_ui_guide_video").removeClass("active");
		}
	}
	
	if (plan == 'init' && tool == 'wall' && walls.db.length < 1) {
		$("#planner_ui_guide_walls_draw").addClass("active");
		if (tool_events.click_wo_wall !== 'undefined' && tool_events.click_wo_wall > 1 && !$("#planner_ui_guide_walls_draw").hasClass("aggressive")) {
			$("#planner_ui_guide_walls_draw").addClass("aggressive");
		}
	} else if ($("#planner_ui_guide_walls_draw").hasClass("active")) {
		$("#planner_ui_guide_walls_draw").removeClass("active");
	}
	
	if ((plan == 'init' || plan == 'build') && (tool_group == 'doors' || tool_group == 'windows') && walls.db.length > 1 && doors.db.length < 1 && windows.db.length < 1) {
		$("#planner_ui_guide_doors").addClass("active");
	} else if ($("#planner_ui_guide_doors").hasClass("active")) {
		$("#planner_ui_guide_doors").removeClass("active");
	}
	
	if (tool_group == 'doors' && doors.db.length > 0 && doors.db.length < 4) {
		$("#planner_ui_guide_doors_opening").addClass("active");
	} else if ($("#planner_ui_guide_doors_opening").hasClass("active")) {
		$("#planner_ui_guide_doors_opening").removeClass("active");
	}
	
	if (tool == 'delimiter') {
		$("#planner_ui_guide_delimiter").addClass("active");
	} else if ($("#planner_ui_guide_delimiter").hasClass("active")) {
		$("#planner_ui_guide_delimiter").removeClass("active");
	}
	
	if (plan == 'break' && tool == 'break') {
		$("#planner_ui_guide_break").addClass("active");
	} else if ($("#planner_ui_guide_break").hasClass("active")) {
		$("#planner_ui_guide_break").removeClass("active");
	}
	
	if (plan == 'floor' && tool == 'none') {
		$("#planner_ui_guide_flooring").addClass("active");
	} else if ($("#planner_ui_guide_flooring").hasClass("active")) {
		$("#planner_ui_guide_flooring").removeClass("active");
	}

	if (plan == 'floor_cap') {
		$("#planner_ui_guide_q_icon").addClass("active");
	} else if ($("#planner_ui_guide_q_icon").hasClass("active")) {
		$("#planner_ui_guide_q_icon").removeClass("active");
	}
	
	if (plan == 'cables') {
		$("#planner_ui_guide_cables").addClass("active");
	} else if ($("#planner_ui_guide_cables").hasClass("active")) {
		$("#planner_ui_guide_cables").removeClass("active");
	}
		
	if (tool == 'warm_floor') {
		$("#planner_ui_guide_warm_floor").addClass("active");
	} else if ($("#planner_ui_guide_warm_floor").hasClass("active")) {
		$("#planner_ui_guide_warm_floor").removeClass("active");
	}

	if (plan == 'rooms') {
		$("#planner_ui_guide_q_icon_rooms").addClass("active");
	} else if ($("#planner_ui_guide_q_icon_rooms").hasClass("active")) {
		$("#planner_ui_guide_q_icon_rooms").removeClass("active");
	}
		
	if (plan == 'break' && tool == 'break_part') {
		$("#planner_ui_guide_break_part").addClass("active");
	} else if ($("#planner_ui_guide_break_part").hasClass("active")) {
		$("#planner_ui_guide_break_part").removeClass("active");
	}
		
	if ((plan == 'init' || plan == 'build') && (!tool_events.contextmenu || tool_events.contextmenu < 2) && walls.db.length > 0
		&& !$(".planner_ui_guide.center.active:not(#planner_ui_guide_menu)").length && items.db.length < 1) {
		$("#planner_ui_guide_menu").addClass("active");
	} else if ($("#planner_ui_guide_menu").hasClass("active")) {
		$("#planner_ui_guide_menu").removeClass("active");
	}
	
	if (plan == 'furniture' && tool == 'none' && items.db.length > 0
		&& !$(".planner_ui_guide.center.active:not(#planner_ui_guide_menu_furniture)").length && items.db.length < 2) {
		$("#planner_ui_guide_menu_furniture").addClass("active");
	} else if ($("#planner_ui_guide_menu_furniture").hasClass("active")) {
		$("#planner_ui_guide_menu_furniture").removeClass("active");
	}
	
	if (plan == 'init' && (tool == 'none' || walls.db.length > 1) && (!tool_events.canvas_zoom || tool_events.canvas_zoom < 3) && items.db.length < 3) {
		$("#planner_ui_guide_zoom").addClass("active");
	} else if ($("#planner_ui_guide_zoom").hasClass("active")) {
		$("#planner_ui_guide_zoom").removeClass("active");
	}
}

function planner_ui_close_guestures() {
	attempts_count = getCookie('guestures_guide_close_counter');
	if (!attempts_count) {
		attempts_count = 0;
	} else {
		attempts_count = parseInt(attempts_count);
	}
		
	var expdate = new Date();
	expdate.setTime(expdate.getTime() + (3600*24*30*1000));
	setCookie('guestures_guide_close_counter', attempts_count+1, expdate, '/');
	
	var expdate = new Date();
	if (attempts_count > 1) {
		expdate.setTime(expdate.getTime() + (3600*24*30*1000));
		setCookie('guestures_guide_closed', '1', expdate, '/');
	}
	
	$("#planner_ui_guide_guestures").remove();
}

function focus_file_input() {
	$("#footer_bar .footer_bar_tip_close").click();
	$("#file-input").click();
}

function clear_background_mode() {
	$("#canvas_v2_wrapper").removeClass("background_mode_active");
	$("#canvas_v2_wrapper").removeClass("background_mode");
	background_image_loaded = false;
	console.log('background_image_loaded false');
	project.background.fire('delete');
	scale_recognition_rect_tool.fire('delete');
	scale_recognition_line_tool.fire('delete');
	if (plan === "init" || plan === "break") {
		rooms1.create();
		console.log('rooms1.create');
	} else {
		rooms2.create();
		console.log('rooms2.create');
	}
	$("#planner_ui_direct").removeClass("hidden");
	$("#planner_ui_guide_clear_background").removeClass("active");
	close_help_window();
}

function change_background_mode() {

	let button = $("#planner_ui_guide_clear_background .show_hide_image");
	let status = button.attr('data-show');

	if (status == 1) {
		background_image_loaded = false;
		button.attr('data-show', 0);
		button.text(l10n.show);
		project.background.hide();
	} else {
		background_image_loaded = true;
		button.attr('data-show', 1);
		button.text(l10n.hide);
		project.background.show();
	}

	if (plan === "init" || plan === "break") {
		rooms1.create();
	} else {
		rooms2.create();
	}
}

function background_mode_signal() {
	object_id = $("body").attr("data-object-id");
	$.ajax({
		url: '/setup/api/signal/',
	    cache: false,
	    dataType : "html",
	    timeout: 10000,
	    data: "object_id="+object_id+"&ind=background_mode",
	    success: function (data, textStatus) {	
			console.log(data);
		},
		error: function (data, textStatus) {
		   	console.log(data);
		},
		type : "POST"
	});
}

$(window).resize(function() {
	if (!$("body").hasClass("resizing")) {
		$("body").addClass("resizing");
		setTimeout(function() {
			init_navi_bar();
			planner_direct_size();
			$("body").removeClass("resizing");
		}, 500);
	}
});

function stopPrntScr() {
	console.log('stopPrntScr');
	var inpFld = document.createElement("input");
	inpFld.setAttribute("value", ".");
	inpFld.setAttribute("width", "0");
	inpFld.style.height = "0px";
	inpFld.style.width = "0px";
	inpFld.style.border = "0px";
	document.body.appendChild(inpFld);
	inpFld.select();
	document.execCommand("copy");
	inpFld.remove(inpFld);
}

function open_actionmenu(id) {
	var menu_item = $(".planner_actionmenu#"+id);
	if (!menu_item.length) {
		return false;
	}
	$(".planner_actionmenu").removeClass("expandUp");
	offset_top = parseInt(menu_item.outerHeight()/2)+30;
	offset_left = parseInt(menu_item.outerWidth()/2);
	console.log(offset_left);
	menu_item.css("margin-top", "-"+offset_top+"px");
	menu_item.css("margin-left", "-"+offset_left+"px");
	menu_item.addClass("expandUp");
}

function close_actionmenu() {
	$(".planner_actionmenu").removeClass("expandUp");
}

function set_extended_toolset(id) {
	$("#planner_ui_tools_scroller > .tools_item.is_extended").addClass("hidden");
	$("#planner_ui_tools_scroller > .tools_item.is_extended.extended"+id).removeClass("hidden");
	$("#extended_tools_modal_items .extended_tools_modal_item").removeClass("active");
	$("#extended_tools_modal_items .extended_tools_modal_item.item"+id).addClass("active");
	setTimeout(function() {
		$("#planner_ui_tools_scroller > .tools_item.is_extended.extended"+id).trigger("click");
	}, 200);
	close_v2_modal();
	var expdate = new Date();
	expdate.setTime(expdate.getTime() + (3600*24*30*1000));
	setCookie('extended_toolset', id, expdate, '/');
}

$(window).keyup(function(e) {
	if (e.keyCode == 44) {
		if (!$("body").hasClass("admin_interface") && !$("#planner_ui_functions .pro").hasClass("is_pro")) {
			$("#canvas_v2_wrapper").append("<div id='blur_fog'><span>"+l10n.interface_protection+"</span></div>");
			navigator.clipboard.writeText(l10n.interface_screenshot);
			stopPrntScr();
			
			setTimeout(function() {
				try {
	                console.log('clipboardData');
					window.clipboardData.setData('text', l10n.interface_screenshot);
	            } catch (err) {}
            }, 100);
            
			console.log('screenshot!');
			setTimeout(function() {
				$("#blur_fog").remove();
			}, 500);
		}
	}
}); 

$(window).focus(function() {
	if (!$("body").hasClass("admin_interface") && !$("#planner_ui_functions .pro").hasClass("is_pro")) {
		$("#blur_fog").remove();
	}
}).blur(function() {
	if (!$("body").hasClass("admin_interface") && !$("#planner_ui_functions .pro").hasClass("is_pro")) {
		$("#canvas_v2_wrapper").append("<div id='blur_fog'><span>"+l10n.interface_protection+".</span></div>");
	}
});

$(function() {
	
	init_navi_bar();
	
	$("#cancel_mobile_view").click(function(e) {
		$("#footer_mobile_warning").remove();
		$("#container").addClass("mobile_canceled");
	});
	
	$("#save_v2_plan, #planner_ui_save_alert").click(function(e) {
		
		if ($("#canvas").length && !$("#save_v2_plan").hasClass("loading")) {
			$("#fog").show();
			sleep(100).then(function() {
				project.save(false, 2, l10n.interface_saving);
			});
		}
	});
	
	$(".planner_ui_guide .planner_ui_guide_close").click(function(e) {
		$(this).parent(".planner_ui_guide").remove();
	});
	$("#eraser").click(function(e) {
		$("#eraser_guide").remove();
	});
	
	$(".planner_ui_guide .planner_ui_guide_button").click(function(e) {
		$(this).parent(".planner_ui_guide").remove();
	});
			
	$(document).on('click', '#canvas', function(e) {
		$("#save_v2_plan").removeClass("active").removeClass("loading");
	});
		
	$('#canvas input.numeric').on('input', function() {
		var current = this.value;
		current = current.replace(/[,?\/]/g, '.');
		this.value = current.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
		if ($(this).attr('id') == 'wall_length_input') {
			if (this.value > 999) {
				$("#wall_mm_alert").addClass("expandOpenNew");
			} else {
				$("#wall_mm_alert").removeClass("expandOpenNew");
			}
		}
	});

//wall_length_input

	$("#canvas .planner_help_window_title").click(function(e) {
		var parent = $(this).parents(".planner_help_window_wrapper");
		if (parent.hasClass("compact"))
		{
			parent.removeClass("compact");
			delCookie('compact_init_instructions');
		}
		else
		{
			parent.addClass("compact");
			var expdate = new Date();
			expdate.setTime(expdate.getTime() + (60*60*1000));
			setCookie('compact_init_instructions', 1, expdate, '/');
		}
	});
	
	$("#footer_bar_tools .footer_bar_tool").mouseenter(function(e) {
		$(this).children(".footer_bar_comment").addClass("expandOpen");
	}).mouseleave(function(e) {
		$(this).children(".footer_bar_comment").removeClass("expandOpen");
	});
		
	$("#footer_bar_tools .footer_bar_tool a").click(function(e) {
		$("#footer_bar_tools .footer_bar_tool").removeClass("active");
		if (!$(this).parent(".footer_bar_tool").hasClass("is_fast")) $(this).parent(".footer_bar_tool").addClass("active");
		close_footer_bar();
	});

	$("#footer_bar_tools .footer_bar_tool.switch").click(function(e) {
		$("#footer_bar_tools .footer_bar_tool").removeClass("active");
		close_footer_bar();
	});

	$("#footer_bar .footer_bar_tip_close").click(function(e) {
		if ($(this).hasClass("close")) {
			$("#footer_bar_tools .footer_bar_tool").removeClass("active");
			$(".footer_bar_tip_wrapper").removeClass("visible");
		}
		else {
			$(this).parent(".footer_bar_tip_wrapper").remove();
		}
	});

	var ui_hover_timeout = null;
	$("#planner_ui_tools_wrapper").mouseenter(function(e) {
		clearTimeout(ui_hover_timeout);
		var width = parseInt($("#planner_ui_tools").outerWidth());
		$(this).css("width", width+"px");
		$("#planner_ui_tools_wrapper .planner_ui_subtools").css("left", width+"px");
		$(this).addClass("active");
		if ($("#planner_ui_tools .tools_item.has_subtools.active").length) {
			open_subtools_wrapper($("#planner_ui_tools .tools_item.has_subtools.active").attr("data-target"));
		}
	}).mouseleave(function(e) {
		ui_hover_timeout = setTimeout(function() {
			$("#planner_ui_tools_wrapper").css("width", "40px");
			$("#planner_ui_guide_scroll_menu").removeClass("active");
			$("#planner_ui_tools_wrapper").removeClass("active");
		}, 500);
	});

	$("#planner_ui_help_select > a").click(function(e) {
		$("#planner_ui_help_options").addClass("slideFastUp");
	});

	$(document).on('click', '#groups_navi_wrapper .groups_navi_item', function(e) {
		$("#planner_header").removeClass("open");
		var plan = $(this).attr("data-plan");
		var href = $(this).attr("href");
		if (href) return true;
		return change_group(plan);
	});

	$("#set_autosave").click(function(e) {
		if ($("#set_autosave_switch").hasClass("active")) {
			$("#set_autosave_switch").removeClass("active");
			setCookie('planner_autosave', 'off', false, '/');
		} else {
			$("#set_autosave_switch").addClass("active");
			setCookie('planner_autosave', 'on', false, '/');
		}
	});
	var autosave = getCookie('planner_autosave');
	if (autosave == 'off') {
		$("#set_autosave_switch").removeClass("active");
	} else if (autosave == 'on') {
		$("#set_autosave_switch").addClass("active");
	}
	
	secondsSinceLastActivity = 0;
	function activity(){
		if (secondsSinceLastActivity > 1800) {
			console.log(secondsSinceLastActivity);
			if ($("#set_autosave_switch").length && $("#set_autosave_switch").hasClass("active")) {
				window.disable_autosave = true;
			}
		}
		secondsSinceLastActivity = 0;
	}
	
	activityEvents = ['mousemove'];
	activityEvents.forEach(function(eventName) {
		document.addEventListener(eventName, activity, true);
	});
	
	setInterval(function(){
		planner_guide_show();
		if (walls.db && walls.db.length > 20 && window.seconds_since_last_save == 300 && !$("#save_v2_plan").hasClass("guest_mode")){
			$("#save_v2_plan").addClass("alert");
		}
		secondsSinceLastActivity++;
		window.seconds_since_last_save++;
	}, 1000);
	
	$(document).on('click', '#planner_ui_tools_wrapper .tools_item, #planner_ui_admin .tools_item, #planner_ui_tools_wrapper .subtools_item', function(e) {
		
		if ($(this).hasClass("is_pro") && !$(this).hasClass("group") && !$(this).hasClass("root_group")) {
			console.log('is_pro');
			load_v2_modal_from_id('pro_tools_modal');
			return false;
		}
		
		if (walls.db && !$(this).hasClass("group")) {
			var save_limit = walls.db.length*2;
			if (walls.db.length >= 45) save_limit = save_limit * 5;
			else if (walls.db.length >= 30) save_limit = save_limit * 3;
			else if (walls.db.length >= 15) save_limit = save_limit * 2;
			
			//console.log(window.seconds_since_last_save+" = "+save_limit+" | "+walls.db.length);
			if (window.seconds_since_last_save > save_limit && !$(this).hasClass("has_subtools") && tool_events.tool_selection > 9
				&& save_limit > 0 && window.seconds_since_last_save > 60 && !$("#save_v2_plan").hasClass("guest_mode")) {
				if ($(".footer_bar_tool.autosave").hasClass("hidden") || $("#set_autosave_switch").hasClass("active")) {
					window.seconds_since_last_save = 0;
					console.log('auto');
					if (window.disable_autosave === true) {
						window.disable_autosave = false;
					} else {
						$("#fog").show();
						tool_events.tool_selection = -1;
						sleep(100).then(function() {
							project.save(false, false, l10n.interface_autosaving);
						});
					}
				}
			}
		}
		
		tool_events.tool_selection++;
		close_footer_bar();
		
		if ($(this).hasClass("tools_item") || $(this).hasClass("subtools_item")) 
		{
			if ($(this).hasClass("group")) {
				$(this).parent(".subtools_group").toggleClass("active");
				$(this).parent(".subtools_group").siblings(".subtools_group").removeClass("active");
				set_subtools_width();
				$(".scroller").slimScroll({ scrollTo: $(this).parent(".subtools_group").position().top+'px' });
				return false;
			}
			
			$(this).addClass("active");

			$("#planner_ui_guide_scroll_menu").removeClass("active");
			$(".planner_ui_subtools").removeClass("active");
			$("#planner_ui_tools_wrapper").css("width", "40px");
			$("#planner_ui_tools_wrapper").removeClass("active");

			if ($(this).attr("data-params") && $("#options_preset_"+$(this).attr("data-params")).length) {
				$("#options_preset_"+$(this).attr("data-params")).addClass("slideFastLeft");
			}

			if ($(this).attr("data-track") && $("#planner_custom_track_"+$(this).attr("data-track")).length)
			{
				$("#planner_custom_track_"+$(this).attr("data-track")).addClass("slideUp");
			}
		}
		
		if ($(this).hasClass("has_subtools") && $(this).attr("data-target")) {
			deactivate_current_tool_menuitem();
			$(this).addClass("active");
			open_subtools_wrapper($(this).attr("data-target"));
		}
	});
	
	tools_item_about_hover_timeout = null;
	$(document).on('mouseenter', '.tools_item_about', function(e) {
		this_item = $(this);
		tools_item_about_hover_timeout = setTimeout(function() {
		    var content = this_item.attr("data-text");
		    var image = this_item.attr("data-image");
		    if (content) {
				$("#planner_ui_tools_tooltip_content").text(content);
			} else {
				$("#planner_ui_tools_tooltip_content").html("<img src='"+image+"' /><span class='preloader'></span>");
			}
		    var pageX = this_item.offset().left + 22;
			var pageY = this_item.offset().top - $("#planner_container").offset().top - 9;
			$("#planner_ui_tools_tooltip").css("left", pageX).css("top", pageY);
			$("#planner_ui_tools_tooltip").addClass("slideFastDown");
		}, 200);
		
	}).on('mouseleave', '.tools_item_about, #planner_ui_tools_wrapper', function(e) {
		
		clearTimeout(tools_item_about_hover_timeout);
		$("#planner_ui_tools_tooltip_content").text("");
		$("#planner_ui_tools_tooltip").removeClass("slideFastDown");
			
	});

});

