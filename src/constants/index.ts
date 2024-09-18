/**
 * Array of special keys.
 * @readonly
 * @since 1.0.0
 * @example
 * const { SPECIAL_KEYS } = require('$lib');
 * console.log(SPECIAL_KEYS); // ['Shift', 'Control', 'Alt', 'Meta', ' ', 'ArrowDown', 'ArrowUp', 'ArrowRight', 'ArrowLeft', 'Enter', 'Tab', 'Backspace', 'CapsLock', 'Escape', 'PageUp', 'PageDown', 'End', 'Home', 'Insert', 'Delete', 'OS', 'ContextMenu', 'PrintScreen']
 */
export const SPECIAL_KEYS = [
	'Shift',
	'Control',
	'Alt',
	'Meta',
	'ArrowDown',
	'ArrowUp',
	'ArrowRight',
	'ArrowLeft',
	'Enter',
	'Tab',
	'Backspace',
	'CapsLock',
	'Escape',
	'PageUp',
	'PageDown',
	'End',
	'Home',
	'Insert',
	'Delete',
	'OS',
	'ContextMenu',
	'PrintScreen'
];

export const CARET_HEIGHT = 20;

export const AXIS_X_START = 24;

export const AXIS_Y_PLUS = 4;

export const LETTER_WIDTH_RATIO = 0.6001;

export const VERTICAL_LINE_AXIS_X = 30;

export const LAYOUT_STATE = {
	AXIS_X_START: VERTICAL_LINE_AXIS_X + 4,
	VERTICAL_LINE_AXIS_X
};

export enum EventEmitterEvents {
	TEXT_NODES_UPDATE = 'TEXT_NODES_UPDATE',
	LAYOUT_UPDATE = 'LAYOUT_UPDATE',
	CARET_MOVED = 'CARET_MOVED'
}
