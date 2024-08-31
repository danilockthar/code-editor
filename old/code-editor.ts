// eslint-disable-next-line

import { text } from '@sveltejs/kit';
import { getCaretPosition, getContainingDiv } from '../src/helpers/helpers';
import {
	editorStyleCss,
	lineColumnStyleCss,
	lineCountStyleCss,
	instanceStyleCss
} from '../src/styles';

export type EditorType = {
	new: () => void;
	newEditor: () => void;
	countIncrement: () => void;
	count: number;
	on: () => void;
	setValue: () => void;
	getValue: () => void;
	setTheme: () => void;
	setFontSize: () => void;
	setReadOnly: () => void;
};
function loadCSS(filename: string) {
	const link = document.createElement('link');
	link.rel = 'stylesheet';
	link.type = 'text/css';
	link.href = filename;
	link.media = 'all';
	document.getElementsByTagName('head')[0].appendChild(link);
}

// Call the function with the path to your CSS file

export const Editor = (instance: HTMLDivElement): EditorType => {
	let editorState = [{ id: 1, text: '', isActive: true }];
	let currentEvent = '';
	let count = 0;
	let settedLine = 0;

	let currentLine = 0;
	let prevLastChild: Node | null = null;
	const editor = document.createElement('div');

	editor.style.cssText = editorStyleCss;
	editor.setAttribute('contenteditable', 'true');
	editor.setAttribute('id', 'editor');

	// line column
	const lineColumn = document.createElement('div');
	lineColumn.style.cssText = lineColumnStyleCss;

	const updateColors = () => {
		editor.childNodes.forEach((node) => {
			const element = node as HTMLElement;
			element.className =
				element.getAttribute('id') === currentLine.toString() ? 'activeLine' : 'line';
		});
	};

	let mostRecentlyAddedChild: Node | null = null;

	// Create a MutationObserver to track additions to the parent element
	const observer = new MutationObserver((mutationsList) => {
		for (let mutation of mutationsList) {
			console.log({ currentEvent }, '[observer-event]');
			if (mutation.type === 'childList') {
				// check if nodes were removed and update the most recently added child if necessary
				if (mutation.removedNodes.length > 0) {
					console.log({ currentLine }, '[observer]');
					console.log({ mutation });
					editor.childNodes.forEach((node, i) => {
						if (i + 1 === currentLine - 1) {
							(node as HTMLElement).className = 'activeLine';
							(node as HTMLElement).setAttribute('id', `${i + 1}`);
							return;
						}
						(node as HTMLElement).className = 'line';
						(node as HTMLElement).setAttribute('id', `${i + 1}`);
					});
				}
				// Loop through the added nodes and update the most recently added child
				/* mutation.addedNodes.forEach((node) => {
					if (node.nodeType === Node.ELEMENT_NODE) {
						mostRecentlyAddedChild = node;
					}
				}); */
			}
		}
	});
	observer.observe(editor, { childList: true });

	const updateLine = (lineNumber: number, line: { text: string; isActive: boolean }) => {
		editorState = editorState.map((l) => {
			if (l.id === lineNumber) {
				return {
					...l,
					text: line.text
				};
			}
			return l;
		});
	};

	const setActiveLine = (lineNumber: number) => {
		editorState = editorState.map((l) => {
			if (l.id === lineNumber) {
				return {
					...l,
					isActive: true
				};
			}
			return {
				...l,
				isActive: false
			};
		});
	};
	const removeLine = (lineNumber: number) => {
		editorState = editorState.filter((l) => l.id !== lineNumber);
	};

	const updateDOM = () => {
		editor.innerHTML = editorState
			.map(
				(l) =>
					`<div id="${l.id}" class="${l.isActive ? 'activeLine' : 'line'}">${l.text === '' ? '</br>' : l.text}</div>`
			)
			.join('');

		renderLineCounter();
		currentLine = 1;
		instance.appendChild(lineColumn);
		instance.appendChild(editor);
	};

	const renderLineCounter = () => {
		const nodesLength = editor.childNodes.length || 1;

		const lines = Array.from({ length: nodesLength }, (_, i) => {
			const lineCount = document.createElement('div');
			lineCount.style.cssText = lineCountStyleCss;
			lineCount.textContent = (i + 1).toString();
			return lineCount;
		});
		lineColumn.innerHTML = '';
		lineColumn.append(...lines);
	};

	return {
		new: () => {
			/* loadCSS('src/styles/index.css');
			const editorContainer = document.createElement('div');
			editorContainer.appendChild(editor);
			instance.style.cssText = instanceStyleCss;
			updateDOM();

			instance.addEventListener('keydown', (event: Event) => {
				console.log(event.target.outerText, '[input]');
				updateLine(currentLine, { text: event.target.outerText, isActive: true });
				updateDOM();
				event.preventDefault();
			}); */
		},
		newEditor: () => {
			loadCSS('src/styles/index.css');
			const editorContainer = document.createElement('div');
			editorContainer.appendChild(editor);
			instance.style.cssText = instanceStyleCss;
			const innerDiv = document.createElement('div');
			innerDiv.style.padding = '0 5px';
			innerDiv.setAttribute('id', '1');
			innerDiv.appendChild(document.createElement('br'));

			editor.appendChild(innerDiv);
			instance.appendChild(lineColumn);
			instance.appendChild(editorContainer);
			// Start observing the parent element for child node additions

			renderLineCounter();

			instance.addEventListener('paste', (event) => {
				currentEvent = 'paste';
				event.preventDefault();
				const text = event.clipboardData?.getData('text/plain');

				document.execCommand('insertText', false, text);
				editor.childNodes.forEach((node, i) => {
					if (i + 1 === currentLine + 1) {
						(node as HTMLElement).className = 'activeLine';
						(node as HTMLElement).setAttribute('id', `${i + 1}`);
						return;
					}
					(node as HTMLElement).className = 'line';
					(node as HTMLElement).setAttribute('id', `${i + 1}`);
				});
			});

			instance.addEventListener('mousedown', (event) => {
				const selectedLine = (event.target as HTMLElement).getAttribute('id');
				console.log('id: ', selectedLine);
				currentLine = Number(selectedLine);
				window.requestAnimationFrame(updateColors);
			});

			instance.addEventListener('input', (event: Event) => {
				if ((event as InputEvent).inputType === 'insertParagraph') {
					console.log('new line');
					editor.childNodes.forEach((node, i) => {
						if (i + 1 === currentLine + 1) {
							(node as HTMLElement).className = 'activeLine';
							(node as HTMLElement).setAttribute('id', `${i + 1}`);
							return;
						}
						(node as HTMLElement).className = 'line';
						(node as HTMLElement).setAttribute('id', `${i + 1}`);
					});
					currentLine++;
				}

				renderLineCounter();
			});

			instance.addEventListener('keydown', (e: KeyboardEvent) => {
				if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Backspace'].includes(e.key)) {
					let caretPosition = getCaretPosition();
					if (!caretPosition) return;

					let containingDiv = getContainingDiv(caretPosition.caretNode as Element);
					if (!containingDiv) return;
					let lineId = containingDiv.id;
					if (e.key === 'ArrowDown' && lineId !== editor.childNodes.length.toString()) {
						currentLine = Number(lineId) + 1;
					}
					if (e.key === 'ArrowUp' && lineId !== '1') {
						currentLine = Number(lineId) - 1;
					}
					if (e.key === 'ArrowLeft') {
						if (caretPosition.caretOffset === 0 && lineId !== '1') {
							currentLine = Number(lineId) - 1;
						} else {
							currentLine = Number(lineId);
						}
					}
					if (e.key === 'ArrowRight') {
						if (
							caretPosition.caretOffset === containingDiv.textContent?.length &&
							lineId !== editor.childNodes.length.toString()
						) {
							currentLine = Number(lineId) + 1;
						} else {
							currentLine = Number(lineId);
						}
					}
					if (e.key === 'Backspace') {
						if (caretPosition.caretOffset === 0 && lineId !== '1') {
							/* 			let actualText = containingDiv.textContent;
							let previousLine = containingDiv.previousSibling as HTMLElement; */
							currentLine = Number(lineId) - 1;
							containingDiv.className = 'line';
						} else {
							if (caretPosition.caretOffset === 0 && lineId === '1') {
								e.preventDefault();
							}
							currentLine = Number(lineId);
						}
					}
					window.requestAnimationFrame(updateColors);
					console.log('Caret is in line:', lineId);
				}
			});
		},
		countIncrement: () => {
			count++;
		},
		get count() {
			return count;
		},
		on: () => {},
		setValue: () => {},
		getValue: () => {},
		setTheme: () => {},
		setFontSize: () => {},
		setReadOnly: () => {}
	};
};
