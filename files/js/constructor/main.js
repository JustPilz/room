function show_modal(id, overlay) 
{
	if (!overlay) overlay = true;
	$("#planner_ui_options").removeClass("active");
	$(".options_preset").removeClass("slideFastLeft");
	$("#planner_notification_wrapper").remove();
	var source = $("#modal_source_"+id);
	if (!source.length) return false;
	
	if ($("#modal_container").length)
	{
		close_modal(true);
		setTimeout(function(){
			show_modal(id);
		}, 500);
		return false;
	}
	
	close_help();
	var title = source.attr("title");
	var width = source.attr("data-width");
	var id = source.attr("data-class");
	var body = source.html();
	var close_code = '';
	var exit_code = '';
	if (!source.hasClass("no_button")) var close_code = "<span onclick='close_modal();' class='modal_close'></span>";
	if (!source.hasClass("no_close")) var exit_code = "<div id='modal_close'></div>";
	
	$("#planner_container").addClass("modal");
	if (overlay) $("#canvas_wrapper").addClass("overlay");
	$("#canvas_wrapper").append(exit_code+"<div id='modal_container'><div id='modal_wrapper'><div id='modal_title'>"+title+"</div><div id='modal_body'>"+body+"</div>"+close_code+"</div><div id='modal_block'></div></div>");
	$("#modal_wrapper").addClass("slideUp");
	
	if (id) $("#modal_wrapper").addClass(id);
	if (width > 0) $("#modal_wrapper").css("width", width+"px");
	if (width > 0) $("#modal_wrapper").css("margin-left", "-"+parseInt(width/2)+"px");
	var max_height = $("#canvas_wrapper").outerHeight();
	$("#modal_wrapper").css("max-height", max_height+"px");
	var height = $("#modal_wrapper").outerHeight();
	$("#modal_block").css("height", height+"px");
	height = parseInt(height/2);
	$("#modal_wrapper").css("margin-top", "-"+height+"px");
	setTimeout(function(){
		$("#modal_container").css("overflow", "auto");
	}, 500);
}

function close_modal(overlay) 
{
	if (!overlay) overlay = false;
	
	if (!$("#modal_container").length) return false;
	$("#modal_container").css("overflow", "hidden");
	$("#modal_wrapper, #modal_close").addClass("hidden");
	setTimeout(function(){
		if (!overlay && $("#planner_container").hasClass("show_start_page")) show_start_help();
		if (!overlay) $("#canvas_wrapper").removeClass("overlay");
		$("#modal_container").remove();
		$("#modal_close").remove();
		if (!overlay) $("#planner_container").removeClass("modal");
	}, 300);
}

function close_options() 
{
	$("#options_modal").remove();
}

function trigger_navi() 
{
	if ($("#container").hasClass("banners"))
	{
		$("#container").removeClass("banners");
	}
	else
	{
		$("#container").addClass("banners");
	}
}

function close_help() 
{
	$("#help_label").removeClass("hidden");
	$("#help_wrapper").removeClass("active");
	$("#jivo_custom_widget").removeClass("hide");
}

function open_help() 
{
	if ($("#planner_container").hasClass("show_start_page")) return show_start_help();
	close_modal();
	$("#help_label").addClass("hidden");
	$("#help_wrapper").addClass("active");
	$("#jivo_custom_widget").addClass("hide");
}

function notificate_help() 
{
	var title = 'Подсказка';
	var text = 'Изменяйте масштаб проекта, используя колесо мыши. Передвигайтесь по холсту, удерживая зажатой на пустом месте кнопку мыши.';
	notificate(text, title, 12, false, 3);
}

function isIE () 
{
	var myNav = navigator.userAgent.toLowerCase();
	return (myNav.indexOf('msie') != -1) ? parseInt(myNav.split('msie')[1]) : false;
}

function init_navi_bar() {
	if ($("#planner_ui_functions").length) {
		var margin_left = parseInt($("#planner_ui_functions").outerWidth());
		$("#planner_header").css("left", margin_left+"px");
	}
	if ($("#planner_header").css("z-index") == '100001') {
		$("#planner_header").removeAttr("style");
		return false; 
	}
	
	var current = $("#groups_navi .groups_navi_item.active");
	var wrapper = $("#groups_navi");
	if (!wrapper.length) return false; 
	if (!current.length) init_active_tools();
	var current = $("#groups_navi .groups_navi_item.active");
	var window_width = $("#groups_navi_wrapper").width();
	
	if (current.length && (current.offset().left) > window_width*0.80)
	{
		var half = window_width/2 - current.outerWidth()/2;
		var left_offset = parseInt(half - current.position().left);
		var max_offset = window_width - (wrapper.width()-0);
		if (max_offset > left_offset-100) left_offset = max_offset;
		if (left_offset > 0) left_offset = 0;
		wrapper.css("left", left_offset+"px");
	}
	
	if (current.length && (current.offset().left) < window_width*0.80)
	{
		var half = window_width/2 - current.outerWidth()/2;
		var left_offset = parseInt(half - current.position().left);
		if (left_offset > -100) left_offset = 0;
		wrapper.css("left", left_offset+"px");
	}
	
	setTimeout(function(){
		init_navi_arrows();
	}, 300); 
	
	check_tools_placement();
}

