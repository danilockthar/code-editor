// place files you want to import through the `$lib` alias in this folder.
import { Application, BitmapText, Container } from 'pixi.js';

/**
 * Handles the wheel event and updates the stage position accordingly.
 * @param e - The wheel event.
 * @param app - The PIXI Application instance.
 */
export const wheelEvent = (e: WheelEvent, app: Application) => {
	const { deltaX, deltaY } = e;
	if (deltaY > 0) {
		// Scale the movement based on the intensity of the wheel event
		let movementY = Math.abs(deltaY) * 0.5;
		app.stage.y = app.stage.y - movementY;
	} else {
		let movementY = Math.abs(deltaY) * 0.5;

		if (app.stage.y + movementY >= 0) {
			app.stage.y = 0;
		} else {
			app.stage.y += movementY;
		}
	}
	if (deltaX > 0) {
		let movementX = Math.abs(deltaX) * 0.5;

		app.stage.x -= movementX;
	} else {
		let movementX = Math.abs(deltaX) * 0.5;

		if (app.stage.x + movementX >= 0) {
			app.stage.x = 0;
		} else {
			app.stage.x += movementX;
		}
	}
};

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

export const createObserver = () => {
	let events: { [key: string]: Set<any> } = {};

	const subscribe = (event: string, callback: any) => {
		if (!events[event]) {
			events[event] = new Set();
		}
		events[event].add(callback);
	};
	const unsubscribe = (event: string, callback: any) => {
		if (events[event]) {
			events[event].delete(callback);
		}
	};
	/* const dispatch = (event: string, data: any) => {
		if (!events[event]) {
			return;
		}
		events[event]
	}; */
	const emit = (event: string, data: any) => {
		if (!events[event]) return;

		for (const callback of events[event]) {
			try {
				callback(data);
			} catch (error) {
				console.error(`Error executing callback for event '${event}':`, error);
			}
		}
	};

	const clear = () => {
		events = {};
	};

	return {
		events,
		subscribe,
		unsubscribe,
		emit,
		clear
	};
};

export const deleteCharAt = (str: string, index: number) => {
	return str.slice(0, index - 1) + str.slice(index);
};

export const addCharAt = (str: string, index: number, char: string) => {
	return str.slice(0, index) + char + str.slice(index);
};

export const cutCharAt = (str: string, index: number) => {
	return str.slice(0, index - 1) + str.slice(index);
};

/**
 * Returns the current, previous, and next text nodes based on the caret line position.
 * @param textGroup - The text group container.
 * @param caretLinePos - The caret line position.
 * @returns An object with methods to get the current, previous, and next text nodes.
 * @example
 * const { getTextNode } = require('$lib');
 * const textGroup = new Container();
 * const caretLinePos = 1;
 * const { current, prev, next } = getTextNode(textGroup, caretLinePos);
 * console.log(current()); // Current text node
 * console.log(prev()); // Previous text node
 * console.log(next()); // Next text node
 */
export const getTextNode = (textGroup: Container<BitmapText>, caretLinePos: number) => {
	// textGroup is array is Container<BitmapText> array based.
	return {
		current() {
			return textGroup.children[caretLinePos - 1];
		},
		prev() {
			return textGroup.children[caretLinePos - 2];
		},
		next() {
			return textGroup.children[caretLinePos];
		}
	};
};

export const createTextNodeNavigator = (
	textGroup: Container<BitmapText> | any[],
	caretLinePos: number
) => {
	let navigator = {
		current: Array.isArray(textGroup)
			? textGroup[caretLinePos - 1]
			: textGroup.children[caretLinePos - 1],
		prev: Array.isArray(textGroup)
			? textGroup[caretLinePos - 2]
			: textGroup.children[caretLinePos - 2],
		next: Array.isArray(textGroup) ? textGroup[caretLinePos] : textGroup.children[caretLinePos]
	};

	return navigator;
};
