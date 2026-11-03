/*********************************************************
 * Link icons: each website's own icon (favicon) beside links to it, so
 * "IMDb" or "Wikiquote" can be seen at a glance. Load after the slides
 * exist and after arj/js/deck-markdown.js (the 'label' style uses its
 * field classes), before arj/js/deck-controls.js. This marks the links
 * (a.site-link) and each slide (data-links), in the print version too;
 * arj/css/arj.css draws them:
 *   favicon-before   icon, then the link, then the new-tab mark (the default)
 *   favicon-after    the link, then the icon
 *   link-icon        the link, then a plain link icon
 *   favicon-label    the icon in place of a field label ("**IMDb:**")
 * Which icon is CSS: arj.css has reveal.js, GitHub, a folder (a.folder) and
 * a plain link for any other site; a deck adds its own sites in its own CSS
 * (see "Icons" in arj.css), so no page or setting names an icon's address.
 * Settings, all optional:
 *   linkIcons: {
 *     style: 'favicon-before',      // one of the four, or 'compare': a
 *                                   // different style on each section in turn
 *     sites: { 'imdb.com': ['imdb.png', 'IMDb'], ... },  // older: icons named
 *     folder: 'src/img/favicons/',  // here, in folder, rather than in CSS.
 *                                   // Needed for favicon-after and favicon-label
 *     labels: { 'imdb': 'imdb.com', ... },  // field label -> site, for favicon-label
 *     skip: 'a.person, .no-link-icon',      // links that never get an icon
 *     newTab: false,                // true: links to other websites open in a
 *                                   // new tab, so the deck stays open
 *   }
 * Links that open a new tab (target="_blank", or all of them with newTab)
 * get class opens-tab: an arrow out of a box after the link (arj.css).
 * A PDF and the print version (?print-pdf) always open in a new tab: a
 * browser set to show PDFs itself would otherwise replace the slides with
 * it, even for a download link. Email links (mailto:, or data-mail, which
 * arj/js/deck.js turns into one) get class opens-app: an envelope with an
 * arrow after them, as they open the email app (or webmail, if the browser
 * is set to use it).
 * ?links=favicon-after in the address shows one style everywhere.
 * Links to sites with no icon get a plain link icon (arj.css). Links that are
 * pictures (a QR code), links matching skip, and links inside an element
 * with class no-link-icon (a title slide that draws its own), get nothing.
 *********************************************************/
(function () {
	'use strict';

	const STYLES = ['favicon-before', 'favicon-after', 'link-icon', 'favicon-label'];

	const config = Reveal.getConfig().linkIcons || {};

	// Each site: [the icon's full address, the site's name]
	function inFolder(sites, folder) {
		const out = {};
		Object.keys(sites).forEach(function (domain) {
			out[domain] = [new URL(folder + sites[domain][0], document.baseURI).href, sites[domain][1]];
		});
		return out;
	}

	const settings = {
		style: config.style || 'favicon-before',
		sites: inFolder(config.sites || {}, config.folder || ''),
		labels: config.labels || {},
		skip: config.skip || 'a.person, .no-link-icon',
		newTab: config.newTab === true,
	};
	const forced = new URLSearchParams(window.location.search).get('links');

	function siteOf(href) {
		let host = '';
		try { host = new URL(href).hostname.replace(/^www\./, ''); } catch (e) { return null; }
		const key = Object.keys(settings.sites).find(k => host === k || host.endsWith('.' + k));
		return key ? settings.sites[key] : null;
	}

	// 'compare' starts with the first style on the slide after the title
	function styleFor(section) {
		if (STYLES.indexOf(forced) >= 0) return forced;
		if (settings.style !== 'compare') return settings.style;
		return STYLES[(section - 1 + STYLES.length) % STYLES.length];
	}

	// The icon in place of a field label: "**IMDb:**" -> [IMDb icon]:
	function replaceLabels(top) {
		top.querySelectorAll('li.field').forEach(function (item) {
			const name = Array.from(item.classList).find(c => c.indexOf('field-') === 0 && c !== 'field');
			const domain = name && settings.labels[name.slice(6)];
			const label = item.querySelector(':scope > strong:first-child');
			if (!domain || !label || !settings.sites[domain]) return;
			const site = settings.sites[domain];
			const icon = document.createElement('img');
			icon.className = 'label-favicon';
			icon.src = site[0];
			icon.alt = site[1];
			icon.title = site[1];
			label.replaceChildren(icon, ':');
			item.querySelectorAll('a.site-link').forEach(link => link.classList.add('labelled'));
		});
	}

	// Each slide on its own: the print version (?print-pdf) moves the slides
	// into pages of their own, so they aren't always .slides > section
	function topicOf(slide) {
		try { return Reveal.getIndices(slide).h || 0; } catch (e) { return 0; }
	}

	document.querySelectorAll('.reveal .slides section:not(:has(section))').forEach(function (slide) {
		const style = styleFor(topicOf(slide));
		slide.dataset.links = style;
		slide.querySelectorAll('a[href]').forEach(function (link) {
			const other = /^https?:/.test(link.href) && new URL(link.href).origin !== window.location.origin;
			const pdf = /^https?:/.test(link.href) && (/\.pdf$/i.test(link.pathname) || /print-pdf/i.test(link.search));
			if ((settings.newTab && other || pdf) && !link.target) {
				link.target = '_blank';
				link.rel = 'noopener';
			}
			if (link.target === '_blank' && !link.closest('.no-link-icon') && !link.querySelector('img')) link.classList.add('opens-tab');
		});
		slide.querySelectorAll('a[href^="mailto:"], a[data-mail]').forEach(function (link) {
			if (link.closest('.no-link-icon') || link.querySelector('img') || link.classList.contains('mail-link')) return;
			link.classList.add('opens-app');
			if (!link.title) link.title = 'Opens your email app';
		});
		slide.querySelectorAll('a[href^="http"]:not(:has(img))').forEach(function (link) {
			if (link.matches(settings.skip) || link.closest('.no-link-icon')) return;
			const site = siteOf(link.href);
			link.classList.add('site-link');
			// An absolute address: a relative one in a CSS variable is read from the CSS file
			if (site) link.style.setProperty('--favicon', 'url("' + site[0] + '")');
		});
		if (style === 'favicon-label') replaceLabels(slide);
	});
})();
