/*********************************************************
 * Picture zoom for ARJ: click a picture on a slide and it fills the
 * screen, the whole picture (a slide may show it small or cropped), with
 * the rest of the screen dimmed behind it and its caption under it.
 * A click anywhere, Esc, or the cross puts it back. One picture at a
 * time: not a slideshow, the arrows don't move on to the next.
 *
 * Which pictures, in startDeck:
 *   zoom: {
 *     pictures: 'figure.topic-photo img, .deck-qr img, img.zoom',
 *                     // a topic slide's picture, the title slide's QR code
 *                     // (bigger, easier to scan from the back of the room),
 *                     // and any picture marked class="zoom"
 *   }
 *   zoom: false       // no zoom
 * A picture inside a link stays a link. The caption is the figure's
 * <figcaption>, or else the picture's alt text. Pictures that can be
 * zoomed show a magnifying-glass pointer. Not in the print version.
 * Load after deck-controls.js and deck.js.
 *********************************************************/
(function () {
	'use strict';

	const config = Reveal.getConfig().zoom;
	if (config === false || /print-pdf/i.test(window.location.search)) return;
	const PICTURES = (config && config.pictures) || 'figure.topic-photo img, .deck-qr img, img.zoom';

	const shade = document.createElement('div');
	shade.className = 'deck-zoom';
	shade.setAttribute('data-no-click', ''); // deck.js leaves its clicks and wheel alone
	shade.setAttribute('role', 'dialog');
	shade.setAttribute('aria-modal', 'true');
	shade.hidden = true;
	const picture = document.createElement('img');
	picture.alt = '';
	const caption = document.createElement('p');
	caption.className = 'deck-zoom-caption';
	const close = document.createElement('button');
	close.type = 'button';
	close.className = 'deck-button deck-close';
	close.title = 'Close (Esc)';
	close.setAttribute('aria-label', 'Close (Esc)');
	shade.append(picture, caption, close);
	document.body.appendChild(shade);

	function zoomable(target) {
		const img = target.closest && target.closest('img');
		if (!img || !img.closest('.reveal .slides') || !img.matches(PICTURES)) return null;
		return img.closest('a[href]') ? null : img;
	}

	// As big as the screen allows, whatever its own size, keeping its shape
	// (a picture with no size of its own, an SVG, keeps its shape on the slide)
	function fit() {
		if (shade.hidden) return;
		const wide = picture.naturalWidth || source.width || 1;
		const high = picture.naturalHeight || source.height || 1;
		const room = shade.getBoundingClientRect();
		const roomHigh = room.height - 48 - (caption.hidden ? 0 : caption.offsetHeight + 12);
		const scale = Math.min((room.width - 48) / wide, roomHigh / high);
		picture.style.width = Math.round(wide * scale) + 'px';
		picture.style.height = Math.round(high * scale) + 'px';
	}
	let source = { width: 1, height: 1 };
	picture.addEventListener('load', fit);
	window.addEventListener('resize', fit);

	function open(img) {
		const shown = img.getBoundingClientRect();
		source = { width: shown.width, height: shown.height };
		const figure = img.closest('figure');
		const words = figure && figure.querySelector('figcaption');
		picture.src = img.currentSrc || img.src;
		picture.alt = img.alt;
		caption.textContent = words ? words.textContent.replace(/\s+/g, ' ').trim() : img.alt;
		caption.hidden = !caption.textContent;
		shade.setAttribute('aria-label', img.alt || 'Picture');
		shade.hidden = false;
		fit();
		close.focus();
	}

	function shut() {
		shade.hidden = true;
		picture.removeAttribute('src');
	}

	// Capture phase, before deck.js turns a click into the next slide
	window.addEventListener('click', function (event) {
		if (!shade.hidden) {
			event.preventDefault();
			event.stopImmediatePropagation();
			shut();
			return;
		}
		const img = event.button === 0 && zoomable(event.target);
		if (!img || document.body.classList.contains('arj-drawing')) return;
		event.preventDefault();
		event.stopImmediatePropagation();
		open(img);
	}, true);

	// While open, the keys don't reach the slides: Esc closes, the rest wait
	window.addEventListener('keydown', function (event) {
		if (shade.hidden) return;
		if (event.key === 'Tab') return; // the cross is the only thing to reach
		event.preventDefault();
		event.stopImmediatePropagation();
		if (event.key === 'Escape' || event.key === 'Enter' || event.key === ' ') shut();
	}, true);

	// The pointer says a click zooms; deck.js leaves these clicks alone
	document.querySelectorAll('.reveal .slides img').forEach(function (img) {
		if (zoomable(img)) {
			img.classList.add('deck-zoomable');
			img.setAttribute('data-no-click', '');
		}
	});
})();
