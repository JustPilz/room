function close_planner_subobjects() {
	$("#planner_subobjects").removeClass("active");
	$("#planner_subobjects .planner_subobjects_item").removeClass("open").removeClass("add_open");
}

$(function() {
	
	$("#planner_subobjects .planner_subobjects_item_current").click(function(e) {
		$("#planner_subobjects").addClass("active");
		$(this).parent(".planner_subobjects_item").removeClass("add_open").addClass("open");
		$(this).parent(".planner_subobjects_item").siblings(".planner_subobjects_item").removeClass("add_open").removeClass("open");
	});
	
	$("#planner_subobjects .planner_subobjects_item.planner_versions .planner_subobjects_listing_item.add").click(function(e) {
		if ($(this).hasClass("pro_only")) {
			return false;
		}
		var container = $(this).parents(".planner_subobjects_item");
		container.removeClass("open").addClass("add_open");
		var input = container.find(".planner_subobjects_add input");
		input.val("");
		input.focus();
	});
	
	$("#planner_subobjects .planner_subobjects_add_opt").click(function(e) {
		if (!$(this).hasClass("single")) {
			$(this).addClass("active");
			$(this).siblings(".planner_subobjects_add_opt").removeClass("active");
			$(this).prevAll(".planner_subobjects_add_opt").addClass("active");
		} else {
			$(this).toggleClass("active");
		}
	});
	
	$(document).on('click', '#planner_subobjects .planner_subobjects_listing_options .edit', function(e) {
		var parent_item = $(this).parents(".planner_subobjects_listing_item");
		var parent_a = parent_item.children("a");
		parent_item.addClass("input");
		parent_item.children("input").val(parent_a.text());
		parent_item.children("input").focus();
		parent_item.siblings(".planner_subobjects_listing_item").removeClass("input");
	});

	// удаление планировки
	$(document).on('click', '#planner_subobjects .planner_versions .planner_subobjects_listing_options .delete', function(e) {
		if (!confirm(l10n.do_you_want_remove_layout)) {
			return;
		}
		var parent_item = $(this).parents(".planner_subobjects_listing_item");
		parent_item.siblings(".planner_subobjects_listing_item.add").removeClass("hidden");
		$("#modal_hint").hide();
		$.ajax({
			type: 'POST',
			url: langUrl + '/setup/api/planner/plan_delete/',
			data: {
				object_id: $("body").attr("data-object-id"),
				plan_id: parent_item.attr("data-plan_id"),
			},
			dataType: "json",
			success: function (data) {
				if (data.status === 'success') {
					parent_item.remove();
					if ($('#planner_subobjects .planner_versions .planner_subobjects_listing_item[data-plan_id]').length < 5) {
						$('#planner_subobjects .planner_versions .planner_subobjects_listing_item.add').show();
					}
				}
			},
		});
	});

	// удаление этажа
	$(document).on('click', '#planner_subobjects .planner_floors .planner_subobjects_listing_options .delete', function(e) {
		if (!confirm(l10n.do_you_want_remove_floor)) {
			return;
		}
		var parent_item = $(this).parents(".planner_subobjects_listing_item");
		parent_item.siblings(".planner_subobjects_listing_item.add").removeClass("hidden");
		$("#modal_hint").hide();
		$.ajax({
			type: 'POST',
			url: langUrl + '/setup/api/planner/floor_delete/',
			data: {
				object_id: $("body").attr("data-object-id"),
				floor_id: parent_item.attr("data-floor_id"),
			},
			dataType: "json",
			success: function (data) {
				if (data.status === 'success') {
					parent_item.remove();
				}
			},
		});
	});

	function planner_subobjects_edit_name(parent_item, e) {
		var current_value = parent_item.children("input").val();
		let label = parent_item.children("a").text();
		if (current_value && label !== current_value) {
			let plan_id = +parent_item.attr("data-plan_id");
			let fn_callback = function () {
				$.ajax({
					type: 'POST',
					url: langUrl + '/setup/api/planner/plan_edit_name/',
					data: {
						object_id: $("body").attr("data-object-id"),
						plan_id: plan_id,
						label: current_value,
					},
					dataType: "json",
					success: function (data) {
						if (data.status === 'success') {
							if (data.reload) {
								window.location.reload();
							}
							parent_item.children("a").text(current_value);
							parent_item.removeClass("input");
							$('#planner_subobjects .planner_versions .planner_subobjects_item_current').text(current_value);
						}
					},
				});
			};
			// если были изменения и ещё нет планировок
			if (window.flag_changes && plan_id <= 0) {
				$("#fog").show();
				sleep(100).then(function() {
					project.save(false, true, '', {
						callback_success: fn_callback
					});
				});
			} else {
				fn_callback();
			}
		} else {
			parent_item.removeClass("input");
		}
	}

	// редактирование имени планировки
	$(document).on('click', '#planner_subobjects .planner_versions .planner_subobjects_listing_item.input em', function(e) {
		planner_subobjects_edit_name($(this).closest(".planner_subobjects_listing_item"), e);
	});

	$(document).on('keyup', '#planner_subobjects .planner_versions .planner_subobjects_listing_item.input input[type=\'text\']', function(e) {
		if (e.keyCode === 13) {
			planner_subobjects_edit_name($(this).closest(".planner_subobjects_listing_item"), e);
		}
	});

	// открытие меню этажей
	$(document).on('click', '#planner_subobjects .planner_subobjects_item.planner_floors .planner_subobjects_listing_item.add', function(e) {
		if ($(this).hasClass("pro_only")) {
			return false;
		}

		$('.planner_floors .planner_subobjects_add_input option').prop('disabled', false);

		let floor_uid = '';

		$('.planner_floors .planner_subobjects_listing_item[data-floor_uid]').each(function(index, element) {
			floor_uid = $(element).data('floor_uid');
			$('.planner_floors .planner_subobjects_add_input option[value="' + floor_uid + '"]').prop('disabled', true);
		});

		if ($('.planner_subobjects_add_input option[value="' + floor_uid + '"]').next().length > 0) {
			$('.planner_floors .planner_subobjects_add_input option[value="' + floor_uid + '"]').next().prop('selected', true);
		}

		var container = $(this).parents(".planner_subobjects_item");
		container.removeClass("open").addClass("add_open");
	});

	// добавление нового этажа
	$(document).on('click', '#planner_subobjects .planner_floors .planner_subobjects_add_submit a', function(e) {
		if ($(this).parent(".planner_subobjects_add_submit").hasClass("pro_only") || $(this).parent(".planner_subobjects_add_submit").hasClass("loading")) {
			return false;
		}
		
		$(this).parent(".planner_subobjects_add_submit").addClass("loading");
		
		let plan_id = +$("body").attr("data-plan_id");
		let level = [];
		$('#planner_subobjects .planner_floors .planner_subobjects_add_opt.active').each(function(index, element) {
			level.push($(element).data('level'));
		});
		let floor_uid = $('.planner_floors .planner_subobjects_add_input select').val();
		let fn_callback = function () {
			$.ajax({
				type: 'POST',
				url: langUrl + '/setup/api/planner/floor_add_new/',
				data: {
					object_id: $("body").attr("data-object-id"),
					plan_id: plan_id > 0 ? plan_id : -1,
					level: level,
					floor_uid: floor_uid,
				},
				dataType: "json",
				success: function (data) {
					if (data.status === 'success') {
						if (data.on_back_floor) {
							localStorage.on_back_floor = 1;
						}
						if (in_array(1, level)) {
							localStorage.force_save_project = 1;
						}
						window.location.href = langUrl + '/planner/oid' + $("body").attr("data-object-id") + 'o' + $("body").attr("data-authkey") + 'p' + data.plan_id + '/';
					}
				},
			});
		};
		// если были изменения
		if (window.flag_changes) {
			$("#fog").show();
			sleep(100).then(function() {
				project.save(false, true, '', {
					callback_success: fn_callback
				});
			});
		} else {
			fn_callback();
		}
	});

	// добавление новой планировки
	$(document).on('click', '#planner_subobjects .planner_versions .planner_subobjects_add_submit a', function(e) {
		if ($(this).parent(".planner_subobjects_add_submit").hasClass("pro_only") || $(this).parent(".planner_subobjects_add_submit").hasClass("loading")) {
			return false;
		}
		
		$(this).parent(".planner_subobjects_add_submit").addClass("loading");
		
		let label = $("#planner_subobjects .planner_versions .planner_subobjects_add_input input").val().trim();
		let level = $("#planner_subobjects .planner_versions .planner_subobjects_add_opt.active").last().data('level');
		if (level < 1) {
			return;
		}
		let plan_id = +$("body").attr("data-plan_id");
		let fn_callback = function () {
			$.ajax({
				type: 'POST',
				url: langUrl + '/setup/api/planner/plan_add_new/',
				data: {
					object_id: $("body").attr("data-object-id"),
					plan_id: plan_id > 0 ? plan_id : -1,
					level: level,
					label: label,
				},
				dataType: "json",
				success: function (data) {
					if (data.status === 'success') {
						if (level == 1) {
							localStorage.force_save_project = 1;
						}
						window.location.href = langUrl + '/planner/oid' + $("body").attr("data-object-id") + 'o' + $("body").attr("data-authkey") + 'p' + data.plan_id + '/';
					}
				},
			});
		};
		// если были изменения
		if (window.flag_changes) {
			$("#fog").show();
			sleep(100).then(function() {
				project.save(false, true, '', {
					callback_success: fn_callback
				});
			});
		} else {
			fn_callback();
		}
	});
	
	$(document).on('click', '#planner_subobjects .planner_subobjects_listing_item a', function(e) {
		var current_value = $(this).text();
		$(this).parents(".planner_subobjects_listing").siblings(".planner_subobjects_item_current").text(current_value);
		$(this).parents(".planner_subobjects_listing_item").addClass("active");
		$(this).parents(".planner_subobjects_listing_item").siblings(".planner_subobjects_listing_item").removeClass("active");
		close_planner_subobjects();
	});

	$(document).click(function(event) {
		if (!$(event.target).closest("#planner_subobjects .planner_subobjects_item, span.delete.pre_hint").length) {
			close_planner_subobjects();
		}
	});
});
