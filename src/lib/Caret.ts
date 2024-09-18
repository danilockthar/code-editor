import { CARET_HEIGHT, LETTER_WIDTH_RATIO } from '$constants';

import { Graphics } from 'pixi.js';

type CaretOptions = {
	color?: string;
	fontSize?: number;
	position?: {
		line: number;
		column: number;
	};
};

const Caret = (options: CaretOptions) => {
	const { color = 0xffffff, position = { line: 1, column: 0 }, fontSize = 15 } = options;
	const caret = {
		graphic: new Graphics().rect(0, -1, 1, CARET_HEIGHT).fill(color),
		linePositionMatrix: [0, 0],
		position,
		moveTo: (line: number, column: number) => {
			caret.position = { line, column };
			caret.graphic.y = (line - 1) * CARET_HEIGHT;
			caret.graphic.x = column * (fontSize * LETTER_WIDTH_RATIO);
		}
	};

	return caret;
};

export default Caret;
