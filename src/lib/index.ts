// place files you want to import through the `$lib` alias in this folder.
import { Application, BitmapText, Container, EventEmitter } from 'pixi.js';

/**
 * Handles the wheel event and updates the stage position accordingly.
 * @param e - The wheel event.
 * @param app - The PIXI Application instance.
 */
export const wheelEvent = (
	e: WheelEvent,
	app: Application,
	observer: EventEmitter<string | symbol>
) => {
	// Get the delta values for the wheel
	const { deltaX, deltaY } = e;
	const movementY = Math.abs(deltaY) * 0.5;
	const movementX = Math.abs(deltaX) * 0.5;

	if (deltaY > 0) {
		// Scale the movement based on the intensity of the wheel event
		app.stage.y = app.stage.y - movementY;
	} else {
		if (app.stage.y + movementY >= 0) {
			app.stage.y = 0;
		} else {
			app.stage.y += movementY;
		}
	}
	if (deltaX > 0) {
		app.stage.x -= movementX;
	} else {
		if (app.stage.x + movementX >= 0) {
			app.stage.x = 0;
		} else {
			app.stage.x += movementX;
		}
	}

	observer.emit('wheelEvent', {
		movementX: Math.abs(app.stage.x),
		movementY: Math.abs(app.stage.y)
	});
};

/* type Events = {
	textNodeChange: Container<BitmapText>;
	lineNodeChange: string;
	wheelEvent: { movementX: number; movementY: number };
	// other event mappings can go here
};

type EventKey = keyof Events;

export type CustomObserver = {
	subscribe<K extends EventKey>(event: K, callback: (data: Events[K]) => void): void;
	unsubscribe<K extends EventKey>(event: K, callback: (data: Events[K]) => void): void;
	emit<K extends EventKey>(event: K, data: Events[K]): void;
	clear(): void;
};
export const createObserver = (): CustomObserver => {
	let events: Partial<Record<EventKey, Set<(data: any) => void>>> = {};

	const subscribe = <K extends EventKey>(event: EventKey, callback: (data: Events[K]) => void) => {
		if (!events[event]) {
			events[event] = new Set();
		}
		events[event].add(callback);
	};
	const unsubscribe = <K extends EventKey>(
		event: EventKey,
		callback: (data: Events[K]) => void
	) => {
		if (events[event]) {
			events[event].delete(callback);
		}
	};

	const emit = <K extends EventKey>(event: EventKey, data: Events[K]) => {
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
		subscribe,
		unsubscribe,
		emit,
		clear
	};
}; */

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

/* export const createTextNodeNavigator = (
	textGroup: Container<BitmapText> | any[],
	caretLinePos: number
) => {
	const navigator = {
		current: Array.isArray(textGroup)
			? textGroup[caretLinePos - 1]
			: textGroup.children[caretLinePos - 1],
		prev: Array.isArray(textGroup)
			? textGroup[caretLinePos - 2]
			: textGroup.children[caretLinePos - 2],
		next: Array.isArray(textGroup) ? textGroup[caretLinePos] : textGroup.children[caretLinePos]
	};

	return navigator;
}; */
