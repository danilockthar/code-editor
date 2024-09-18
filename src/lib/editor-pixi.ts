import { Application, BitmapText, Container } from 'pixi.js';
import { TextCursor } from './text-cursor';
import { CounterLine } from './counter-line';
import { LAYOUT_STATE, AXIS_Y_PLUS, CARET_HEIGHT, EventEmitterEvents } from '$constants';
import SceneMovement, { type SceneMovementType } from './scene-movement';
import { getContextState } from '$lib';

type Options = {
	width?: number;
	fontSize?: number;
	height?: number;
};

/* type TextNodesUpdateType = {
	textNodes: Container<BitmapText>;
	action: 'add' | 'remove';
	removedNodeIndex?: number;
}; */

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
	let offsetX = 0;
	let offsetY = 0;

	let sceneMovementHandler: SceneMovementType;
	let bitmap_text: BitmapText;
	let timeout: NodeJS.Timeout;
	const listeners: Array<callbackFn> = [];

	/* 	const observer = new EventEmitter(); */
	const observer = getContextState();
	const app = new Application();

	let app_width: number;
	let app_height: number;

	const editorShell = new Container({
		isRenderGroup: true
	});

	
	const bitmapTextRenderGroup: Container<BitmapText> = new Container({
		isRenderGroup: true,
		label: 'textNodes'
	});
	const textCursorHandler = TextCursor(bitmapTextRenderGroup, app, {
		fontSize
	});

	const customListener = (event: KeyboardEvent) => {
		listeners.forEach((l: callbackFn) => l(event));
	};

	return {
		mount: async (instance: HTMLDivElement) => {
			// Wait for the Renderer to be available
			app_width = instance.clientWidth;
			app_height = instance.clientHeight;
			
			await app.init({
				background: '#1099bb',
				width: app_width || 200,
				height: (app_height / CARET_HEIGHT) * CARET_HEIGHT + AXIS_Y_PLUS || 200,
				resolution: 3,
				autoDensity: true
			});

			instance.appendChild(app.canvas);

			CounterLine({ container: editorShell, app });
			sceneMovementHandler = SceneMovement({ app, app_width, app_height });

			// Events start
			instance.addEventListener('wheel', (e) => {
				e.preventDefault();
				e.stopPropagation();
				sceneMovementHandler.onScroll(e);
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
				x: LAYOUT_STATE.AXIS_X_START,
				y: AXIS_Y_PLUS
			});

			editorShell.y = AXIS_Y_PLUS / 2;

			bitmapTextRenderGroup.addChild(bitmap_text);

			if (observer) {
				observer.emit(EventEmitterEvents.TEXT_NODES_UPDATE, {
					textNodes: bitmapTextRenderGroup,
					action: 'add'
				});
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

				if (x > LAYOUT_STATE.VERTICAL_LINE_AXIS_X) {
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
