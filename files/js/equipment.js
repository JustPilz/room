/**
 * Equipment mode — подсчёт настенных розеток, выключателей и рамок.
 */
(function () {
	'use strict';

	var EXCLUDED = {
		socket_power: 1,
		socket_380: 1,
		floor_socket: 1,
		ceiling_socket: 1,
		floor_wire: 1,
		ceiling_wire: 1,
		wire_oven: 1,
		wire_stove: 1,
		wire_conditioner: 1,
		wire_light: 1,
		wire: 1,
		wire_lowcurrent: 1,
		socket_thermo: 1
	};

	var SWITCH_TITLE_ALIASES = {
		light_switch_master: 'light_switch'
	};

	function getSocketToolNames() {
		var names = { socket: 1, socket_ip44: 1 };
		var low = typeof cabling_socket !== 'undefined' &&
			cabling_socket.sockets_lowcurrent_in_group;
		if (low) {
			for (var k in low) {
				if (low.hasOwnProperty(k)) names[k] = 1;
			}
		}
		return names;
	}

	function getSwitchToolNames() {
		var names = {};
		var list = typeof cabling_socket !== 'undefined' && cabling_socket.switches;
		if (list && list.length) {
			for (var i = 0; i < list.length; i++) names[list[i]] = 1;
		}
		names.light_switch_master = 1;
		return names;
	}

	function postsForTool(toolName, socketTools, switchTools) {
		if (!toolName || EXCLUDED[toolName]) return 0;
		if (switchTools[toolName]) return 1;
		if (socketTools[toolName]) return 1;
		return 0;
	}

	function toolTitle(toolName) {
		if (window.tools && tools[toolName] && tools[toolName].title) {
			return tools[toolName].title;
		}
		return toolName;
	}

	function countTitle(toolName) {
		return toolTitle(SWITCH_TITLE_ALIASES[toolName] || toolName);
	}

	function fixtureSummary(props) {
		if (window.fixture_options && fixture_options.summary) {
			return fixture_options.summary(props || {});
		}
		return {
			classValue: 'main',
			classTitle: 'Основной',
			colorValue: 'white_glossy',
			colorTitle: 'Белый глянцевый',
			shuttersValue: 'with_shutters',
			shuttersTitle: 'Со шторками',
			shuttersSuffix: ' — Со шторками',
			key: 'main|white_glossy',
			suffix: ' — Основной — Белый глянцевый'
		};
	}

	function equipmentTitle(title, props) {
		return title + fixtureSummary(props).suffix;
	}

	function socketEquipmentTitle(title, props) {
		var fixture = fixtureSummary(props);
		return title + fixture.suffix + fixture.shuttersSuffix;
	}

	function incMap(map, key, n) {
		map[key] = (map[key] || 0) + (n || 1);
	}

	function incFrame(map, posts, props) {
		var fixture = fixtureSummary(props);
		var key = posts + '|' + fixture.key;
		if (!map[key]) {
			map[key] = {
				posts: posts,
				count: 0,
				fixtureSuffix: fixture.suffix
			};
		}
		map[key].count += 1;
	}

	function sortMapEntries(map) {
		return Object.keys(map).sort(function (a, b) {
			return a.localeCompare(b, 'ru');
		}).map(function (k) {
			return { title: k, count: map[k] };
		});
	}

	function sortFrameEntries(map) {
		return Object.keys(map).map(function (key) {
			var row = map[key];
			if (row && typeof row === 'object') return row;
			return { posts: Number(key), count: row, fixtureSuffix: '' };
		}).sort(function (a, b) {
			return a.posts - b.posts || a.fixtureSuffix.localeCompare(b.fixtureSuffix, 'ru');
		});
	}

	function getItemProps(item) {
		return item && (item.props || item);
	}

	function getRoomZone(room, zoneId) {
		if (!room || !zoneId || !room.zones) return null;
		for (var i = 0; i < room.zones.length; i++) {
			if (room.zones[i] && room.zones[i].id === zoneId) return room.zones[i];
		}
		return null;
	}

	function roomTitle(roomId, zoneId) {
		var room = roomId && typeof ROOMS2 !== 'undefined' && ROOMS2 && ROOMS2[roomId];
		if (!room) return 'Без помещения';
		var zone = getRoomZone(room, zoneId);
		var name = zone && zone.name && zone.name !== 'none' ? zone.name : '';
		var areaValue = zone && zone.area ? zone.area : room.area;
		var area = areaValue ? areaValue + ' м²' : '';
		if (name) return area ? name + ' (' + area + ')' : name;
		return area ? 'Помещение ' + area : 'Помещение';
	}

	function getRoomBucket(rooms, item) {
		var props = getItemProps(item);
		var roomId = props && props.id_room ? props.id_room : '';
		var zoneId = props && props.id_room_zone ? props.id_room_zone : '';
		var bucketId = roomId ? roomId + ':' + (zoneId || roomId) : '__no_room';
		if (!rooms[bucketId]) {
			rooms[bucketId] = {
				title: roomTitle(roomId, zoneId),
				sockets: {},
				switches: {},
				frames: {}
			};
		}
		return rooms[bucketId];
	}

	function processGroup(item, socketTools, switchTools, sockets, switches, frames, rooms) {
		var props = getItemProps(item);
		var group = props && props.socket_group;
		if (!group || !group.length) return;

		var totalPosts = 0;
		var roomBucket = getRoomBucket(rooms, item);
		for (var i = 0; i < group.length; i++) {
			var sub = group[i];
			if (!sub || !sub.name) continue;
			var posts = postsForTool(sub.name, socketTools, switchTools);
			if (posts <= 0) continue;
			totalPosts += posts;
			if (switchTools[sub.name]) {
				var title = equipmentTitle(countTitle(sub.name), props);
				incMap(switches, title, 1);
				incMap(roomBucket.switches, title, 1);
			} else if (socketTools[sub.name]) {
				var title = socketEquipmentTitle(toolTitle(sub.name), props);
				incMap(sockets, title, 1);
				incMap(roomBucket.sockets, title, 1);
			}
		}
		if (totalPosts > 0) {
			incFrame(frames, totalPosts, props);
			incFrame(roomBucket.frames, totalPosts, props);
		}
	}

	function processSingle(item, socketTools, switchTools, sockets, switches, frames, rooms) {
		var props = getItemProps(item);
		var name = props && props.name;
		if (!name || name === 'socket_group') return;
		var posts = postsForTool(name, socketTools, switchTools);
		if (posts <= 0) return;
		var roomBucket = getRoomBucket(rooms, item);
		if (switchTools[name]) {
			var title = equipmentTitle(countTitle(name), props);
			incMap(switches, title, 1);
			incMap(roomBucket.switches, title, 1);
		} else if (socketTools[name]) {
			var title = socketEquipmentTitle(toolTitle(name), props);
			incMap(sockets, title, 1);
			incMap(roomBucket.sockets, title, 1);
		}
		incFrame(frames, posts, props);
		incFrame(roomBucket.frames, posts, props);
	}

	window.getEquipmentSummary = function () {
		var sockets = {};
		var switches = {};
		var frames = {};
		var rooms = {};
		var socketTools = getSocketToolNames();
		var switchTools = getSwitchToolNames();

		if (typeof ITEMS === 'undefined' || !ITEMS) {
			return { sockets: sockets, switches: switches, frames: frames, rooms: rooms };
		}

		for (var id in ITEMS) {
			if (!ITEMS.hasOwnProperty(id)) continue;
			var item = ITEMS[id];
			var props = getItemProps(item);
			if (!props) continue;
			if (props.name === 'socket_group') {
				processGroup(item, socketTools, switchTools, sockets, switches, frames, rooms);
			} else {
				processSingle(item, socketTools, switchTools, sockets, switches, frames, rooms);
			}
		}

		return { sockets: sockets, switches: switches, frames: frames, rooms: rooms };
	};

	function buildListHtml(entries, emptyText) {
		if (!entries.length) {
			return {
				html: '<div class="equipment_empty">' + emptyText + '</div>',
				total: 0
			};
		}
		var html = '<ul class="equipment_list">';
		var total = 0;
		for (var i = 0; i < entries.length; i++) {
			html += '<li><span class="equipment_name">' + escapeHtml(entries[i].title) +
				'</span><span class="equipment_count">' + entries[i].count + '</span></li>';
			total += entries[i].count;
		}
		html += '</ul><div class="equipment_total">Итого: ' + total + '</div>';
		return { html: html, total: total };
	}

	function renderList(container, entries, emptyText) {
		if (!container) return 0;
		var list = buildListHtml(entries, emptyText);
		container.innerHTML = list.html;
		return list.total;
	}

	function postsLabel(n) {
		var m10 = n % 10;
		var m100 = n % 100;
		if (m100 >= 11 && m100 <= 14) return n + ' постов';
		if (m10 === 1) return n + ' пост';
		if (m10 >= 2 && m10 <= 4) return n + ' поста';
		return n + ' постов';
	}

	function escapeHtml(s) {
		return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
	}

	function buildFramesHtml(frameEntries) {
		if (!frameEntries.length) {
			return {
				html: '<div class="equipment_empty">Нет рамок</div>',
				total: 0
			};
		}
		var html = '<ul class="equipment_list equipment_frames_list">';
		var totalFrames = 0;
		var totalPosts = 0;
		for (var i = 0; i < frameEntries.length; i++) {
			var row = frameEntries[i];
			var label = postsLabel(row.posts) + (row.fixtureSuffix || '');
			html += '<li><span class="equipment_name">' + label +
				'</span><span class="equipment_count">' + row.count + ' шт.</span></li>';
			totalFrames += row.count;
			totalPosts += row.posts * row.count;
		}
		html += '</ul><div class="equipment_total">Рамок: ' + totalFrames +
			', механизмов: ' + totalPosts + '</div>';
		return { html: html, total: totalFrames };
	}

	function renderFrames(container, frameEntries) {
		if (!container) return 0;
		var frames = buildFramesHtml(frameEntries);
		container.innerHTML = frames.html;
		return frames.total;
	}

	function mapTotal(map) {
		var total = 0;
		for (var key in map) {
			if (map.hasOwnProperty(key)) total += map[key];
		}
		return total;
	}

	function renderRoomDistribution(container, rooms) {
		if (!container) return 0;

		var roomEntries = [];
		for (var roomId in rooms) {
			if (!rooms.hasOwnProperty(roomId)) continue;
			var room = rooms[roomId];
			var total = mapTotal(room.sockets) + mapTotal(room.switches) + mapTotal(room.frames);
			if (total <= 0) continue;
			roomEntries.push({
				title: room.title,
				sockets: sortMapEntries(room.sockets),
				switches: sortMapEntries(room.switches),
				frames: sortFrameEntries(room.frames),
				total: total
			});
		}

		if (!roomEntries.length) {
			container.innerHTML = '<div class="equipment_empty">Нет данных по помещениям</div>';
			return 0;
		}

		roomEntries.sort(function (a, b) {
			return a.title.localeCompare(b.title, 'ru');
		});

		var html = '';
		for (var i = 0; i < roomEntries.length; i++) {
			var roomEntry = roomEntries[i];
			var socketsList = buildListHtml(roomEntry.sockets, 'Нет розеток');
			var switchesList = buildListHtml(roomEntry.switches, 'Нет выключателей');
			var framesList = buildFramesHtml(roomEntry.frames);
			html += '<div class="equipment_room">' +
				'<h4 class="equipment_room_title">' + escapeHtml(roomEntry.title) + '</h4>' +
				'<div class="equipment_room_group">' +
					'<div class="equipment_room_subtitle">Розетки</div>' +
					socketsList.html +
				'</div>' +
				'<div class="equipment_room_group">' +
					'<div class="equipment_room_subtitle">Выключатели</div>' +
					switchesList.html +
				'</div>' +
				'<div class="equipment_room_group">' +
					'<div class="equipment_room_subtitle">Рамки</div>' +
					framesList.html +
				'</div>' +
			'</div>';
		}

		container.innerHTML = html;
		return roomEntries.length;
	}

	window.refreshEquipment = function () {
		var summary = window.getEquipmentSummary();
		var socketEntries = sortMapEntries(summary.sockets);
		var switchEntries = sortMapEntries(summary.switches);
		var frameEntries = sortFrameEntries(summary.frames);

		var socketsTotal = renderList(
			document.getElementById('equipment_sockets'),
			socketEntries,
			'Нет розеток'
		);
		var switchesTotal = renderList(
			document.getElementById('equipment_switches'),
			switchEntries,
			'Нет выключателей'
		);
		var framesTotal = renderFrames(
			document.getElementById('equipment_frames'),
			frameEntries
		);
		renderRoomDistribution(
			document.getElementById('equipment_rooms'),
			summary.rooms
		);

		var emptyEl = document.getElementById('equipment_empty');
		if (emptyEl) {
			emptyEl.style.display =
				socketsTotal + switchesTotal + framesTotal === 0 ? 'block' : 'none';
		}
	};

	$(function () {
		var panel = document.getElementById('equipment_panel');
		var canvas = document.getElementById('canvas');
		if (panel && canvas && panel.parentNode !== canvas) {
			canvas.appendChild(panel);
		}

		$(document).on('click', '#equipment_refresh', function () {
			window.refreshEquipment();
		});

		$(document).on(
			'click',
			'#groups_navi_wrapper .groups_navi_item[data-plan="sockets"], ' +
				'#groups_navi_wrapper .groups_navi_item[data-plan="light_connections"]',
			function () {
				setTimeout(window.refreshEquipment, 0);
			}
		);

		window.refreshEquipment();
	});
})();
