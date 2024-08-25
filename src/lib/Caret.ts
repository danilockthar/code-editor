import { Graphics } from 'pixi.js';
import { SPACE_WIDTH } from '../helpers/constants';

type CaretOptions = {
	observer?: any;
	color?: string;
	position?: {
		line: number;
		column: number;
	};
};

const Caret = (options: CaretOptions) => {
	const { observer = null, color = '0xffffff', position = { line: 1, column: 0 } } = options;
	let caret = {
		graphic: new Graphics().rect(0, 0, 1, 18).fill(0xffffff),
		linePositionMatrix: [0, 0],
		position,
		moveTo: (line: number, column: number) => {
			console.log({ line, column }, '[moveTo]');
			
			caret.position = { line, column };
			caret.graphic.y = (line - 1) * 20;
			caret.graphic.x = column * SPACE_WIDTH;
		}
	};

	return caret;
};

export default Caret;
