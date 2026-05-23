(function (window, document) {
	'use strict';

	var CLASSES = [
		{ value: 'main', title: 'Основной' },
		{ value: 'technical', title: 'Технический' },
		{ value: 'premium', title: 'Премиальный' }
	];

	var COLORS = [
		{ value: 'white_glossy', title: 'Белый глянцевый' },
		{ value: 'white_matte', title: 'Белый матовый' },
		{ value: 'cashmere', title: 'Кашемир' },
		{ value: 'silk', title: 'Шелк' },
		{ value: 'steel', title: 'Сталь' },
		{ value: 'titanium', title: 'Титан' },
		{ value: 'graphite', title: 'Графит' },
		{ value: 'black_matte', title: 'Черный матовый' },
		{ value: 'denim', title: 'Деним' },
		{ value: 'cotton', title: 'Хлопок' },
		{ value: 'cappuccino', title: 'Капучино' },
		{ value: 'gray', title: 'Серый' }
	];

	var COLOR_OPTIONS = [
		{ value: 'default', title: 'По умолчанию' }
	].concat(COLORS);

	var SHUTTERS = [
		{ value: 'with_shutters', title: 'Со шторками' },
		{ value: 'without_shutters', title: 'Без шторок' }
	];

	var SOCKET_TOOLS = {
		socket: 1,
		socket_ip44: 1,
		socket_tv: 1,
		socket_ip: 1,
		socket_usb: 1,
		socket_hdmi: 1,
		socket_audio: 1,
		socket_phone: 1
	};

	var ALLOWED_TOOLS = {
		socket: 1,
		socket_ip44: 1,
		socket_tv: 1,
		socket_ip: 1,
		socket_usb: 1,
		socket_hdmi: 1,
		socket_audio: 1,
		socket_phone: 1,
		light_switch: 1,
		light_switch_double: 1,
		light_switch_triple: 1,
		light_switch_through: 1,
		light_switch_through_double: 1,
		light_switch_cross: 1,
		light_switch_cross_double: 1,
		light_dimmer: 1,
		light_switch_master: 1
	};

	var DEFAULT_CLASS = CLASSES[0];
	var DEFAULT_COLOR = COLOR_OPTIONS[0];
	var DEFAULT_SHUTTERS = SHUTTERS[0];
	var DEFAULT_SETTINGS = {
		default_color: {
			value: COLORS[0].value,
			title: COLORS[0].title
		}
	};

	window.fixture_settings = window.fixture_settings || copySettings(DEFAULT_SETTINGS);

	function findOption(list, value) {
		for (var i = 0; i < list.length; i++) {
			if (list[i].value === value) return list[i];
		}
		return list[0];
	}

	function fieldValue(props, field, list) {
		var value = props && props[field] && props[field].value;
		return findOption(list, value);
	}

	function setField(props, field, list, value) {
		var option = findOption(list, value);
		props[field] = {
			value: option.value,
			title: option.title
		};
	}

	function copySettings(settings) {
		return JSON.parse(JSON.stringify(settings));
	}

	function defaultColor() {
		var settings = window.fixture_settings || DEFAULT_SETTINGS;
		return findOption(COLORS, settings.default_color && settings.default_color.value);
	}

	function isAllowedTool(name) {
		return !!(name && ALLOWED_TOOLS[name]);
	}

	function isSocketTool(name) {
		return !!(name && SOCKET_TOOLS[name]);
	}

	function isAllowedItem(props) {
		var group = props && props.socket_group;
		if (props && props.name === 'socket_group' && group && group.length) {
			for (var i = 0; i < group.length; i++) {
				if (group[i] && isAllowedTool(group[i].name)) return true;
			}
			return false;
		}
		return !!(props && isAllowedTool(props.name));
	}

	function isSocketItem(props) {
		var group = props && props.socket_group;
		if (props && props.name === 'socket_group' && group && group.length) {
			for (var i = 0; i < group.length; i++) {
				if (group[i] && isSocketTool(group[i].name)) return true;
			}
			return false;
		}
		return !!(props && isSocketTool(props.name));
	}

	function ensureItem(props) {
		if (!isAllowedItem(props)) return false;
		if (!props.fixture_class || !props.fixture_class.value) {
			props.fixture_class = {
				value: DEFAULT_CLASS.value,
				title: DEFAULT_CLASS.title
			};
		}
		if (!props.fixture_color || !props.fixture_color.value) {
			props.fixture_color = {
				value: DEFAULT_COLOR.value,
				title: DEFAULT_COLOR.title
			};
		}
		if (isSocketItem(props) && (!props.fixture_shutters || !props.fixture_shutters.value)) {
			props.fixture_shutters = {
				value: DEFAULT_SHUTTERS.value,
				title: DEFAULT_SHUTTERS.title
			};
		}
		return true;
	}

	function summary(props) {
		var classOption = fieldValue(props, 'fixture_class', CLASSES);
		var colorOption = fieldValue(props, 'fixture_color', COLOR_OPTIONS);
		var shuttersOption = fieldValue(props, 'fixture_shutters', SHUTTERS);
		var outputColor = colorOption.value === 'default' ? defaultColor() : colorOption;
		return {
			classValue: classOption.value,
			classTitle: classOption.title,
			colorValue: outputColor.value,
			colorTitle: outputColor.title,
			rawColorValue: colorOption.value,
			rawColorTitle: colorOption.title,
			shuttersValue: shuttersOption.value,
			shuttersTitle: shuttersOption.title,
			shuttersSuffix: ' — ' + shuttersOption.title,
			key: classOption.value + '|' + outputColor.value,
			suffix: ' — ' + classOption.title + ' — ' + outputColor.title
		};
	}

	function fillSelect(id, list) {
		var select = document.getElementById(id);
		if (!select || select.options.length) return;
		for (var i = 0; i < list.length; i++) {
			select.options.add(new Option(list[i].title, list[i].value));
		}
	}

	function fillSelects() {
		fillSelect('cm-socket--class', CLASSES);
		fillSelect('cm-switch--class', CLASSES);
		fillSelect('cm-socket--color', COLOR_OPTIONS);
		fillSelect('cm-switch--color', COLOR_OPTIONS);
		fillSelect('cm-socket--shutters', SHUTTERS);
	}

	function setRowsVisible(menu, visible) {
		var rows = document.querySelectorAll(menu + ' .fixture-settings');
		for (var i = 0; i < rows.length; i++) {
			rows[i].style.display = visible ? '' : 'none';
		}
	}

	function syncMenuForItem(item, menu, classId, colorId, shuttersId) {
		var props = item && item.props;
		if (!props || !ensureItem(props)) {
			setRowsVisible(menu, false);
			return;
		}

		setRowsVisible(menu, true);
		document.getElementById(classId).value = fieldValue(props, 'fixture_class', CLASSES).value;
		document.getElementById(colorId).value = fieldValue(props, 'fixture_color', COLOR_OPTIONS).value;
		if (shuttersId) {
			document.getElementById(shuttersId).value = fieldValue(props, 'fixture_shutters', SHUTTERS).value;
		}
	}

	function syncItemContextmenu(item, menu) {
		fillSelects();
		if (menu === '#cm-socket') {
			syncMenuForItem(item, '#cm-socket', 'cm-socket--class', 'cm-socket--color', 'cm-socket--shutters');
		} else if (menu === '#cm-switch') {
			syncMenuForItem(item, '#cm-switch', 'cm-switch--class', 'cm-switch--color');
		}
	}

	function changeFixtureField(target) {
		var isClassField = target.id === 'cm-socket--class' || target.id === 'cm-switch--class';
		var isColorField = target.id === 'cm-socket--color' || target.id === 'cm-switch--color';
		var isShuttersField = target.id === 'cm-socket--shutters';
		if (!isClassField && !isColorField && !isShuttersField) return;

		var menu = target.closest ? target.closest('.contextmenu') : null;
		var itemId = menu && menu.getAttribute('data-item_id');
		var item = itemId && window.ITEMS && ITEMS[itemId] ? ITEMS[itemId] :
			window.selected && window.selected.item;
		var props = item && item.props;
		if (!props || !ensureItem(props)) return;

		if (isClassField) {
			setField(props, 'fixture_class', CLASSES, target.value);
		} else if (isColorField) {
			setField(props, 'fixture_color', COLOR_OPTIONS, target.value);
		} else if (isShuttersField && isSocketItem(props)) {
			setField(props, 'fixture_shutters', SHUTTERS, target.value);
		}

		if (window.project && project.localSave) project.localSave();
		if (window.refreshEquipment) window.refreshEquipment();
	}

	function setDefaultColor(value) {
		var color = findOption(COLORS, value);
		window.fixture_settings = window.fixture_settings || copySettings(DEFAULT_SETTINGS);
		window.fixture_settings.default_color = {
			value: color.value,
			title: color.title
		};
		var select = document.getElementById('equipment_default_color');
		if (select) select.value = color.value;
		if (window.project && project.localSave) project.localSave();
		if (window.refreshEquipment) window.refreshEquipment();
	}

	function loadSettings(settings) {
		window.fixture_settings = copySettings(DEFAULT_SETTINGS);
		if (settings && settings.default_color) {
			var color = findOption(COLORS, settings.default_color.value);
			window.fixture_settings.default_color = {
				value: color.value,
				title: color.title
			};
		}
		syncSettingsUI();
	}

	function copyCurrentSettings() {
		return copySettings(window.fixture_settings || DEFAULT_SETTINGS);
	}

	function syncSettingsUI() {
		var select = document.getElementById('equipment_default_color');
		if (select) select.value = defaultColor().value;
	}

	document.addEventListener('DOMContentLoaded', function () {
		syncSettingsUI();
		var select = document.getElementById('equipment_default_color');
		if (select) {
			select.addEventListener('change', function () {
				setDefaultColor(this.value);
			});
		}
	});

	window.fixture_options = {
		classes: CLASSES,
		colors: COLORS,
		colorOptions: COLOR_OPTIONS,
		shutters: SHUTTERS,
		isAllowedTool: isAllowedTool,
		isSocketTool: isSocketTool,
		isAllowedItem: isAllowedItem,
		isSocketItem: isSocketItem,
		ensureItem: ensureItem,
		summary: summary,
		syncItemContextmenu: syncItemContextmenu,
		changeField: changeFixtureField,
		loadSettings: loadSettings,
		copySettings: copyCurrentSettings,
		syncSettingsUI: syncSettingsUI
	};
})(window, document);
