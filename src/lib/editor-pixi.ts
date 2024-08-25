import { Application, BitmapText, Container, Graphics } from 'pixi.js';
import { TextCursor } from './text-cursor';
import { createObserver, wheelEvent } from '$lib';
import { CounterLine } from './counter-line';

type Options = {
	width: number;
	height: number;
};

export type Editor = {
	mount: (instance: HTMLDivElement) => Promise<void>;
	change: (value: string) => void;
	onKeyPress: any;
	keyup: () => void;
	processWheelEvent: (e: WheelEvent) => void;
};

export const pixiEditor = (options?: Options): Editor => {
	let bitmap_text: BitmapText;
	let app: Application;
	let timeout: number;
	let listeners: any = [];

	const observer = createObserver();

	let app_width: number;
	let app_height: number;

	app = new Application();

	const editorShell = new Container({
		isRenderGroup: true
	});

	const counterLineHandler = CounterLine({ observer, container: editorShell });

	const textPositions = [];
	// The application will create a renderer using WebGL, if possible,
	// with a fallback to a canvas render. It will also setup the ticker
	// and the root stage PIXI.Container

	let offsetX = 0;
	let offsetY = 0;

	const bitmapTextRenderGroup: Container<BitmapText> = new Container({
		isRenderGroup: true
	});
	const textCursorHandler = TextCursor(bitmapTextRenderGroup, { observer });

	const customListener = (event: any) => {
		listeners.forEach((l: any) => l(event));
	};

	observer.subscribe('textNodeChange', (data: any) => {
		console.log(data, '[data]');
		counterLineHandler.update(data);
	});

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
				wheelEvent(e, app);
			});

			instance.addEventListener('keydown', (e) => {
				customListener(e);
				e.preventDefault();
				const isShiftPressed = e.shiftKey;
				const isCommandPressed = e.metaKey;
				const isCtrlPressed = e.ctrlKey;
				const isAltPressed = e.altKey;

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
					fontSize: 16,
					align: 'left'
				},
				x: 24,
				y: 0
			});

			// linea izquierda del editor
			let leftLine = new Graphics().rect(20, 0, 1, app.canvas.height).fill(0x0000ff);

			editorShell.addChild(leftLine);
			bitmapTextRenderGroup.addChild(bitmap_text);
			if (observer) {
				observer.emit('textNodeChange', bitmapTextRenderGroup);
			}

			/* render_counter_line(); */

			app.stage.addChild(bitmapTextRenderGroup);
			app.stage.addChild(editorShell);
			app.stage.addChild(textCursorHandler.caretGroup);

			textCursorHandler.start_ticker(app.ticker);

			app.canvas.addEventListener('click', (e) => {
				const x = e.clientX - offsetX;
				const y = e.clientY - offsetY;
				console.log({ x, y });
			});
		},
		change: (value: string) => {
			bitmap_text.text = value;
			app.stage.y -= 10;
		},
		onKeyPress: (listenerFn: any) => {
			listeners.push(listenerFn);
		},
		processWheelEvent: (e: WheelEvent) => {
			e.preventDefault();
			e.stopPropagation();
			wheelEvent(e, app);
		},
		keyup: () => {}
	};
};
