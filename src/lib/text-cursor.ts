import {
	Container,
	Graphics,
	Ticker,
	BitmapText,
	Application,
	type Renderer,
	EventEmitter
} from 'pixi.js';
import { addCharAt, deleteCharAt } from '$lib';
import Caret from './Caret';
import {
	AXIS_X_START,
	AXIS_Y_PLUS,
	CARET_HEIGHT,
	LETTER_WIDTH_RATIO,
	SPECIAL_KEYS
} from '$constants';

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
	handleMouseEvent: (x: number, y: number, action: string) => void;
	handlePressedKeys: (
		keyEvent?: KeyboardEvent,
		bitmapTextRenderGroup?: Container<BitmapText>
	) => void;
	start_ticker: (app_ticker: Ticker) => void;
};

type TextCursorOption = {
	fontSize?: number;
	observer?: EventEmitter<string | symbol>;
	/* 	initialState?: any[]; */
};

/* const firstNode = {
	text: ''
}; */

export const TextCursor = (
	bitmapTextRenderGroup: Container<BitmapText>,
	app: Application<Renderer>,
	options: TextCursorOption = {}
): TextCursorType => {
	const { observer = null, /* initialState = [firstNode],  */ fontSize = 14 } = options;

	/* let state = [...initialState]; */
	let justMovedCaret = false;
	const caretGroup = new Container({
		isRenderGroup: true,
		x: AXIS_X_START,
		y: 3
	});

	const defaultCaret = Caret({ position: { line: 1, column: 0 }, fontSize });

	const updateBitmapTextRenderGroup = (firstPart: BitmapText[], secondPart: BitmapText[]) => {
		bitmapTextRenderGroup!.removeChildren(0);
		bitmapTextRenderGroup!.addChild(...firstPart, ...secondPart);
		bitmapTextRenderGroup!.children.forEach(
			(child, i) => (child.y = i * CARET_HEIGHT + AXIS_Y_PLUS)
		);
	};

	caretGroup.addChild(defaultCaret.graphic);

	const start_ticker = (app_ticker: Ticker) => {
		let elapsed = 0;
		const blinkInterval = 30; // Frames between each blink (adjust for speed)
		let isCaretVisible = true;

		app_ticker.add((ticker: Ticker) => {
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
		/* const nodeText = createTextNodeNavigator(bitmapTextRenderGroup, defaultCaret.position.line); */

		if (!keyEvent) {
			justMovedCaret = false;
			return;
		}
		/* const isShiftPressed = keyEvent.shiftKey;
		const isCommandPressed = keyEvent.metaKey; */
		const isCtrlPressed = keyEvent.ctrlKey;
		/* const isAltPressed = keyEvent.altKey; */

		/**
		 * This is normal writing (not special keys) start
		 */
		if (!SPECIAL_KEYS.includes(keyEvent.key)) {
			if (isCtrlPressed && keyEvent.key === 'v') {
				console.log('CTRL + V is pressed');
				return;
			}

			bitmapTextRenderGroup!.children[defaultCaret.position.line - 1].text = addCharAt(
				bitmapTextRenderGroup!.children[defaultCaret.position.line - 1].text,
				defaultCaret.position.column,
				keyEvent.key
			);
			/* bitmapTextRenderGroup!.children[defaultCaret.position.line - 1].text = addCharAt(
				bitmapTextRenderGroup!.children[defaultCaret.position.line - 1].text,
				defaultCaret.position.column,
				keyEvent.key
			); */

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
				if (bitmapTextRenderGroup!.children[defaultCaret.position.line - 1].text.length === 0) {
					bitmapTextRenderGroup!.removeChildAt(actualNodeIndex);

					bitmapTextRenderGroup!.children.forEach((child, i) => {
						if (i >= defaultCaret.position.line - 1) {
							child.y = i * CARET_HEIGHT;
						}
					});
					defaultCaret.moveTo(
						actualNodeIndex,
						bitmapTextRenderGroup!.children[defaultCaret.position.line - 2].text.length + 1
					);
				} else {
					bitmapTextRenderGroup!.children[defaultCaret.position.line - 2].text +=
						bitmapTextRenderGroup!.children[defaultCaret.position.line - 1].text;

					bitmapTextRenderGroup!.removeChildAt(actualNodeIndex);

					bitmapTextRenderGroup!.children.forEach((child, i) => {
						if (i >= actualNodeIndex) {
							child.y = i * CARET_HEIGHT;
						}
					});
					defaultCaret.moveTo(
						actualNodeIndex,
						bitmapTextRenderGroup!.children[defaultCaret.position.line - 2].text.length + 1
					);
				}
			} else {
				bitmapTextRenderGroup!.children[defaultCaret.position.line - 1].text = deleteCharAt(
					bitmapTextRenderGroup!.children[defaultCaret.position.line - 1].text,
					defaultCaret.position.column
				);
			}

			if (defaultCaret.position.column > 0 && defaultCaret.position.line > 0) {
				defaultCaret.moveTo(defaultCaret.position.line, defaultCaret.position.column - 1);
			}

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
					fontSize,
					align: 'left'
				},
				x: AXIS_X_START,
				y: defaultCaret.position.line * CARET_HEIGHT + AXIS_Y_PLUS
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
					if (
						defaultCaret.position.column >=
						bitmapTextRenderGroup!.children[defaultCaret.position.line - 1].text.length
					) {
						bitmapTextRenderGroup!.addChild(newOne);
					} else {
						newOne.text = bitmapTextRenderGroup!.children[
							defaultCaret.position.line - 1
						].text.slice(defaultCaret.position.column);
						bitmapTextRenderGroup!.children[defaultCaret.position.line - 1].text =
							bitmapTextRenderGroup!.children[defaultCaret.position.line - 1].text.slice(
								0,
								defaultCaret.position.column
							);
						bitmapTextRenderGroup!.addChild(newOne);
					}
				} else {
					// SI CARET COLUMNA ES MAYOR O IGUAL A LA CANTIDAD DE TEXTO DEL NODO DE TEXTO ACTUAL
					if (
						defaultCaret.position.column >=
						bitmapTextRenderGroup!.children[defaultCaret.position.line - 1].text.length
					) {
						const firstPart = bitmapTextRenderGroup!.children.slice(0, defaultCaret.position.line);
						const secondPart = bitmapTextRenderGroup!.children.slice(defaultCaret.position.line);

						firstPart.push(newOne);
						updateBitmapTextRenderGroup(firstPart, secondPart);
					} else {
						newOne.text = bitmapTextRenderGroup!.children[
							defaultCaret.position.line - 1
						].text.slice(defaultCaret.position.column);
						bitmapTextRenderGroup!.children[defaultCaret.position.line - 1].text =
							bitmapTextRenderGroup!.children[defaultCaret.position.line - 1].text.slice(
								0,
								defaultCaret.position.column
							);

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

		/* const is_shift_pressed = keyEvent.shiftKey;
		const is_command_pressed = keyEvent.metaKey;
		const is_ctrl_pressed = keyEvent.ctrlKey;
		const is_alt_pressed = keyEvent.altKey; */
		if (keyEvent.key === 'ArrowRight') {
			if (
				defaultCaret.position.column >=
					bitmapTextRenderGroup!.children[defaultCaret.position.line - 1].text.length &&
				defaultCaret.position.line === bitmapTextRenderGroup.children.length
			)
				return;
			if (
				defaultCaret.position.column >=
				bitmapTextRenderGroup!.children[defaultCaret.position.line - 1].text.length
			) {
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
				defaultCaret.moveTo(
					defaultCaret.position.line - 1,
					bitmapTextRenderGroup!.children[defaultCaret.position.line - 2].text.length
				);
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
			if (
				defaultCaret.position.column >=
				bitmapTextRenderGroup!.children[defaultCaret.position.line - 2].text.length
			) {
				defaultCaret.moveTo(
					defaultCaret.position.line - 1,
					bitmapTextRenderGroup!.children[defaultCaret.position.line - 2].text.length
				);
				justMovedCaret = true;
				return;
			}
			defaultCaret.moveTo(defaultCaret.position.line - 1, defaultCaret.position.column);
		}
		if (keyEvent.key === 'ArrowDown') {
			if (defaultCaret.position.line === bitmapTextRenderGroup.children.length) return;
			if (
				defaultCaret.position.column >=
				bitmapTextRenderGroup!.children[defaultCaret.position.line].text.length
			) {
				defaultCaret.moveTo(
					defaultCaret.position.line + 1,
					bitmapTextRenderGroup!.children[defaultCaret.position.line].text.length
				);
				justMovedCaret = true;
				return;
			}
			defaultCaret.moveTo(defaultCaret.position.line + 1, defaultCaret.position.column);
			justMovedCaret = true;
		}
	};

	const handleMouseEvent = (x: number, y: number, action: string) => {
		const [movementX, movementY] = [x + Math.abs(app.stage.x), y + Math.abs(app.stage.y)];
		if (action === 'down') {
			let clickedNode = Math.round((movementY + AXIS_Y_PLUS) / CARET_HEIGHT);
			let columnIndex = Math.round((movementX - AXIS_X_START) / (fontSize * LETTER_WIDTH_RATIO));
			if (clickedNode === 0) clickedNode = 1;
			if (clickedNode > bitmapTextRenderGroup!.children.length)
				clickedNode = bitmapTextRenderGroup!.children.length;

			if (columnIndex > bitmapTextRenderGroup!.children[clickedNode - 1].text.length)
				columnIndex = bitmapTextRenderGroup!.children[clickedNode - 1].text.length;

			if (columnIndex < 0) columnIndex = 0;
			defaultCaret.moveTo(clickedNode, columnIndex);
			justMovedCaret = true;

			return;
		}

		/* if (action === 'up') {
		} */
	};

	return {
		caretGroup,
		caret: defaultCaret,
		handlePressedKeys,
		handleMouseEvent,
		start_ticker
	};
};
