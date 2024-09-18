import { CARET_HEIGHT, EventEmitterEvents } from '$constants';
import { getContextState } from '$lib';
import type { Application } from 'pixi.js';
import { off } from 'process';

type SceneMovementProps = {
	app_height: number;
	app_width: number;
	app: Application;
};

export type SceneMovementType = {
	onScroll: (e: WheelEvent) => void;
	scrollBy: (deltaX: number, deltaY: number, index?: number) => void;
};

const SceneMovement = (options: SceneMovementProps): SceneMovementType => {
	const observer = getContextState();
	const { app_height = null, app_width = null, app = null } = options;

	if (!app || !app_height || !app_width) throw new Error('app is required');

	const availableTextNodesOnScreen = app_height / CARET_HEIGHT;

	observer.on(EventEmitterEvents.TEXT_NODES_UPDATE, (data: any) => {
		if (app.stage && app.stage.children.length > 1) {
			switch (data.action) {
				case 'add':
					scrollBy(0, CARET_HEIGHT);
					break;
				case 'remove':
					scrollBy(0, -CARET_HEIGHT, data.removedNodeIndex);
					break;
				default:
					break;
			}
		}
	});

	observer.on(EventEmitterEvents.CARET_MOVED, (data: any) => {
		const { line } = data.caretPosition;

		let isLineOffScreen = false;
		const movementY = Math.abs(app.stage.y);
		const offsetY = Math.abs(app.stage.y) / CARET_HEIGHT;
		let closestLine = 'top';

		closestLine = line === Math.ceil(offsetY) ? 'top' : 'bottom';
		if (!Number.isInteger(offsetY)) {
			isLineOffScreen =
				line === Math.ceil(offsetY) || line === Math.ceil(offsetY) + availableTextNodesOnScreen;
		} else {
			console.log('entry here');
			console.log({ line, offsetY, availableTextNodesOnScreen });
			isLineOffScreen =
				line === Math.ceil(offsetY) ||
				line === Math.ceil(offsetY) + (availableTextNodesOnScreen + 1);
		}

		if (isLineOffScreen) {
			if (closestLine === 'top') {
				app.stage.y = -(line * CARET_HEIGHT - CARET_HEIGHT);
			} else {
				app.stage.y = Number.isInteger(offsetY)
					? app.stage.y - CARET_HEIGHT
					: -(20.0 * Math.ceil(movementY / 20.0));
			}
		}
	});

	/* 	observer.on(EventEmitterEvents.CARET_MOVED, (data: any) => {
		const { line } = data.caretPosition;

		const isCaretMovingUp = data.direction === 'up';

		const isLineOnScreen = isCaretMovingUp
			? line * CARET_HEIGHT - CARET_HEIGHT >= Math.abs(app.stage.y)
			: Math.abs(app.stage.y) / CARET_HEIGHT + availableTextNodesOnScreen >= line;

		if (!isLineOnScreen && !isCaretMovingUp) {
			app.stage.y = app.stage.y - CARET_HEIGHT;
		}

		if (!isLineOnScreen && isCaretMovingUp) {
			app.stage.y = -(line * CARET_HEIGHT - CARET_HEIGHT);
		}
	}); */

	const scrollBy = (deltaX: number, deltaY: number, index?: number) => {
		const offsetNodeText =
			app.stage.getChildByLabel('textNodes')!.children.length > availableTextNodesOnScreen
				? app.stage.getChildByLabel('textNodes')!.children.length
				: availableTextNodesOnScreen;

		if (offsetNodeText === availableTextNodesOnScreen) {
			app.stage.x = 0;
			app.stage.y = 0;
			return;
		}

		if (app.stage.y - deltaY >= 0) return;
		app.stage.x -= deltaX;
		app.stage.y -= deltaY;
	};

	return {
		scrollBy,
		onScroll: (e: WheelEvent) => {
			// Get the delta values for the wheel
			const { deltaX, deltaY } = e;
			const movementY = Math.abs(deltaY) * 0.5;
			const movementX = Math.abs(deltaX) * 0.5;

			// si se mueve hacia abajo
			if (deltaY > 0) {
				// Scale the movement based on the intensity of the wheel event

				const offsetNodeText =
					app.stage.getChildByLabel('textNodes')!.children.length > availableTextNodesOnScreen
						? app.stage.getChildByLabel('textNodes')!.children.length - availableTextNodesOnScreen
						: availableTextNodesOnScreen;

				if (offsetNodeText === availableTextNodesOnScreen) return;
				if (app.stage.y - movementY <= -CARET_HEIGHT * offsetNodeText) {
					app.stage.y = -CARET_HEIGHT * offsetNodeText;
				} else {
					app.stage.y = app.stage.y - movementY;
				}
			} else {
				// si se mueve hacia arriba

				if (app.stage.y + movementY >= 0) {
					app.stage.y = 0;
				} else {
					app.stage.y += movementY;
				}
			}
			// si se mueve hacia la derecha
			if (deltaX > 0) {
				app.stage.x -= movementX;
			} else {
				// si se mueve hacia la izquierda

				if (app.stage.x + movementX >= 0) {
					app.stage.x = 0;
				} else {
					app.stage.x += movementX;
				}
			}
		}
	};
};

export default SceneMovement;
