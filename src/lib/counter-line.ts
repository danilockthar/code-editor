import { CARET_HEIGHT, EventEmitterEvents, LAYOUT_STATE } from '$constants';
import { getContextState } from '$lib';

import {
	Application,
	BitmapText,
	Container,
	EventEmitter,
	Graphics,
	type ContainerChild
} from 'pixi.js';

type CounterLineTypeProps = {
	container: Container<ContainerChild>;
	app: Application;
};

export const CounterLine = (options: CounterLineTypeProps) => {
	const { container, app } = options;
	const observer = getContextState();

	observer.on(EventEmitterEvents.TEXT_NODES_UPDATE, (data: any) => {
		update(data.textNodes);
	});

	const verticalLine = new Graphics()
		.rect(LAYOUT_STATE.VERTICAL_LINE_AXIS_X, 0, 0.5, app.canvas.height / 3)
		.fill(0xffffff);
	const horizontalLine = new Graphics().rect(0, 0, 1000, 0.5).fill(0xffffff);

	const update = (textNodes: Container<BitmapText>) => {
		const nodesLength = textNodes.children.length || 1;
		const linesSlice = new Set<BitmapText>();
		const bottomSlice = new Set<Graphics>();
		let counterAxisY = 15;
		for (let i = 0; i < nodesLength; i++) {
			const bottomLine = new Graphics().rect(0, (i + 1) * CARET_HEIGHT, 1000, 0.5).fill(0xffffff);
			const lineCounter = new BitmapText({
				text: `${i + 1}`,
				style: {
					fontSize: 12,
					fontWeight: 'normal',
					align: 'left'
				}
			});
			if (i > 8) counterAxisY = 8;
			if (i > 98) counterAxisY = 2;
			lineCounter.y = i * CARET_HEIGHT + 4;
			lineCounter.x = counterAxisY;
			linesSlice.add(lineCounter);
			bottomSlice.add(bottomLine);
		}

		verticalLine.height =
			app.canvas.height / 3 < nodesLength * CARET_HEIGHT
				? nodesLength * CARET_HEIGHT
				: app.canvas.height / 3;

		container.removeChildren();
		container.addChild(verticalLine);
		container.addChild(horizontalLine);
		container.addChild(...Array.from(linesSlice));
		container.addChild(...Array.from(bottomSlice));
	};

	return {
		update
	};
};
