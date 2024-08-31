import { CARET_HEIGHT, VERTICAL_LINE_AXIS_X } from '$constants';

import { BitmapText, Container, EventEmitter, Graphics, type ContainerChild } from 'pixi.js';

type CounterLineTypeProps = {
	observer?: EventEmitter<string | symbol>;
	container: Container<ContainerChild>;
};

export const CounterLine = (options: CounterLineTypeProps) => {
	const { container } = options;

	const verticalLine = new Graphics().rect(VERTICAL_LINE_AXIS_X, 0, 0.5, 1000).fill(0xffffff);
	const horizontalLine = new Graphics().rect(0, 0, 1000, 0.5).fill(0xffffff);

	return {
		update: (textNodes: Container<BitmapText>) => {
			const nodesLength = textNodes.children.length || 1;
			const linesSlice = new Set<BitmapText>();
			const bottomSlice = new Set<Graphics>();
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
				lineCounter.y = i * CARET_HEIGHT + 4;
				lineCounter.x = 5;
				linesSlice.add(lineCounter);
				bottomSlice.add(bottomLine);
			}
			console.log(linesSlice, '[linesSlice]');
			container.removeChildren();
			container.addChild(verticalLine);
			container.addChild(horizontalLine);
			container.addChild(...Array.from(linesSlice));
			container.addChild(...Array.from(bottomSlice));
			console.log(linesSlice.size, '[linesSlice]');
		}
	};
};
