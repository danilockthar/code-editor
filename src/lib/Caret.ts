import { CARET_HEIGHT, LETTER_WIDTH_RATIO } from '$constants';

import { EventEmitter, Graphics } from 'pixi.js';

type CaretOptions = {
	observer?: EventEmitter<string | symbol>;
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
		graphic: new Graphics().rect(0, 0, 1, CARET_HEIGHT).fill(color),
		linePositionMatrix: [0, 0],
		position,
		moveTo: (line: number, column: number) => {
			console.log({ line, column }, '[moveTo]');

			caret.position = { line, column };
			caret.graphic.y = (line - 1) * CARET_HEIGHT;
			caret.graphic.x = column * (fontSize * LETTER_WIDTH_RATIO);
		}
	};

	return caret;
};

export default Caret;
