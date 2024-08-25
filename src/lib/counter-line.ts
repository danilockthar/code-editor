import { BitmapText, Container, type ContainerChild } from 'pixi.js';

type CounterLineTypeProps = {
	observer?: any;
	container: Container<ContainerChild>;
};

export const CounterLine = (options: CounterLineTypeProps) => {
	const { observer = null, container } = options;

	return {
		update: (textNodes: any) => {
			const nodesLength = textNodes.children.length || 1;
			const linesSlice = new Set<BitmapText>();
			for (let i = 0; i < nodesLength; i++) {
				let lineCounter = new BitmapText({
					text: `${i + 1}`,
					style: {
						fontSize: 12,
						fontWeight: 'normal',
						align: 'left'
					}
				});
				lineCounter.y = i * 20;
				lineCounter.x = 5;
				linesSlice.add(lineCounter);
			}
			container.removeChildren();
			container.addChild(...Array.from(linesSlice));
			console.log(linesSlice.size, '[linesSlice]');
		}
	};
};
