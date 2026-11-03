/*********************************************************
 * Classes and fitting for decks written in Markdown, so the CSS can style
 * what Markdown can't mark up. Load after Reveal.initialize has finished
 * (arj/js/deck-start.js does), and before arj/js/deck-controls.js, so the
 * contents thumbnails show the same thing. Settings, all optional:
 *   deckMarkdown: {
 *     fieldClasses: true,      // "- **Use it for:** ..." gets li.field.field-use-it-for
 *     h1Class: 'topic',        // a slide whose heading is a level 1 heading
 *     sceneLabel: 'Scene',     // a "**Scene: ...**" line gets p.scene ('' = off)
 *     externalLinksNewTab: true, // links to other websites open a new tab
 *     fit: true,               // shrink a slide's text until it fits:
 *     fitMin: 0.55,            //   no smaller than this,
 *     fitStep: 0.05,           //   in steps of this
 *     split: true,             // continue a long slide with class split on new slides
 *   }
 * Fitting sets --fit (1 down to fitMin) on the slide; the CSS multiplies
 * font sizes by it, e.g. font-size: calc(30px * var(--fit, 1)).
 *
 * Splitting, for a long list (references, picture credits) that would only
 * fit as small print: in Markdown <!-- .slide: class="split" -->. If the
 * slide runs over, the end of its last list moves to a new slide below it,
 * with the same heading and class continued, as many times as it takes, so
 * every part is full size, the items shared out evenly. A numbered list
 * carries on from its number. Not
 * in the print version, which gives a long slide extra pages instead.
 *********************************************************/
(function () {
	'use strict';

	const settings = Object.assign({
		fieldClasses: true,
		h1Class: 'topic',
		sceneLabel: 'Scene',
		externalLinksNewTab: true,
		fit: true,
		fitMin: 0.55,
		fitStep: 0.05,
		split: true,
	}, Reveal.getConfig().deckMarkdown || {});

	const slides = document.querySelector('.reveal .slides');
	const printing = /print-pdf/i.test(window.location.search);
	// The height a slide's content may take: the slide, less a little for the
	// bars along the bottom
	const room = Reveal.getConfig().height - 30;

	// "**Use it for:** ..." -> li.field.field-use-it-for
	if (settings.fieldClasses) {
		slides.querySelectorAll('li').forEach(function (item) {
			const label = item.querySelector(':scope > strong:first-child');
			if (!label || !/:\s*$/.test(label.textContent)) return;
			const name = label.textContent.replace(/:\s*$/, '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
			item.classList.add('field', 'field-' + name);
		});
	}

	if (settings.h1Class) {
		slides.querySelectorAll('section').forEach(function (slide) {
			if (slide.querySelector(':scope > h1')) slide.classList.add(settings.h1Class);
		});
	}

	// "**Scene: ...**" on its own line
	if (settings.sceneLabel) {
		const pattern = new RegExp('^' + settings.sceneLabel + ':');
		slides.querySelectorAll('section > p').forEach(function (line) {
			if (pattern.test(line.textContent.trim()) && line.children.length === 1) line.classList.add('scene');
		});
	}

	// Links to other websites open in a new tab, so the deck stays open
	if (settings.externalLinksNewTab) {
		slides.querySelectorAll('a[href^="http"]').forEach(function (link) {
			link.target = '_blank';
			link.rel = 'noopener';
		});
	}

	// Long lists: continue them on new slides below (section.split)
	if (settings.split && !printing) {
		// reveal.js hides the slides that aren't showing, and a hidden slide has
		// no height, so show one (and its stack) while it's measured
		const shown = function (slide, measure) {
			const parts = [slide, slide.parentNode.closest('section')].filter(Boolean);
			const saved = parts.map(function (part) { return [part.style.display, part.hidden]; });
			parts.forEach(function (part) { part.style.display = 'block'; part.hidden = false; });
			measure();
			parts.forEach(function (part, i) { part.style.display = saved[i][0]; part.hidden = saved[i][1]; });
		};
		// A slide on its own becomes the first slide of a new stack
		const stackOf = function (slide) {
			if (slide.parentNode.matches('section')) return slide.parentNode;
			const stack = document.createElement('section');
			slide.parentNode.insertBefore(stack, slide);
			stack.appendChild(slide);
			return stack;
		};
		const split = function (slide) {
			const list = Array.from(slide.children).filter(function (el) { return el.matches('ol, ul'); }).pop();
			if (!list || list.children.length < 2) return;
			shown(slide, function () {
				if (slide.scrollHeight <= room) return;
				const next = document.createElement('section');
				next.className = slide.className.replace(/\b(past|present|future)\b/g, '').trim();
				next.classList.add('continued');
				// The same heading, and the same marks (<!-- no-number --> ...)
				Array.from(slide.childNodes).forEach(function (node) {
					if (node.nodeType === Node.COMMENT_NODE || (node.matches && node.matches('h1, h2, h3'))) {
						next.appendChild(node.cloneNode(true));
					}
				});
				const rest = next.appendChild(list.cloneNode(false));
				stackOf(slide).insertBefore(next, slide.nextSibling);
				const move = function () { rest.insertBefore(list.lastElementChild, rest.firstChild); };
				while (slide.scrollHeight > room && list.children.length > 1) move();
				// Share the items out evenly over the slides it will take, so the
				// last isn't left with one or two
				const fits = list.children.length;
				const total = fits + rest.children.length;
				const each = Math.ceil(total / Math.ceil(total / fits));
				while (list.children.length > each) move();
				if (list.tagName === 'OL') rest.start = list.start + list.children.length;
				split(next);
			});
		};
		slides.querySelectorAll('section.split').forEach(split);
		Reveal.sync();
	}

	// Long slides: shrink the text until it fits the slide's height
	if (settings.fit) {
		// A title slide (.arj-title) fills the height on purpose, so it's left
		// alone; so is any slide with class no-fit
		const fit = function (slide) {
			if (!slide || slide.dataset.fitted || slide.matches('.arj-title, .no-fit')) return;
			let size = 1;
			while (slide.scrollHeight > room && size > settings.fitMin) {
				size -= settings.fitStep;
				slide.style.setProperty('--fit', size.toFixed(2));
			}
			slide.dataset.fitted = 'yes';
		};
		// The print version (?print-pdf) shows every slide at once, so fit them
		// all, once reveal.js has laid out the pages (pdf-ready). It sized each
		// page to its slide, with extra pages for a long one, so size them again.
		const fitPrint = function () {
			slides.querySelectorAll('section:not(.stack)').forEach(function (slide) {
				delete slide.dataset.fitted;
				fit(slide);
			});
			const pages = Array.from(document.querySelectorAll('.reveal .pdf-page'));
			const pageHeight = Math.min.apply(null, pages.map(function (page) { return page.offsetHeight; }));
			pages.forEach(function (page) {
				const slide = page.querySelector(':scope > section');
				if (!slide) return;
				const needed = Math.max(1, Math.ceil((slide.offsetTop + slide.scrollHeight) / pageHeight));
				page.style.height = (needed * pageHeight) + 'px';
			});
		};
		if (printing) {
			if (document.querySelector('.reveal .pdf-page')) fitPrint();
			else Reveal.on('pdf-ready', fitPrint);
		}
		fit(Reveal.getCurrentSlide());
		Reveal.on('slidechanged', function (event) { fit(event.currentSlide); });
		// Slides added later (the contents) can change the current slide
		// without a slidechanged event, so check again once everything is in
		document.addEventListener('deck:ready', function () { fit(Reveal.getCurrentSlide()); });
	}
})();