function navi_next() 
{
	var wrapper = $("#groups_navi");
	var window_width = $("#groups_navi_wrapper").width();
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
	var window_width = $("#groups_navi_wrapper").width();
	var left_offset = wrapper.position().left + parseInt(window_width/2);
	if (left_offset > -100) left_offset = 0;
	wrapper.css("left", left_offset+"px");
	setTimeout(function(){
		init_navi_arrows();
	}, 300); 
}

function init_navi_arrows(terminate) 
{
	if (!terminate) terminate = false;
	
	if (!$("#groups_navi_wrapper").length) return false; 
	var window_width = $("#groups_navi_wrapper").width();
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

function init_active_tools() 
{
	var first_item = $("#groups_navi_wrapper .groups_navi_item").eq(0);
	var active_item = $("#groups_navi_wrapper .groups_navi_item.active");
	if (!$("body").hasClass("is_planner")) return false;
	
	if (!active_item.length) 
	{
		var current_cookie = getCookie('active_plan_name');
		if (current_cookie)
		{
			if (!is_group_locked(current_cookie))
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

function notificate(text, header, period, modal, timeout) 
{
	if (!text) return false;

	if (!header) header = 'Системное уведомление';
	if (!period) period = 7;
	if (!modal) modal = false;
	if (!timeout) timeout = 0;
	
	if ($("#planner_notification_wrapper").length) $("#planner_notification_wrapper").remove();
	
	var add_class = modal ? ' modal' : '';

	setTimeout(function(){
		$("#planner_container").append("<div id='planner_notification_wrapper' data-modal='"+modal+"' class='expandUp"+add_class+"'><span>"+header+"</span><div id='planner_notification'>"+text+"</div></div>");
		setTimeout(function(){
			$("#planner_notification_wrapper").addClass("hidden");
			setTimeout(function(){
				$("#planner_notification_wrapper").remove();
			}, 500);
		}, period*1000);
	}, timeout*1000);
}

function click_on_navi_group_from_cookie() {
	var name = getCookie('active_plan_name');
	if (name)
		click_on_navi_group(name);
}

function click_on_navi_group(name) {
	$("#groups_navi_wrapper .groups_navi_item[data-plan='"+name+"']").click();	
}

function lock_groups(lockname, value) {
	var groups = $("#groups_navi_wrapper .groups_navi_item[data-lock='" + lockname + "']");
	if (value)
		groups.addClass('locked');
	else
		groups.removeClass('locked');
}

function is_group_locked(name) {
	return $("#groups_navi_wrapper .groups_navi_item[data-plan='" + name + "']").hasClass("locked");	
}

function warning(text, header, type) {
	if (!type) type = 'red';
	if (!text) return false;
	if (!header) header = 'Системное уведомление';
	
	if ($("#planner_notification_wrapper").length) $("#planner_notification_wrapper").remove();
	
	setTimeout(function(){
		$("#planner_container").append("<div id='planner_notification_wrapper' class='expandUp "+type+"'><span>"+header+"</span><div id='planner_notification'>"+text+"</div></div>");
		setTimeout(function(){
			$("#planner_notification_wrapper").addClass("hidden");
			setTimeout(function(){
				$("#planner_notification_wrapper").remove();
			}, 500);
		}, 30*1000);
	}, 1000);
}

function set_unnamed_rooms_count(count) 
{
	$("#smeta_price_value").attr("data-unnamed", count);
}

function change_group(name, hidden) 
{	
	if ($("#planner_container").hasClass("plan_change")) return false;
	var item = $("#groups_navi_wrapper .groups_navi_item[data-plan='"+name+"']");	
	var lock = item.attr("data-lock");
	var object_id = $("#canvas_wrapper").attr("data-object-id");
	if (!item.length) return false;
	
	if ($("#planner_container").hasClass("show_lock_screen")) 
		return show_modal('exclusive_lock');
				
	var expdate = new Date();
	expdate.setTime(expdate.getTime() + (30*24*60*60*1000));
	if (!item.hasClass("locked")) setCookie('active_plan_name', name, expdate, '/');
	
	if (!object_id && !hidden) 
	{
		window.location.href = "/planner/";
		return false;
	}
	
	if (!$("#planner_container").attr("data-oid")) return false;
	
	$(".autoclose_on_plan_change").removeClass('active');
	$("#groups_subnavi").removeClass("opened");
	$("#groups_subnavi").removeClass("slideFastUp");
	$("#planner_ui_options").removeClass("active");
	$(".options_preset").removeClass("slideFastLeft");
	$("#pro_expire_text").removeClass("hidden");
	if ($("#planner_notification_wrapper").length) $("#planner_notification_wrapper").remove();
	
	if (item.attr("id") != 'more_groups' && !hidden)
	{
		if ($("#planner_container").hasClass("show_start_page"))
			return show_start_help();
		else
		{
			if (!$("#planner_chat").hasClass("expandUp")) $("#planner_chat").addClass("expandUp");
		}
	}
	
	if (item.hasClass("locked")) 
	{
		return show_modal('lock_'+lock);
	}
	
	$("#planner_container").addClass("plan_change");

	close_modal();
	close_planner_popup(true);
	
	var alert_plans = new Array('furniture', 'santeh', 'light', 'sockets');
	if (alert_plans.indexOf(name) != -1 && $("#smeta_price_value").attr("data-unnamed") > 0 && !$("#smeta_price").hasClass("trigger") && !MODIFIERS.admin)
	{
		//warning('Для корректного расчета сметы Вам необходимо заполнить план помещений!', 'Обратите внимание!');
	}
	
	if (item.hasClass("pro") && !getCookie('pro_warning') && !MODIFIERS.admin)
	{
		var expdate = new Date();
		expdate.setTime(expdate.getTime() + (30*24*60*60*1000));
		setCookie('pro_warning', 1, expdate, '/');
		warning('Заполнение данной группы листов требует определенных знаний о ремонте. Если Вы не уверены в корректности их заполнения, лучше оставить эти листы пустыми.', 'Группа сложных технологических листов!', 'orange');
	}
	
	if (name != 'init' && !getCookie('contract_modal_closed') && !MODIFIERS.admin && !$("#smeta_price_wrapper").hasClass("visited") && $("#open_contract_modal").hasClass("visible"))
	{
		setTimeout(function() {
			$("#open_contract_modal").addClass("active");
		}, 2000);
	}
	
	$("#groups_navi_wrapper .groups_navi_item").removeClass("active");
	item.addClass("active");
	$(".tools_item").removeClass("active");
	$(".tools_item").removeClass("show");
	$(".tools_item.show_on_" + name).addClass("show");
	
	$(".filter_plan_item").addClass("hidden");
	$(".filter_plan_item.show_on_"+name).removeClass("hidden");
	
	$(".calc_smeta_widget").removeClass("active").removeClass("hidden");
	if ($(".calc_smeta_widget." + name).length)
	{
		var calc_value = parseInt($(".calc_smeta_widget." + name + " .calc_smeta_widget_value span").text());
		if (calc_value == 0) $(".calc_smeta_widget." + name).addClass("hidden");
		$(".calc_smeta_widget." + name).addClass("active");
	}
	
	$("#planner_ui_help .planner_ui_help_adbanner").removeClass("active");
	$("#planner_ui_help .planner_ui_help_adbanner.show_on_"+name).addClass("active");
	
	$(".planner_ui_video").removeClass("active");
	$(".planner_ui_video.show_on_"+name).addClass("active");
	
	init_navi_bar();
	ui_open_help(name);
	show_tracker(name);
	
	setTimeout(function() {
		$("#planner_container").removeClass("plan_change");
	}, 500);
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

function force_planner_track(ind) 
{
	if (!ind) return false;
	if ($("#planner_ui_tracker .planner_ui_track."+ind).length)
	{
		$("#planner_ui_tracker .planner_ui_track").removeClass("slideUp");
		$("#planner_ui_tracker .planner_ui_track."+ind).addClass("slideUp");
	}
}

function remove_planner_track(ind) 
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

function make_smeta_visible() 
{
	if (getCookie('active_plan_name') && getCookie('active_plan_name') != 'init')
	{
		$("#open_contract_modal").addClass("visible");
		$("#smeta_navi_item").addClass("visible");
	}
}

function start_wall(skip_help) 
{
	if ($("#start_page").hasClass("blocked")) return false;
	$("#start_page").addClass("blocked");
	$("#start_page .help_block").addClass("desize");
	var from_left = $("#start_page").outerWidth();
	var from_top = $("#start_page").outerHeight()+100;
	$("#start_page .block1, #start_page .block2, #start_page .block3").css("left", from_left+"px");
	$("#start_page .block4, #start_page .block5").css("right", "80px");
	$("#start_page .help_block").css("top", from_top+"px");
	$("#start_page_overlay .pre_button").fadeOut(0);
	setTimeout(function() {
		$("#start_page_overlay").remove();
		$("#start_page").remove();
	}, 500);
}

function show_start_help() 
{
	$("#planner_container").removeClass("show_start_page");
	close_modal();
	$("#start_page").addClass("active");
	setTimeout(function() { $("#start_page .block1").addClass("slideFastUp"); }, 100);
	setTimeout(function() { $("#start_page .block2").addClass("slideFastUp"); }, 200);
	setTimeout(function() { $("#start_page .block3").addClass("slideFastUp"); }, 300);
	setTimeout(function() { $("#start_page .block4").addClass("slideFastUp"); }, 400);
	setTimeout(function() { $("#start_page .block5").addClass("slideFastUp"); }, 500);
	setTimeout(function() { 
		$("#start_page_overlay .pre_button").addClass("slideFastUp"); 
		$("#start_page_overlay").addClass("active");
	}, 500);
}

function deactivate_current_tool_menuitem(toolname) 
{
	if (!toolname) $(".tools_item.active").removeClass('active');
	$("#planner_ui_options").removeClass("active");
	$(".options_preset").removeClass("slideFastLeft");
	$(".planner_custom_track").removeClass("slideUp");
}

function display_error_counts(errors_by_plan) {
	$("#groups_navi .groups_navi_item").each(function() {
		var span = $(this).find('.navi_error');
		if (!span.length) 
			return;

		var name = $(this).attr('data-plan');
		var count = errors_by_plan[name];

		span.html(count);
		if (count > 0)
			span.addClass('show');
		else
			span.removeClass('show');
	});
}

function update_tool_access(exclusive_lock) {
	if (!$("#canvas_wrapper").length) return false;
	$("#current_tools .tools_item, #common_tools .tools_item, #planner_ui_admin .tools_item").each(function() {
		var forbidden = false;
		
		if (MODIFIERS.admin) {
			if (!exclusive_lock && $(this).attr('data-admin-show') != 'true')
				forbidden = true;
		} else {
			if ($(this).attr('data-user-show') == 'false')
				forbidden = true;	
		}
		
		if (forbidden)
			$(this).addClass('forbidden');
		else
			$(this).removeClass('forbidden');
	});
	
	var exclusive_mode_tools_item = $('#tools_item_lock');
	exclusive_mode_tools_item.html(exclusive_mode_tools_item.attr(exclusive_lock ? "data-stop-text" : "data-start-text"));
	if (exclusive_lock) 
	{
		if (MODIFIERS.admin) $("#planner_ui_tools_wrapper").removeClass("hidden");
		exclusive_mode_tools_item.addClass("active");
	}
	else
	{
		if (MODIFIERS.admin) $("#planner_ui_tools_wrapper").addClass("hidden");
		exclusive_mode_tools_item.removeClass("active");
	}
	
	if (!MODIFIERS.admin) {
		if (exclusive_lock)
			$("#planner_container").addClass("show_lock_screen")
		else
			$("#planner_container").removeClass("show_lock_screen")
	}
	
	click_on_navi_group_from_cookie();
}

function display_plan_cost(new_value, ind) 
{
	var new_value = parseInt(new_value);
	var parent = $(".calc_smeta_widget." + ind);
	var item = $(".calc_smeta_widget." + ind + " .calc_smeta_widget_value span");
	
	if (parent.length)
	{
		var old_value = parseInt(item.text());
		if (new_value == 0 || !parent.hasClass("active"))
		{
			item.text(new_value);
			parent.addClass("hidden");
		}
		else
		{
			if (parent.hasClass("active")) 
			{
				parent.removeClass("hidden");
			}
			
			$({numberValue: old_value}).animate({numberValue: new_value}, {
			    duration: 500,
			    easing: 'linear',
			    step: function () { 
			        item.text(Math.ceil(this.numberValue)); 
			    },
			    done: function () {
			        item.text(Math.ceil(this.numberValue));
			    }
			});
		}
	}
}

function display_total_cost(new_value, rate, width) 
{
	if ($("#calc_widget_cost_value strong").length)
	{
		var old_value = parseInt($("#calc_widget_cost_value strong").text());
		if (old_value == 0 && new_value > 0)
		{
			return calc_widget_request('first_price', 'static');
		}
		else
		{
			$({numberValue: old_value}).animate({numberValue: parseInt(new_value)}, {
			    duration: 500,
			    easing: 'linear',
			    step: function () { 
			        $('#calc_widget_cost_value strong').text(Math.ceil(this.numberValue)); 
			    },
			    done: function () {
			        $('#calc_widget_cost_value strong').text(Math.ceil(this.numberValue));
			    }
			});
			
			var old_value = parseInt($("#calc_widget_rate b span").text());
			$({numberValue: old_value}).animate({numberValue: parseInt(rate)}, {
			    duration: 500,
			    easing: 'linear',
			    step: function () { 
			        $('#calc_widget_rate b span').text(Math.ceil(this.numberValue)); 
			    },
			    done: function () {
			        $('#calc_widget_rate b span').text(Math.ceil(this.numberValue));
			    }
			});
			$("#calc_widget_rate_line span").css("width", width+"%");
		}
	}
}

function initialize_page_ui(firsttime) {
	if (firsttime) {
		click_on_navi_group('init');
		$("#planner_ui_tools .tools_item[data-tool='walls']:first").trigger('click');
		//alert(1);
		if ($("#planner_container").attr("data-oid")) welcome.show();
	} else {
		click_on_navi_group_from_cookie();
		
		if ($("#start_print_trigger").length)
		{
			PRINT.print();
			$("#start_print_trigger").remove();
		}
	}
}

function block_window_close() 
{
	$("#block_window_wrapper, .block_window_wrapper").removeClass("slideUp");
}

function show_save_hint() 
{
	$("#object_save_hint").addClass("slideUp");
}

function close_save_hint() 
{
	$("#object_save_hint").removeClass("slideUp");
}

function show_save_alert() 
{
	if ($("#not_saved_alert").length)
	{
		$("#not_saved_alert").addClass("expandUp");
		$("#planner_save").addClass("pulse");
	}
}

function close_save_alert() 
{
	$("#not_saved_alert").remove();
	$("#planner_save").removeClass("pulse");
}

function open_planner_popup(id) 
{	
	var source = $("#"+id);
	var content = $("#"+id+" .planner_popup_content");
	if (!source.length) return false;
	
	if ($("#planner_popup_overlay.active").length)
	{
		close_planner_popup();
		setTimeout(function(){
			open_planner_popup(id);
		}, 500);
		return false;
	}
	$("#planner_popup_overlay").addClass("active");
	source.addClass("slideUp");
	set_planner_popup_position(id);
}

function set_planner_popup_position(id) 
{
	var source = $("#"+id);
	var content = $("#"+id+" .planner_popup_content");
	var common_header = parseInt($("#header_v3").outerHeight()) + parseInt($("#planner_header_wrapper").outerHeight()) + 1;
	var planner_header = 0;
	var common_footer = 0;
	var base_height = 0;
	var diff = source.outerHeight() - content.outerHeight();
	var width = source.outerWidth();
	if (width > 0) source.css("margin-left", "-"+parseInt(width/2)+"px");
	var max_height = $(window).height() - diff - common_header - planner_header - common_footer - 62;
	content.css("max-height", max_height+"px");
	var height = source.outerHeight();
	var layout = common_header + planner_header - common_footer;
	$("#tracker_wrapper").addClass("moveaway");
	$("#tools_wrapper").addClass("moveaway");
	source.css("margin-top", "-"+(parseInt(height/2)-parseInt(layout/2)+20)+"px");
}

function close_planner_popup(is_overlay) 
{
	if ($("#planner_objects_pro_expired").length)
	{
		set_planner_popup_position("planner_objects_pro_expired");
		$("#planner_objects_pro_expired").addClass("active");
		$("#planner_objects_pro_expired").addClass("slideUp");
		return false;
	}
	if ($(".planner_popup_wrapper.slideUp").hasClass("block") && is_overlay) return false;
	$("#planner_popup_overlay").removeClass("active");
	$(".planner_popup_wrapper").removeClass("slideUp");
}

function open_order_sidebar() 
{
	if ($("#order_sidebar").length)
	{
		$("#tracker_wrapper").addClass("moveaway");
		$("#order_sidebar").addClass("active");
	}
}

function close_order_sidebar() 
{
	if ($("#order_sidebar").length)
	{
		$("#tracker_wrapper").removeClass("moveaway");
		$("#order_sidebar").removeClass("active");
		$("#order_sidebar").addClass("closed");
		$.ajax({
			url: '/planner/order/?add_signal=order_banner_close&die=1',
		    cache: false,
		    dataType : "html",
		    timeout: 5000,
		    data: false,
			type : "POST"
		});
	}
}

function set_scroller(element) 
{
	if (!$(element).length) return false;
	
	$(element).slimScroll({
		height: 'auto',
		railVisible: true,
		size: '5px',
		color: '#e68506',
		railColor: '#000',
		opacity: 1,
		railOpacity: 0.3,
		alwaysVisible: false
	});
}

function open_subtools_wrapper(target) 
{
	$(".planner_ui_subtools").removeClass("active");
	var wrapper = $(".planner_ui_subtools[data-parent='"+target+"']");
	if (!wrapper.length) return false;
		
	var width = parseInt($("#planner_ui_tools").outerWidth());
	var this_width = parseInt(wrapper.outerWidth());
		
	wrapper.css("left", width+"px");
	wrapper.addClass("active");
	$("#planner_ui_tools_wrapper").css("width", width+this_width+"px");
}

function ui_open_help(plan, button) 
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
	$("#planner_ui_tools_wrapper").removeClass("active");
}

function ui_open_designer_help(button) 
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
	$("#planner_ui_tools_wrapper").css("width", "40px");
	$("#planner_ui_tools_wrapper").removeClass("active");
}

function ui_close_help() 
{
	$("#planner_ui_help").removeClass("active");
}

function check_tools_placement() 
{
	if ($("#planner_ui_tools").length) {
		
		$("#planner_ui_tools_scroller").slimScroll({destroy: true});
		$(".scroller").slimScroll({destroy: true});
		
		$("#planner_ui_tools_scroller").css("max-height", "auto");
		$("#planner_ui_tools_scroller").css("height", "auto");
		
		var max_height = parseInt($("#canvas_wrapper").height()) - 80;
		var tools_height = parseInt($("#planner_ui_tools_scroller").outerHeight());
		
		if (tools_height >= max_height && !$("#planner_ui_tools_wrapper").hasClass("compact")) 
		{
			$("#planner_ui_tools_wrapper").addClass("compact");
		} 
		
		var max_height = parseInt($("#canvas_wrapper").height()) - 80;
		var tools_height = parseInt($("#planner_ui_tools_scroller").outerHeight());
		
		if (tools_height+90 < max_height) 
		{
			$("#planner_ui_tools_wrapper").removeClass("compact");
			var max_height = parseInt($("#canvas_wrapper").height()) - 90;
			var tools_height = parseInt($("#planner_ui_tools_scroller").outerHeight());
			if (tools_height >= max_height) {
				$("#planner_ui_tools_wrapper").addClass("compact");
			}
		}
		
		var max_height = parseInt($("#canvas_wrapper").height()) - 80;
		var tools_height = parseInt($("#planner_ui_tools_scroller").outerHeight());
		
		if (tools_height >= max_height) 
		{
			$("#planner_ui_tools_scroller").css("height", "auto");
			$("#planner_ui_tools_scroller").css("max-height", max_height+"px");
			set_scroller("#planner_ui_tools_scroller");
		}
		else
		{
			$("#planner_ui_tools_scroller").css("max-height", "10000px");
			$("#planner_ui_tools_scroller").css("height", "auto");
		}
				
		set_scroller(".scroller");
	}
}

function open_save_window(dir) 
{
	$("#planner_ui_save_error").removeClass("slideFastUp");
	$("#planner_ui_save_window").addClass("slideFastUp");
	$("#planner_ui_functions .planner_ui_function.save").addClass("active");
	$("#planner_ui_tools_wrapper").addClass("hidden");
	
	if (dir) {
		$("#planner_ui_save_window .planner_ui_filesystem").removeClass("active");
		$("#planner_ui_save_window ."+dir).addClass("active");
	}
	else if ($("#planner_ui_save_window .save").length) {
		$("#planner_ui_save_window .planner_ui_filesystem").removeClass("active");
		$("#planner_ui_save_window .save").addClass("active");
	}
	
}

function close_save_window() 
{
	$("#planner_ui_save_window").removeClass("slideFastUp");
	$("#planner_ui_functions .planner_ui_function.save").removeClass("active");
	$("#planner_ui_tools_wrapper").removeClass("hidden");
	$("#planner_ui_save_error").removeClass("slideFastUp");
	$("#planner_ui_save_window_message p").removeClass("active");
	if ($("#planner_ui_save_window").hasClass("extended")) $("#planner_ui_save_window").removeClass("saved");
}

function save_planner_object(object_id, email_require, title_require, type) 
{
	if (!object_id) return false;
	var title = $("#planner_ui_save_title"+type).val();
	var email = $("#planner_ui_save_email"+type).val();
	
	if (!title && title_require) return $("#planner_ui_save_title"+type).parent(".planner_ui_save_input").addClass("error");
	if ((!email || !validateEmail(email)) && email_require) return $("#planner_ui_save_email"+type).parent(".planner_ui_save_input").addClass("error");
	
	var varslist = 'save_object_id='+object_id+'&type='+type+'&email='+email+'&title='+encodeURIComponent(title);
	$("#planner_ui_save_window .planner_ui_save_input").removeClass("error");
	
	$.ajax({
		url: '/planner/save/',
	    cache: false,
	    dataType : "html",
	    timeout: 15000,
	    data: varslist,
	    success: function (data, textStatus) 
		{	
			console.log(1);
			if (data)
			{
				console.log(2);
				var json_data = $.parseJSON(data);
				if (json_data.error)
				{
					close_save_window();
					$("#planner_ui_save_error").addClass("slideFastUp");
					$("#planner_ui_save_error p").text(json_data.error);
					return false;
				}
				
				if (json_data.filename) $("#planner_ui_save_window_message p span").text(json_data.filename);
				$("#planner_ui_save_window_message p.type"+type).addClass("active");
	    	}
			$("#planner_ui_save_window").addClass("saved");
		},
	    beforeSend: function(){
	    	console.log(-1);
			$("#planner_ui_save_window").addClass("loading");
    	},
	   	complete: function(){
	   		console.log(3);
	    	$("#planner_ui_save_window").removeClass("loading");
	   	},
		type : "POST"
	});
}

function validateEmail(email) {
	var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	return re.test(email);
}

function planner_ui_setup(param, value) {
	if (param == 'save' && !validateEmail(value) && value != -1)
	{
		$("#planner_setup_email input").addClass("email_errored");
		return false;
	}
	
	if (param == 'estate_id' && value != 1) $("#planner_start_filters .planner_ui_setup_wrapper.jk").remove();
	
	if (value)
	{
		$.ajax({
			url: '/planner/',
		    cache: false,
		    dataType : "html",
		    timeout: 15000,
		    data: 'planner_setup='+param+"&value="+value,
		    success: function (data, textStatus) 
			{	
				console.log(data);
				$("#planner_start_filters .planner_ui_setup_wrapper."+param).remove();
				set_planner_popup_position("planner_start_filters");
				if (!$("#planner_start_filters .planner_ui_setup_wrapper").length) close_planner_popup();
			},
		    beforeSend: function(){
		    	$("#planner_start_filters .planner_popup_content").addClass("loading");
	    	},
		   	complete: function(){
		    	$("#planner_start_filters .planner_popup_content").removeClass("loading");
		   	},
			type : "POST"
		});
	}
}

function copyToClipboard() {
  var aux = document.createElement("input");
  aux.setAttribute("value", "Снимок экрана невозможен!");
  document.body.appendChild(aux);
  aux.select();
  document.execCommand("copy");
  document.body.removeChild(aux);
}

$(window).resize(function() 
{
	if (!$("#planner_container").hasClass("resizing"))
	{
		$("#planner_container").addClass("resizing");
		setTimeout(function() {
			init_navi_bar();
			$("#planner_container").removeClass("resizing");
		}, 500);
	}
    
});

$(window).keyup(function(e){
  if(e.keyCode == 44){
    if (!$("body").hasClass("admin_interface") && !$("#planner_ui_functions .pro").hasClass("is_pro")) copyToClipboard();
  }
}); 

$(window).focus(function() {
  if (!$("body").hasClass("admin_interface")) $("body").removeClass("blurred");
}).blur(function() {
  if (!$("body").hasClass("admin_interface")) $("body").addClass("blurred");
});

$(function() {
	
	init_navi_bar();
	update_tool_access();
	
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
			$("#planner_ui_tools_wrapper").removeClass("active");
		}, 500);
	});
	
	$("#planner_ui_help_select > a").click(function(e) {
		$("#planner_ui_help_options").addClass("slideFastUp");
	});
	
	$("#planner_ui_save_window .planner_ui_filesystem input").focus(function(e) {
		$(this).parent(".planner_ui_save_input").removeClass("error");
	});
		
	$(document).on('click', '#planner_ui_tools_wrapper .tools_item, #planner_ui_admin .tools_item, #planner_ui_tools_wrapper .subtools_item', function(e) { 
		if ($(this).attr("data-tool")) {
			
			if ($(this).hasClass("tools_item")) deactivate_current_tool_menuitem();
			
			$(this).addClass("active");
			
			$(".planner_ui_subtools").removeClass("active");
			$("#planner_ui_tools_wrapper").css("width", "40px");
			$("#planner_ui_tools_wrapper").removeClass("active");
			$("#planner_ui_options").removeClass("active");
			
			if ($(this).attr("data-params") && $("#options_preset_"+$(this).attr("data-params")).length)
			{
				$("#planner_ui_options").addClass("active");
				$("#options_preset_"+$(this).attr("data-params")).addClass("slideFastLeft");
				$("#pro_expire_text").addClass("hidden");
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
	
	if ($("#order_sidebar").length)
	{
		setTimeout(function() {
			open_order_sidebar();
		}, 5000);
	}
	
	if (message = parseInt(getCookie('planner_message')))
	{
		if (message == 1) notificate('Ваш проект успешно сохранен!');
		if (message == 2) notificate('Ваш проект успешно загружен!');
		if (message == 3) notificate('Ваш проект успешно отправлен на проверку!');
		if (message == 4) notificate('Ваше сообщение успешно отправлено!');
		if (message == 5) notificate('Ваши чертежи успешно отправлены проектировщику для расчета сметы!');
		
		delCookie('planner_message');
	}
	
	$(document).on('mouseenter', '#action_menu_wrappers .action_menu_item', function(e) {
	    
	    $("#planner_ui_tooltip").remove();
		var content = '<div id="planner_ui_tooltip_content">'+$(this).text()+'</div>';
		
	    $("body").append("<div id='planner_ui_tooltip'>"+content+"</div>");
			var modal_width = $("#planner_ui_tooltip").outerWidth();
		
		var object_width = $(this).outerWidth();
		var object_height = $(this).outerHeight();
		var pageX = $(this).offset().left;
		var pageY = $(this).offset().top;
	    var hintH = $("#planner_ui_tooltip").outerHeight();
		
		$("#planner_ui_tooltip").css("left", (pageX+(object_width/2)-modal_width/2)).css("top", (pageY-object_height));
		$("#planner_ui_tooltip").addClass("active");
	}).on('mouseleave', '#action_menu_wrappers .action_menu_item', function(e) {
	    $("#planner_ui_tooltip").remove();
	});
	
	if ($("#planner_start_filters").length)
	{
		setTimeout(function(){
			open_planner_popup('planner_start_filters');
		}, 1000);			
	}
		
	if ($("#planner_search_meter").length && !$("#planner_search_meter").hasClass("ready"))
	{
		$("#planner_search_meter .meter span").animate({
			width: "100%",
		}, 5000, function() {
			$("#planner_search_meter").addClass("ready");
			setTimeout(function(){
				$("#planner_search_request").addClass("slideUp");
			}, 500);			
		});
	}
	
	$(document).on('click', '#modal_close', function(e) {
		close_modal();
	});
	
	$(document).on('click', '#planner_notification_wrapper', function(e) {
		if (!$(this).hasClass("modal")) 
		{
			$(this).addClass("hidden");
			setTimeout(function(){
				$(this).remove();
			}, 500);
		}
		else
		{
			var modal = $(this).attr("data-modal");
			show_modal(modal);
		}
	});
	
	$(document).on('click', '#groups_navi_wrapper .groups_navi_item', function(e) {
		var plan = $(this).attr("data-plan");
		var href = $(this).attr("href");
		if (href) return true;
		return change_group(plan);
	});
	
	$(document).on('click', '#hide_tools', function(e) {
		$("#tools_wrapper").toggleClass('hidden');
		$(".options_preset").removeClass("slideFastLeft");
		$("#planner_ui_options").removeClass("active");
	});
	
	$("#pro_message_close").click(function(e) {
		$("#pro_message").removeClass("slideRight");
	});
	
	$(document).on('click', '#tools_wrapper .tools_item[data-tool]', function(e) { 
		
		var base_height = 100;
		if ($("#container").hasClass("banners")) base_height = -2;

		deactivate_current_tool_menuitem();
		$(this).addClass('active');		
		var params = $("#options_preset_"+$(this).attr("data-params"));
		if (params.length)
		{
			params.css("left", $("#tools_wrapper").width()+"px");
			params.css("top", $(this).offset().top-base_height-2+"px");	
			$("#planner_ui_options").addClass("active");
			params.addClass("slideFastLeft");
		}
	});
	
	$(document).on('click', '.subtools_wrapper .subtools_item', function(e) {
		
		var base_height = 100;
		if ($("#container").hasClass("banners")) base_height = -2;
		
		var parent = $(this).parents(".subtools_wrapper").attr("data-parent");
		var parent_item = $("#current_tools .tools_item[data-target='"+parent+"']");
		var params = $("#options_preset_"+$(this).attr("data-params"));
		$("#current_tools .tools_item").removeClass('active');
		parent_item.addClass("active");
		$(this).parents(".subtools_wrapper").removeClass("slideFastLeft");
		
		$("#planner_ui_options").removeClass("active");
		$(".options_preset").removeClass("slideFastLeft");
		if (params.length)
		{
			var width = params.attr("data-width");
			params.css("left", $("#tools_wrapper").width()+"px");
			params.css("top", parent_item.offset().top-base_height-2+"px");	
			if (width > 0) params.css("width", width+"px");
			$("#planner_ui_options").addClass("active");
			params.addClass("slideFastLeft");
			$("#pro_expire_text").addClass("hidden");
		}
	});
	
	$("#planner_ui_versions_list .planner_ui_versions_item_delete a").click(function(e) {
		var result = confirm('Вы действительно хотите произвести удаление?');
		return result;
	});
		
	$(document).on('click', '#tools_wrapper .tools_item.has_subtools', function(e) {
		
		$("#pro_message").removeClass('slideRight');
		if ($(this).hasClass('is_pro'))
		{
			deactivate_current_tool_menuitem();	
			$("#pro_message").addClass('slideRight');
			return false;
		}
		
		$("#planner_ui_options").removeClass("active");
		$(".options_preset").removeClass("slideFastLeft");
		$(".subtools_wrapper").removeClass("slideFastLeft");
		var target = $(this).attr("data-target");
		var wrapper = $(".subtools_wrapper[data-parent='"+target+"']")
		if (!wrapper.length) return false;
		wrapper.css("left", $("#tools_wrapper").width()+"px");
		wrapper.css("top", $(this).offset().top-base_height-4+"px");
		wrapper.addClass("slideFastLeft");
	});
	
	$(document).on('click', '.options_preset .opt_button', function(e) {
		$(this).parents(".options_preset").removeClass("slideFastLeft");
	});
	
	$(document).click(function(event) {
		
		$(".subtools_wrapper.slideFastLeft").each(function() {
		    if (!$(event.target).closest(this).length && !$(event.target).closest("#current_tools .has_subtools").length) {
				var parent = $(this).attr("data-parent");
				$("#current_tools .tools_item[data-target='"+parent+"']").removeClass("active");
				$(this).removeClass("slideFastLeft");
		    }
		});
		
		if (!$(event.target).closest("#pro_message .pre_button").length) {
			$("#pro_message").removeClass("slideRight");
		}
		
		if (!$(event.target).closest("#planner_ui_help_navi").length) {
			$("#planner_ui_help_options").removeClass("slideFastUp");
		}
				
  		if (!$(event.target).closest("#planner_ui_save_window, #planner_ui_functions").length) {
			close_save_window();
		}
   	
	});
	
});

