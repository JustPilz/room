(function (window, document) {
	'use strict';

	var CLASSES = [
		{ value: 'main', title: 'Основная' },
		{ value: 'technical', title: 'Техническая' },
		{ value: 'premium', title: 'Премиальная' }
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
		default_colors: {
			main: colorSettings('white_matte'),
			technical: colorSettings('white_matte'),
			premium: colorSettings('white_matte')
		},
		class_names: {
			main: '',
			technical: '',
			premium: ''
		}
	};

	window.fixture_settings = window.fixture_settings || copySettings(DEFAULT_SETTINGS);

	function findOption(list, value) {
		for (var i = 0; i < list.length; i++) {
			if (list[i].value === value) return list[i];
		}
		return list[0];
	}

	function colorSettings(value) {
		var color = findOption(COLORS, value);
		return {
			value: color.value,
			title: color.title
		};
	}

	function classExists(value) {
		for (var i = 0; i < CLASSES.length; i++) {
			if (CLASSES[i].value === value) return true;
		}
		return false;
	}

	function className(value) {
		var settings = window.fixture_settings || DEFAULT_SETTINGS;
		var names = settings.class_names || {};
		return names[value] ? String(names[value]) : '';
	}

	function classTitle(value) {
		var base = findOption(CLASSES, value);
		var name = className(base.value).replace(/^\s+|\s+$/g, '');
		return name || base.title;
	}

	function getClassOption(value) {
		var base = findOption(CLASSES, value);
		return {
			value: base.value,
			title: classTitle(base.value)
		};
	}

	function getClassOptions() {
		var options = [];
		for (var i = 0; i < CLASSES.length; i++) {
			options.push(getClassOption(CLASSES[i].value));
		}
		return options;
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

	function defaultColor(classValue) {
		var settings = window.fixture_settings || DEFAULT_SETTINGS;
		var colors = settings.default_colors || DEFAULT_SETTINGS.default_colors;
		var color = colors[classExists(classValue) ? classValue : DEFAULT_CLASS.value];
		return findOption(COLORS, color && color.value);
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
			var defaultClass = getClassOption(DEFAULT_CLASS.value);
			props.fixture_class = {
				value: defaultClass.value,
				title: defaultClass.title
			};
		}
		if (!props.fixture_color || !props.fixture_color.value) {
			props.fixture_color = {
				value: DEFAULT_COLOR.value,
				title: DEFAULT_COLOR.title
			};
		}
		var socketItem = isSocketItem(props);
		if (socketItem && (!props.fixture_shutters || !props.fixture_shutters.value)) {
			props.fixture_shutters = {
				value: DEFAULT_SHUTTERS.value,
				title: DEFAULT_SHUTTERS.title
			};
		} else if (!socketItem && props.fixture_shutters) {
			delete props.fixture_shutters;
		}
		return true;
	}

	function summary(props, includeShutters) {
		var classOption = fieldValue(props, 'fixture_class', getClassOptions());
		var colorOption = fieldValue(props, 'fixture_color', COLOR_OPTIONS);
		var shuttersOption = includeShutters !== false && isSocketItem(props) ?
			fieldValue(props, 'fixture_shutters', SHUTTERS) : null;
		var outputColor = colorOption.value === 'default' ? defaultColor(classOption.value) : colorOption;
		return {
			classValue: classOption.value,
			classTitle: classOption.title,
			colorValue: outputColor.value,
			colorTitle: outputColor.title,
			rawColorValue: colorOption.value,
			rawColorTitle: colorOption.title,
			shuttersValue: shuttersOption ? shuttersOption.value : '',
			shuttersTitle: shuttersOption ? shuttersOption.title : '',
			shuttersSuffix: shuttersOption ? ', ' + shuttersOption.title : '',
			key: classOption.value + '|' + outputColor.value,
			suffix: ', ' + classOption.title + ', ' + outputColor.title
		};
	}

	function setSelectOptions(select, list) {
		var value = select.value;
		select.options.length = 0;
		for (var i = 0; i < list.length; i++) {
			select.options.add(new Option(list[i].title, list[i].value));
		}
		select.value = value;
	}

	function fillSelect(id, list, force) {
		var select = document.getElementById(id);
		if (!select || (select.options.length && !force)) return;
		setSelectOptions(select, list);
	}

	function fillSelects() {
		fillSelect('cm-socket--class', getClassOptions(), true);
		fillSelect('cm-switch--class', getClassOptions(), true);
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
		document.getElementById(classId).value = fieldValue(props, 'fixture_class', getClassOptions()).value;
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
			setField(props, 'fixture_class', getClassOptions(), target.value);
		} else if (isColorField) {
			setField(props, 'fixture_color', COLOR_OPTIONS, target.value);
		} else if (isShuttersField && isSocketItem(props)) {
			setField(props, 'fixture_shutters', SHUTTERS, target.value);
		}

		if (window.project && project.localSave) project.localSave();
		if (window.refreshEquipment) window.refreshEquipment();
	}

	function setDefaultColor(classValue, value) {
		var color = findOption(COLORS, value);
		window.fixture_settings = window.fixture_settings || copySettings(DEFAULT_SETTINGS);
		window.fixture_settings.default_colors = window.fixture_settings.default_colors || copySettings(DEFAULT_SETTINGS.default_colors);
		window.fixture_settings.default_colors[classValue] = {
			value: color.value,
			title: color.title
		};
		var select = document.querySelector('[data-fixture-color="' + classValue + '"]');
		if (select) select.value = color.value;
		if (window.project && project.localSave) project.localSave();
		if (window.refreshEquipment) window.refreshEquipment();
	}

	function setClassName(classValue, value) {
		window.fixture_settings = window.fixture_settings || copySettings(DEFAULT_SETTINGS);
		window.fixture_settings.class_names = window.fixture_settings.class_names || copySettings(DEFAULT_SETTINGS.class_names);
		window.fixture_settings.class_names[classValue] = value;
		updateClassSelects();
		if (window.project && project.localSave) project.localSave();
		if (window.refreshEquipment) window.refreshEquipment();
	}

	function loadSettings(settings) {
		window.fixture_settings = copySettings(DEFAULT_SETTINGS);
		if (settings && settings.default_colors) {
			for (var i = 0; i < CLASSES.length; i++) {
				var classValue = CLASSES[i].value;
				if (settings.default_colors[classValue]) {
					window.fixture_settings.default_colors[classValue] = colorSettings(settings.default_colors[classValue].value);
				}
			}
		} else if (settings && settings.default_color) {
			var color = colorSettings(settings.default_color.value);
			for (var c = 0; c < CLASSES.length; c++) {
				window.fixture_settings.default_colors[CLASSES[c].value] = copySettings(color);
			}
		}
		if (settings && settings.class_names) {
			for (var n = 0; n < CLASSES.length; n++) {
				var nameValue = CLASSES[n].value;
				window.fixture_settings.class_names[nameValue] = settings.class_names[nameValue] || '';
			}
		}
		syncSettingsUI();
	}

	function copyCurrentSettings() {
		return copySettings(window.fixture_settings || DEFAULT_SETTINGS);
	}

	function syncSettingsUI() {
		var colorSelects = document.querySelectorAll('[data-fixture-color]');
		for (var i = 0; i < colorSelects.length; i++) {
			setSelectOptions(colorSelects[i], COLORS);
			colorSelects[i].value = defaultColor(colorSelects[i].getAttribute('data-fixture-color')).value;
		}
		var nameInputs = document.querySelectorAll('[data-fixture-model]');
		for (var j = 0; j < nameInputs.length; j++) {
			var classValue = nameInputs[j].getAttribute('data-fixture-model');
			nameInputs[j].value = className(classValue);
		}
		updateClassSelects();
	}

	function updateClassSelects() {
		fillSelect('cm-socket--class', getClassOptions(), true);
		fillSelect('cm-switch--class', getClassOptions(), true);
	}

	document.addEventListener('DOMContentLoaded', function () {
		syncSettingsUI();
		document.addEventListener('click', function (event) {
			if (event.target.id === 'equipment_open_settings') {
				document.getElementById('equipment_settings_modal').style.display = 'block';
			} else if (
				event.target.id === 'equipment_close_settings' ||
				event.target.id === 'equipment_settings_modal'
			) {
				document.getElementById('equipment_settings_modal').style.display = 'none';
			}
		});
		document.addEventListener('change', function (event) {
			var target = event.target;
			if (target && target.getAttribute && target.getAttribute('data-fixture-color')) {
				setDefaultColor(target.getAttribute('data-fixture-color'), target.value);
			}
		});
		document.addEventListener('input', function (event) {
			var target = event.target;
			if (target && target.getAttribute && target.getAttribute('data-fixture-model')) {
				setClassName(target.getAttribute('data-fixture-model'), target.value);
			}
		});
	});

	window.fixture_options = {
		classes: CLASSES,
		colors: COLORS,
		colorOptions: COLOR_OPTIONS,
		shutters: SHUTTERS,
		getClassOptions: getClassOptions,
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
