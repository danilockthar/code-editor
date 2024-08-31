import { Application, BitmapText, Container, EventEmitter } from 'pixi.js';
import { TextCursor } from './text-cursor';
import { wheelEvent } from '$lib';
import { CounterLine } from './counter-line';
import { AXIS_Y_PLUS, VERTICAL_LINE_AXIS_X } from '$constants';

type Options = {
	width?: number;
	fontSize?: number;
	height?: number;
};

export type Editor = {
	mount: (instance: HTMLDivElement) => Promise<void>;
	change: (value: string) => void;
	onKeyPress: (listenerFn: (event: KeyboardEvent) => void) => void;
	keyup: () => void;
	processWheelEvent: (e: WheelEvent) => void;
};

type callbackFn = (event: KeyboardEvent) => void;

export const pixiEditor = (options?: Options): Editor => {
	const { fontSize = 15 } = options || {};
	let bitmap_text: BitmapText;
	let timeout: NodeJS.Timeout;
	const listeners: Array<callbackFn> = [];

	/* 	const observer = createObserver(); */
	const observer = new EventEmitter();

	let app_width: number;
	let app_height: number;

	const app = new Application();

	const editorShell = new Container({
		isRenderGroup: true
	});

	const counterLineHandler = CounterLine({ observer, container: editorShell });

	// The application will create a renderer using WebGL, if possible,
	// with a fallback to a canvas render. It will also setup the ticker
	// and the root stage PIXI.Container

	let offsetX = 0;
	let offsetY = 0;

	const bitmapTextRenderGroup: Container<BitmapText> = new Container({
		isRenderGroup: true
	});
	const textCursorHandler = TextCursor(bitmapTextRenderGroup, app, {
		observer,
		fontSize
	});

	const customListener = (event: KeyboardEvent) => {
		listeners.forEach((l: callbackFn) => l(event));
	};

	observer.on(
		'textNodeChange',
		(data: Container<BitmapText>) => {
			counterLineHandler.update(data);
		},
		{ once: true }
	);

	return {
		mount: async (instance: HTMLDivElement) => {
			// Wait for the Renderer to be available
			app_width = instance.clientWidth;
			app_height = instance.clientHeight;
			await app.init({
				background: '#1099bb',
				width: app_width || 200,
				height: app_height || 200,
				resolution: 3,
				autoDensity: true
			});

			instance.appendChild(app.canvas);

			// Events start
			instance.addEventListener('wheel', (e) => {
				e.preventDefault();
				e.stopPropagation();
				wheelEvent(e, app, observer);
			});

			instance.addEventListener('keydown', (e) => {
				customListener(e);
				e.preventDefault();

				textCursorHandler.handlePressedKeys(e, bitmapTextRenderGroup);
			});

			instance.addEventListener('keyup', (e) => {
				e.preventDefault();
				if (timeout) clearTimeout(timeout);
				timeout = setTimeout(() => {
					textCursorHandler.handlePressedKeys();
				}, 500);
			});

			// Events end

			offsetX = app.canvas.getBoundingClientRect().left;
			offsetY = app.canvas.getBoundingClientRect().top;

			bitmap_text = new BitmapText({
				text: '',
				style: {
					fontFamily: 'Courier New, monospace',
					fontSize,
					align: 'left'
				},
				x: 24,
				y: AXIS_Y_PLUS
			});

			console.log(bitmap_text.width, '[bitmap_text.width]');
			// linea izquierda del editor

			bitmapTextRenderGroup.y = 2;
			editorShell.y = 3;

			bitmapTextRenderGroup.addChild(bitmap_text);

			if (observer) {
				observer.emit('textNodeChange', bitmapTextRenderGroup);
			}

			app.stage.addChild(bitmapTextRenderGroup);
			app.stage.addChild(editorShell);
			app.stage.addChild(textCursorHandler.caretGroup);

			textCursorHandler.start_ticker(app.ticker);

			app.canvas.addEventListener('mousedown', (e) => {
				const x = e.clientX - offsetX;
				const y = e.clientY - offsetY;

				textCursorHandler.handleMouseEvent(x, y, 'down');
			});

			app.canvas.addEventListener('mouseup', (e) => {
				const x = e.clientX - offsetX;
				const y = e.clientY - offsetY;
				if (timeout) clearTimeout(timeout);
				timeout = setTimeout(() => {
					textCursorHandler.handlePressedKeys();
				}, 300);
				textCursorHandler.handleMouseEvent(x, y, 'up');
			});
			app.canvas.addEventListener('mousemove', (e) => {
				const x = e.clientX - offsetX;

				if (x > VERTICAL_LINE_AXIS_X) {
					instance.style.cursor = 'text';
				} else {
					instance.style.cursor = 'default';
				}
			});
		},
		change: (value: string) => {
			bitmap_text.text = value;
			app.stage.y -= 10;
		},
		onKeyPress: (listenerFn: (event: KeyboardEvent) => void) => {
			listeners.push(listenerFn);
		},
		processWheelEvent: () => {
			/* e.preventDefault();
			e.stopPropagation();
			wheelEvent(e, app, observer); */
		},
		keyup: () => {}
	};
};
