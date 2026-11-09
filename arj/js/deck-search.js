/*! ARJ, Apocalypse Reveal-js | (c) 2026 Mark Crowe | MIT licence, see LICENSE | https://github.com/SDevTutors/apocalypse-reveal-js */
/*********************************************************
 * Search for ARJ: finds words on every slide, not just the one on the
 * screen, as the browser's own find (Ctrl+F) can't see the others.
 * A magnifying glass at the start of the top right buttons, or Ctrl+F
 * (Cmd+F on a Mac), opens a search box in place of the browser's:
 *
 *   type                 searches as you type; "3 of 41" counts the finds
 *   Enter, Down, F3      the next find: goes to its slide, a fragment too
 *   Shift+Enter, Up,     the find before
 *   Shift+F3
 *   Esc, or the cross    closes the box: the marks go, the slide stays
 *
 * Every find is marked in yellow, the current one in orange. Each line
 * with a find is listed with its slide number, as in Word's navigation
 * pane: in the slide list (deck-controls.js) in place of the slides,
 * opening it while searching if it was closed; or under the box, for a
 * deck with no slide list or a narrow window. Click a line to go to it.
 *
 * Searches the slides' text, not speaker notes or the contents slides
 * (they repeat the titles). Capitals don't matter; a space matches any
 * space or line break. Marks use the browser's highlight API, so the
 * slides themselves don't change; an older browser still finds and goes
 * to each one, unmarked.
 *
 * Settings in startDeck:
 *   search: true,             // false: no search; Ctrl+F is the browser's
 *   searchList: 'sidebar',    // where the lines with a find are listed:
 *                             // 'sidebar' (the slide list), 'box' (under the
 *                             // search box) or false (no list)
 *
 * Not in the print version. Load after deck-controls.js (and deck.js and
 * deck-draw.js, so the glass comes first in the top right buttons).
 *********************************************************/
