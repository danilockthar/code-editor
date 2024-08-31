export const scrollSelectionIntoView = () => {
	// Get current selection
	const selection = window.getSelection();

	// Check if there are selection ranges
	if (!selection?.rangeCount) {
		return;
	}

	// Get the first selection range. There's almost never can be more (instead of firefox)
	const firstRange = selection.getRangeAt(0);

	// Sometimes if the editable element is getting removed from the dom you may get a HierarchyRequest error in safari
	if (firstRange.commonAncestorContainer === document) {
		return;
	}

	// Create an empty br that will be used as an anchor for scroll, because it's imposible to do it with just text nodes
	const tempAnchorEl = document.createElement('br');

	// Put the br right after the caret position
	firstRange.insertNode(tempAnchorEl);
	console.log(firstRange.getBoundingClientRect().top, ']TOP*]');

	// Scroll to the br. I personally prefer to add the block end option, but if you want to use 'start' instead just replace br to span
	tempAnchorEl.scrollIntoView({
		block: 'end'
	});

	// Remove the anchor because it's not needed anymore
	tempAnchorEl.remove();
};

/* export const getCaretIndex = (element) => {
	let position = 0;
	const isSupported = typeof window.getSelection !== 'undefined';
	if (isSupported) {
		const selection = window.getSelection();
		if (selection.rangeCount !== 0) {
			const range = selection.getRangeAt(0);
			const preCaretRange = range.cloneRange();
			preCaretRange.selectNodeContents(element);
			preCaretRange.setEnd(range.endContainer, range.endOffset);

			// Traverse through the nodes and count characters including newlines
			const walker = document.createTreeWalker(element, NodeFilter.SHOW_ALL, null, false);
			let currentNode = walker.currentNode;

			while (currentNode) {
				if (currentNode === preCaretRange.endContainer) {
					position += preCaretRange.endOffset;
					break;
				}
				if (currentNode.nodeType === Node.TEXT_NODE) {
					position += currentNode.textContent.length;
				} else if (currentNode.nodeType === Node.ELEMENT_NODE && currentNode.tagName === 'BR') {
					position += 1; // Account for line break
				}
				currentNode = walker.nextNode();
			}
		}
	}
	return position;
}; */

/* export function getCaretCoordinates() {
	let x = 0,
		y = 0;
	const isSupported = typeof window.getSelection !== 'undefined';
	if (isSupported) {
		const selection = window.getSelection();
		// Check if there is a selection (i.e. cursor in place)

		if (selection && selection.rangeCount !== 0) {
			// Clone the range
			const range = selection.getRangeAt(0).cloneRange();
			// Collapse the range to the start, so there are not multiple chars selected
			range.collapse(true);
			// getCientRects returns all the positioning information we need
			const rect = range.getClientRects()[0];
			if (rect) {
				x = rect.left; // since the caret is only 1px wide, left == right
				y = rect.top; // top edge of the caret
			}
		}
	}
	return { x, y };
} */
export function getCaretPosition() {
	const selection = window.getSelection();
	if (!selection || !selection.rangeCount) return null;
	const range = selection.getRangeAt(0);
	const caretNode = range.startContainer;
	const caretOffset = range.startOffset;
	return { caretNode, caretOffset };
}

// Función para encontrar el div contenedor
export function getContainingDiv(node: Element | null) {
	while (node && node.nodeType !== Node.ELEMENT_NODE) {
		node = node.parentNode as Element;
	}
	return node && node.tagName === 'DIV' ? node : null;
}
