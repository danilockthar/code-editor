import { Container, Graphics, Ticker, BitmapText } from 'pixi.js';
import { SPACE_WIDTH } from '../helpers/constants';
import { addCharAt, deleteCharAt, createTextNodeNavigator, SPECIAL_KEYS } from '$lib';
import Caret from './Caret';

type TextCursorType = {
	caretGroup: Container;
	caret: {
		graphic: Graphics;
		linePositionMatrix?: number[];
		position?: {
			line: number;
			column: number;
		};
		trigger?: (direction: string) => void;
	};
	handlePressedKeys: (
		keyEvent?: KeyboardEvent,
		bitmapTextRenderGroup?: Container<BitmapText>
	) => void;
	start_ticker: (app_ticker: Ticker) => void;
};

type TextCursorOption = {
	observer?: any;
	initialState?: any[];
};

const firstNode = {
	text: ''
};

export const TextCursor = (
	bitmapTextRenderGroup: Container<BitmapText>,
	options: TextCursorOption = {}
): TextCursorType => {
	const { observer = null, initialState = [firstNode] } = options;

	let state = [...initialState];
	let justMovedCaret = false;
	const caretGroup = new Container({
		isRenderGroup: true,
		x: 24,
		y: 0
	});

	const defaultCaret = Caret({ position: { line: 1, column: 0 } });

	const updateBitmapTextRenderGroup = (firstPart: BitmapText[], secondPart: BitmapText[]) => {
		bitmapTextRenderGroup!.removeChildren(0);
		bitmapTextRenderGroup!.addChild(...firstPart, ...secondPart);
		bitmapTextRenderGroup!.children.forEach((child, i) => (child.y = i * 20));
	};

	caretGroup.addChild(defaultCaret.graphic);

	const start_ticker = (app_ticker: any) => {
		let elapsed = 0;
		const blinkInterval = 30; // Frames between each blink (adjust for speed)
		let isCaretVisible = true;

		app_ticker.add((ticker: any) => {
			elapsed += ticker.deltaTime;
			if (justMovedCaret) {
				isCaretVisible = true;
				defaultCaret.graphic.visible = isCaretVisible;
				return;
			}
			if (elapsed >= blinkInterval) {
				isCaretVisible = !isCaretVisible;
				defaultCaret.graphic.visible = isCaretVisible;
				elapsed = 0; // Reset elapsed time
			}
		});
	};

	const handlePressedKeys = (keyEvent?: KeyboardEvent) => {
		const nodeText = createTextNodeNavigator(bitmapTextRenderGroup, defaultCaret.position.line);

		if (!keyEvent) {
			justMovedCaret = false;
			return;
		}
		const isShiftPressed = keyEvent.shiftKey;
		const isCommandPressed = keyEvent.metaKey;
		const isCtrlPressed = keyEvent.ctrlKey;
		const isAltPressed = keyEvent.altKey;

		/**
		 * This is normal writing (not special keys) start
		 */
		if (!SPECIAL_KEYS.includes(keyEvent.key)) {
			if (isCtrlPressed && keyEvent.key === 'v') {
				console.log('CTRL + V is pressed');
				return;
			}

			nodeText.current.text = addCharAt(
				nodeText.current.text,
				defaultCaret.position.column,
				keyEvent.key
			);

			defaultCaret.moveTo(defaultCaret.position.line, defaultCaret.position.column + 1);
			justMovedCaret = true;
		}
		// This is normal writing (not special keys) end

		if (keyEvent.key === ' ') {
			console.log('SPACE is pressed');
		}

		if (keyEvent.key === 'Tab') {
			console.log('TAB is pressed');
		}

		/**
		 * Backspace key is pressed
		 */
		if (keyEvent.key === 'Backspace') {
			// defaultCaret position is 1 based and bitmapTextGroup is 0 based

			// si el defaultCaret esta en la columna 0 y en la fila 1, no deberia eliminar el nodo de texto
			const actualNodeIndex = defaultCaret.position.line - 1;

			if (defaultCaret.position.column === 0 && defaultCaret.position.line === 1) return;

			// si defaultCaret esta en columna 0 y en cualquier fila mayor a 1, deberia eliminar el nodo de texto
			if (defaultCaret.position.column === 0 && defaultCaret.position.line > 1) {
				// chequear si queda texto antes de eliminar el nodo de texto
				if (nodeText.current.text.length === 0) {
					bitmapTextRenderGroup!.removeChildAt(actualNodeIndex);

					bitmapTextRenderGroup!.children.forEach((child, i) => {
						if (i >= defaultCaret.position.line - 1) {
							child.y = i * 20;
						}
					});
					defaultCaret.moveTo(actualNodeIndex, nodeText.prev.text.length + 1);
				} else {
					nodeText.prev.text += nodeText.current.text;

					bitmapTextRenderGroup!.removeChildAt(actualNodeIndex);

					bitmapTextRenderGroup!.children.forEach((child, i) => {
						if (i >= actualNodeIndex) {
							child.y = i * 20;
						}
					});
					defaultCaret.moveTo(actualNodeIndex, nodeText.prev.text.length + 1);
				}
			} else {
				nodeText.current.text = deleteCharAt(nodeText.current.text, defaultCaret.position.column);
			}

			if (defaultCaret.position.column > 0 && defaultCaret.position.line > 0) {
				defaultCaret.moveTo(defaultCaret.position.line, defaultCaret.position.column - 1);
			}
			/* defaultCaret.trigger('left'); */
			if (observer) {
				observer.emit('textNodeChange', bitmapTextRenderGroup);
			}
		}

		/**
		 * Enter key is pressed
		 */
		if (keyEvent.key === 'Enter') {
			console.log(defaultCaret.position, '[defaultCaret.position]');

			/**
			 * Casos:
			 *  caret esta en la columna 0 y no hay texto *1 - 1 y 2 pueden ser el mismo caso.
			 *  caret esta en la columna 0 y hay texto *2 - 1 y 2 pueden ser el mismo caso.
			 *  caret esta no esta en la columna 0 y hay texto *3 - se debe dividir el texto.
			 *  caret esta en la ultima linea - se debe agregar un nuevo nodo de texto al final.
			 *  caret esta en la ultima columna y no es la ultima linea - se debe agregar un nuevo nodo de texto
			 * y reemplazar el texto actual.
			 *
			 */

			// *1 - se crea un nuevo nodo de texto y se inserta en la posicion actual

			const newOne = new BitmapText({
				text: '',
				style: {
					fontFamily: 'Courier New, monospace',
					fontSize: 16,
					align: 'left'
				},
				x: 24,
				y: defaultCaret.position.line * 20
			});

			// SI CARET COLUMNA ES 0
			if (defaultCaret.position.column === 0) {
				const firstPart = bitmapTextRenderGroup!.children.slice(0, defaultCaret.position.line - 1);
				const secondPart = bitmapTextRenderGroup!.children.slice(defaultCaret.position.line - 1);

				firstPart.push(newOne);
				updateBitmapTextRenderGroup(firstPart, secondPart);
			} else {
				// SI CARET LINE ES IGUAL A LA CANTIDAD DE NODOS DE TEXTO
				if (defaultCaret.position.line === bitmapTextRenderGroup!.children.length) {
					if (defaultCaret.position.column >= nodeText.current.text.length) {
						bitmapTextRenderGroup!.addChild(newOne);
					} else {
						newOne.text = nodeText.current.text.slice(defaultCaret.position.column);
						nodeText.current.text = nodeText.current.text.slice(0, defaultCaret.position.column);
						bitmapTextRenderGroup!.addChild(newOne);
					}
				} else {
					// SI CARET COLUMNA ES MAYOR O IGUAL A LA CANTIDAD DE TEXTO DEL NODO DE TEXTO ACTUAL
					if (defaultCaret.position.column >= nodeText.current.text.length) {
						const firstPart = bitmapTextRenderGroup!.children.slice(0, defaultCaret.position.line);
						const secondPart = bitmapTextRenderGroup!.children.slice(defaultCaret.position.line);

						firstPart.push(newOne);
						updateBitmapTextRenderGroup(firstPart, secondPart);
					} else {
						newOne.text = nodeText.current.text.slice(defaultCaret.position.column);
						nodeText.current.text = nodeText.current.text.slice(0, defaultCaret.position.column);

						const firstPart = bitmapTextRenderGroup!.children.slice(0, defaultCaret.position.line);
						const secondPart = bitmapTextRenderGroup!.children.slice(defaultCaret.position.line);

						firstPart.push(newOne);
						updateBitmapTextRenderGroup(firstPart, secondPart);
					}
				}
			}

			defaultCaret.moveTo(defaultCaret.position.line + 1, 0);

			justMovedCaret = true;
			if (observer) {
				observer.emit('textNodeChange', bitmapTextRenderGroup);
			}
		}

		const is_shift_pressed = keyEvent.shiftKey;
		const is_command_pressed = keyEvent.metaKey;
		const is_ctrl_pressed = keyEvent.ctrlKey;
		const is_alt_pressed = keyEvent.altKey;
		if (keyEvent.key === 'ArrowRight') {
			if (
				defaultCaret.position.column >= nodeText.current.text.length &&
				defaultCaret.position.line === bitmapTextRenderGroup.children.length
			)
				return;
			if (defaultCaret.position.column >= nodeText.current.text.length) {
				defaultCaret.moveTo(defaultCaret.position.line + 1, 0);
				justMovedCaret = true;
				return;
			}
			defaultCaret.moveTo(defaultCaret.position.line, defaultCaret.position.column + 1);
			justMovedCaret = true;
		}
		if (keyEvent.key === 'ArrowLeft') {
			if (defaultCaret.position.column === 0 && defaultCaret.position.line === 1) return;
			if (defaultCaret.position.column === 0 && defaultCaret.position.line > 1) {
				defaultCaret.moveTo(defaultCaret.position.line - 1, nodeText.prev.text.length);
				justMovedCaret = true;
				return;
			}
			if (defaultCaret.position.column > 0) {
				defaultCaret.moveTo(defaultCaret.position.line, defaultCaret.position.column - 1);
				justMovedCaret = true;
			}
		}
		if (keyEvent.key === 'ArrowUp') {
			// si el defaultCaret esta en la primera linea, no se puede mover hacia arriba
			// si el defaultCaret esta en la segunda linea, se puede mover hacia arriba
			// si defaultCaret esta en la linea 2 significa que bitmapTextRenderGroup tiene al menos 1 elemento
			if (defaultCaret.position.line === 1) return;
			if (defaultCaret.position.column >= nodeText.prev.text.length) {
				defaultCaret.moveTo(defaultCaret.position.line - 1, nodeText.prev.text.length);
				justMovedCaret = true;
				return;
			}
			defaultCaret.moveTo(defaultCaret.position.line - 1, defaultCaret.position.column);
		}
		if (keyEvent.key === 'ArrowDown') {
			console.log(defaultCaret.position, '[defaultCaret.position]');
			console.log(
				{ current: nodeText.current, prev: nodeText.prev, next: nodeText.next },
				'[nodeText]'
			);
			if (defaultCaret.position.line === bitmapTextRenderGroup.children.length) return;
			if (defaultCaret.position.column >= nodeText.next.text.length) {
				defaultCaret.moveTo(defaultCaret.position.line + 1, nodeText.next.text.length);
				justMovedCaret = true;
				return;
			}
			defaultCaret.moveTo(defaultCaret.position.line + 1, defaultCaret.position.column);
			justMovedCaret = true;
		}
	};

	return {
		caretGroup,
		caret: defaultCaret,
		handlePressedKeys,
		start_ticker
	};
};