(function () {
	'use strict';

	const config = Reveal.getConfig();
	if (config.search === false || /print-pdf/i.test(window.location.search)) return;
	const listWhere = config.searchList === undefined ? 'sidebar' : config.searchList;

	const MAX_LINES = 400; // lines listed; more are counted, not listed
	const BLOCKS = 'p, li, h1, h2, h3, h4, h5, h6, td, th, dt, dd, blockquote, figcaption, pre, caption, summary';
	const SKIP = 'aside.notes, script, style, template, .no-search';
	const highlights = typeof Highlight === 'function' && window.CSS && CSS.highlights;

	let index = null;   // [{ slide, block, text, nodes, starts }] in slide order
	let finds = [];     // [{ line, start, end, range }]
	let lines = [];     // [{ entry, finds: [...] }]: the blocks with a find
	let current = -1;
	let query = '';
	let openedSidebar = false;
	let timer = 0;

	function button(name, label, action) {
		const el = document.createElement('button');
		el.type = 'button';
		el.className = 'deck-button deck-' + name;
		el.setAttribute('aria-label', label);
		el.title = label;
		el.addEventListener('click', function (event) {
			event.stopPropagation(); // not a click on the slide
			action(el);
		});
		return el;
	}

	/* ---------- The box ---------- */
	const box = document.createElement('div');
	box.className = 'deck-search-box';
	box.setAttribute('role', 'search');
	box.setAttribute('data-no-click', '');
	box.hidden = true;

	const bar = document.createElement('div');
	bar.className = 'deck-search-bar';
	const input = document.createElement('input');
	input.type = 'search';
	input.placeholder = 'Search all the slides';
	input.setAttribute('aria-label', 'Search all the slides');
	input.spellcheck = false;
	input.autocomplete = 'off';
	const count = document.createElement('span');
	count.className = 'deck-search-count';
	count.setAttribute('aria-live', 'polite');
	bar.append(
		input,
		count,
		button('search-up', 'The find before (Shift+Enter or Up)', () => step(-1)),
		button('search-down', 'The next find (Enter or Down)', () => step(1)),
		button('close', 'Close the search (Esc)', close)
	);
	box.appendChild(bar);

	const list = document.createElement('div');
	list.className = 'deck-search-results';
	list.setAttribute('aria-label', 'Lines with a find');

	const glass = button('search', 'Search all the slides (Ctrl+F)', () => (isOpen() ? close() : open()));

	function sidebar() {
		return listWhere === 'sidebar' && !window.matchMedia('(max-width: 699px)').matches
			? document.querySelector('.deck-sidebar') : null;
	}

	function sidebarOpen() {
		return document.body.classList.contains('deck-sidebar-open');
	}

	// deck-controls.js keeps the slide list; its button opens and closes it
	function toggleSidebar() {
		const menu = document.querySelector('.deck-dock .deck-menu');
		if (menu) menu.click();
	}

	function isOpen() {
		return !box.hidden;
	}

	function open() {
		box.hidden = false;
		glass.classList.add('on');
		const side = sidebar();
		if (listWhere) (side || box).appendChild(list);
		if (side && !sidebarOpen()) {
			toggleSidebar();
			openedSidebar = true;
		}
		document.body.classList.toggle('deck-search-in-sidebar', !!side);
		input.focus();
		input.select();
		if (input.value) run();
	}

	function close() {
		box.hidden = true;
		glass.classList.remove('on');
		clearMarks();
		document.body.classList.remove('deck-search-in-sidebar');
		if (openedSidebar && sidebarOpen()) toggleSidebar();
		openedSidebar = false;
		if (document.activeElement === input) input.blur();
	}

	/* ---------- Reading the slides ---------- */
	// Each slide's text, a block (paragraph, bullet, heading...) at a time,
	// remembering which text node each part came from, so a find can be
	// marked even when it runs across bold or a link
	function buildIndex() {
		index = [];
		document.querySelectorAll('.reveal .slides section:not(:has(section))').forEach(function (slide) {
			if (slide.closest('.deck-contents-stack')) return;
			const blocks = new Map();
			const walker = document.createTreeWalker(slide, NodeFilter.SHOW_TEXT, {
				acceptNode: node => (node.parentElement.closest(SKIP) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
			});
			for (let node = walker.nextNode(); node; node = walker.nextNode()) {
				const found = node.parentElement.closest(BLOCKS);
				const block = found && slide.contains(found) ? found : slide;
				if (!blocks.has(block)) blocks.set(block, []);
				blocks.get(block).push(node);
			}
			blocks.forEach(function (nodes, block) {
				let text = '';
				const starts = nodes.map(function (node) {
					const at = text.length;
					text += node.data;
					return at;
				});
				if (text.trim()) index.push({ slide, block, text, nodes, starts });
			});
		});
	}

	function pointAt(entry, offset, isEnd) {
		let i = entry.starts.length - 1;
		while (i > 0 && (entry.starts[i] > offset || (isEnd && entry.starts[i] === offset))) i--;
		return [entry.nodes[i], offset - entry.starts[i]];
	}

	function pattern(text) {
		const escaped = text.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+');
		return new RegExp(escaped, 'gi');
	}

	/* ---------- Searching ---------- */
	function run() {
		query = input.value;
		if (!index) buildIndex();
		finds = [];
		lines = [];
		if (query.trim()) {
			const re = pattern(query);
			index.forEach(function (entry) {
				const line = { entry, finds: [] };
				re.lastIndex = 0;
				for (let m = re.exec(entry.text); m; m = re.exec(entry.text)) {
					if (!m[0]) { re.lastIndex++; continue; }
					const range = document.createRange();
					range.setStart(...pointAt(entry, m.index, false));
					range.setEnd(...pointAt(entry, m.index + m[0].length, true));
					const find = { line, start: m.index, end: m.index + m[0].length, range };
					line.finds.push(find);
					finds.push(find);
				}
				if (line.finds.length) lines.push(line);
			});
		}
		// Start from the slide on the screen, as the browser starts from the page
		const here = Reveal.getIndices();
		current = finds.findIndex(function (find) {
			const at = Reveal.getIndices(find.line.entry.slide);
			return at.h > here.h || (at.h === here.h && (at.v || 0) >= (here.v || 0));
		});
		if (current < 0 && finds.length) current = 0;
		showList();
		show(true);
	}

	function step(by) {
		if (!finds.length) return;
		current = (current + by + finds.length) % finds.length;
		show(true);
	}

	function show(go) {
		box.classList.toggle('none-found', !!query.trim() && !finds.length);
		count.textContent = !query.trim() ? '' : finds.length ? (current + 1) + ' of ' + finds.length : 'None found';
		mark();
		list.querySelectorAll('.current').forEach(el => el.classList.remove('current'));
		if (current < 0) return;
		const find = finds[current];
		if (find.line.item) {
			find.line.item.classList.add('current');
			find.line.item.scrollIntoView({ block: 'nearest' });
		}
		if (go) goTo(find);
	}

	// To the find's slide, and on to its fragment if it hasn't appeared yet
	function goTo(find) {
		const slide = find.line.entry.slide;
		const at = Reveal.getIndices(slide);
		const fragment = find.line.entry.block.closest('.fragment') || find.range.startContainer.parentElement.closest('.fragment');
		let f;
		if (fragment && slide.contains(fragment)) {
			f = Number(fragment.getAttribute('data-fragment-index'));
			if (isNaN(f)) f = undefined;
		}
		if (Reveal.isOverview && Reveal.isOverview()) Reveal.toggleOverview(false);
		Reveal.slide(at.h, at.v, f);
	}

	function mark() {
		if (!highlights) return;
		clearMarks();
		if (!finds.length) return;
		CSS.highlights.set('arj-search', new Highlight(...finds.map(f => f.range)));
		if (current >= 0) CSS.highlights.set('arj-search-current', new Highlight(finds[current].range));
	}

	function clearMarks() {
		if (!highlights) return;
		CSS.highlights.delete('arj-search');
		CSS.highlights.delete('arj-search-current');
	}

	/* ---------- The list of lines ---------- */
	function slideLabel(slide) {
		const at = Reveal.getIndices(slide);
		const link = document.querySelector('.deck-sidebar-link[data-h="' + at.h + '"][data-v="' + (at.v || 0) + '"]');
		if (link) return link.title;
		const heading = slide.querySelector('h1, h2, h3');
		return 'Slide ' + (at.h + 1) + (at.v ? '.' + (at.v + 1) : '') + (heading ? ' – ' + heading.textContent.trim() : '');
	}

	// The line, cut down to the words around its finds, the finds in bold
	function snippet(line) {
		const text = line.entry.text;
		const first = line.finds[0].start;
		const from = Math.max(0, first - 40);
		const to = Math.min(text.length, Math.max(line.finds[line.finds.length - 1].end, first + 80));
		const out = document.createElement('span');
		out.className = 'deck-search-line';
		let at = from;
		if (from > 0) out.append('…');
		line.finds.forEach(function (find) {
			if (find.start < at || find.end > to) return;
			out.append(text.slice(at, find.start).replace(/\s+/g, ' '));
			const b = document.createElement('mark');
			b.textContent = text.slice(find.start, find.end).replace(/\s+/g, ' ');
			out.append(b);
			at = find.end;
		});
		out.append(text.slice(at, to).replace(/\s+/g, ' '));
		if (to < text.length) out.append('…');
		return out;
	}

	function showList() {
		list.replaceChildren();
		if (!listWhere || !query.trim()) return;
		const head = document.createElement('p');
		head.className = 'deck-search-summary';
		const slides = new Set(lines.map(l => l.entry.slide)).size;
		head.textContent = finds.length
			? finds.length + (finds.length === 1 ? ' find' : ' finds') + ' on ' + slides + (slides === 1 ? ' slide' : ' slides')
			: 'Nothing on any slide matches "' + query.trim() + '"';
		list.appendChild(head);
		let slide = null;
		lines.slice(0, MAX_LINES).forEach(function (line) {
			if (line.entry.slide !== slide) {
				slide = line.entry.slide;
				const title = document.createElement('p');
				title.className = 'deck-search-slide';
				title.textContent = slideLabel(slide);
				list.appendChild(title);
			}
			const item = document.createElement('a');
			item.href = '#';
			item.className = 'deck-search-item';
			item.appendChild(snippet(line));
			item.addEventListener('click', function (event) {
				event.preventDefault();
				current = finds.indexOf(line.finds[0]);
				show(true);
			});
			line.item = item;
			list.appendChild(item);
		});
		if (lines.length > MAX_LINES) {
			const more = document.createElement('p');
			more.className = 'deck-search-summary';
			more.textContent = 'and ' + (lines.length - MAX_LINES) + ' more lines: type more of the words to narrow it down';
			list.appendChild(more);
		}
	}

	/* ---------- Keys ---------- */
	input.addEventListener('input', function () {
		clearTimeout(timer);
		timer = setTimeout(run, 120);
	});

	input.addEventListener('keydown', function (event) {
		if (event.key === 'Enter' && input.value !== query) {
			clearTimeout(timer);
			run();
		} else if (event.key === 'Enter' || event.key === 'ArrowDown' || event.key === 'ArrowUp') {
			step(event.key === 'ArrowUp' || event.shiftKey ? -1 : 1);
		} else if (event.key === 'Escape') {
			close();
		} else {
			return;
		}
		event.preventDefault();
		event.stopPropagation();
	});

	// Capture phase, before reveal.js and the browser: Ctrl+F is ours
	window.addEventListener('keydown', function (event) {
		const mod = event.ctrlKey || event.metaKey;
		if (mod && !event.altKey && !event.shiftKey && event.key.toLowerCase() === 'f') {
			event.preventDefault();
			event.stopImmediatePropagation();
			if (isOpen()) {
				input.focus();
				input.select();
			} else {
				open();
			}
		} else if (isOpen() && (event.key === 'F3' || (mod && event.key.toLowerCase() === 'g'))) {
			event.preventDefault();
			event.stopImmediatePropagation();
			step(event.shiftKey ? -1 : 1);
		}
	}, true);

	/* ---------- Start ---------- */
	document.body.appendChild(box);
	const dock = document.querySelector('.deck-dock-top-right');
	if (dock) dock.insertBefore(glass, dock.firstChild);
})();
