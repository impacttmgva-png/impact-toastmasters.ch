const toggle = document.querySelector('.menu-toggle');

toggle?.addEventListener('click', () => {
	const expanded = toggle.getAttribute('aria-expanded') === 'true';
	toggle.setAttribute('aria-expanded', String(!expanded));
	document.querySelector('nav').classList.toggle('open', !expanded);
});

document.querySelectorAll('[data-filter]').forEach((button) =>
	button.addEventListener('click', () => {
		document.querySelectorAll('[data-filter]').forEach((filterButton) =>
			filterButton.setAttribute('aria-pressed', String(filterButton === button)),
		);
		document.querySelectorAll('[data-category]').forEach((item) => {
			item.hidden =
				button.dataset.filter !== 'all' &&
				item.dataset.category !== button.dataset.filter;
		});
	}),
);

const events = [
	{
		date: '2026-10-27',
		url: 'https://www.meetup.com/impact-toastmasters-geneva/events/316253055/',
	},
	{
		date: '2026-11-10',
		url: 'https://www.meetup.com/impact-toastmasters-geneva/events/',
	},
	{
		date: '2026-11-24',
		url: 'https://www.meetup.com/impact-toastmasters-geneva/events/',
	},
];

const now = new Date();
const upcoming = events.filter(
	(event) => new Date(event.date + 'T21:00:00+01:00') >= now,
);
const next = upcoming[0];
const dateFormat = (date, options) =>
	new Intl.DateTimeFormat('en-GB', {
		timeZone: 'Europe/Zurich',
		...options,
	}).format(new Date(date + 'T12:00:00+01:00'));

if (next) {
	const homeDay = document.getElementById('home-day');
	if (homeDay) {
		homeDay.textContent = dateFormat(next.date, { day: 'numeric' });
		document.getElementById('home-month').textContent = dateFormat(next.date, {
			month: 'short',
		}).toUpperCase();
		document.getElementById('home-details').textContent =
			dateFormat(next.date, {
				weekday: 'long',
				day: 'numeric',
				month: 'long',
			}) + ' · 19:00 · Les Grottes, Geneva';
	}

	const card = document.getElementById('next-event');
	if (card) {
		card.innerHTML = `
			<p class="eyebrow">NEXT MEETING · GUESTS WELCOME</p>
			<h2>${dateFormat(next.date, { weekday: 'long' })}<br>${dateFormat(next.date, {
				day: 'numeric',
				month: 'long',
				year: 'numeric',
			})}</h2>
			<p>Public speaking with deliberate practice</p>
			<dl>
				<dt>Time</dt><dd>19:00–21:00 · CET</dd>
				<dt>Arrival</dt><dd>From 18:45</dd>
				<dt>Location</dt><dd>Espace Quartier des Grottes</dd>
				<dt>Guest visit</dt><dd>Free</dd>
			</dl>
			<div class="actions">
				<a class="button yellow" href="${next.url}">Reserve on Meetup <span>↗</span></a>
				<button class="button outline" id="calendar">Add to Calendar <span>＋</span></button>
			</div>
			<p class="small" style="margin:24px 0 0">Theme and host will be shared when announced. Check the event listing for the latest details.</p>
		`;
		document
			.getElementById('calendar')
			.addEventListener('click', () => downloadCalendar(next));
	}
} else {
	const home = document.getElementById('home-details');
	if (home) {
		home.textContent = 'New meeting dates will be announced on Meetup.';
	}

	const title = document.getElementById('home-meeting');
	if (title) {
		title.textContent = 'Discover the next meeting';
	}

	const day = document.getElementById('home-day');
	if (day) {
		day.textContent = '→';
		document.getElementById('home-month').textContent = 'NEXT';
	}

	const card = document.getElementById('next-event');
	if (card) {
		card.innerHTML = `
			<p class="eyebrow">MORE OPPORTUNITIES AHEAD</p>
			<h2>See you at Impact.</h2>
			<p>Our next meeting dates will be announced on Meetup.</p>
			<a class="button yellow" href="https://www.meetup.com/impact-toastmasters-geneva/events/">Check upcoming events ↗</a>
		`;
	}
}

const list = document.getElementById('upcoming');
if (list) {
	list.innerHTML = upcoming.length
		? upcoming
				.map(
					(event) => `
						<div class="event-row">
							<strong>${dateFormat(event.date, {
								day: 'numeric',
								month: 'long',
							})}</strong>
							<span>Club meeting · 19:00–21:00</span>
							<a class="text-link" href="${event.url}">View on Meetup ↗</a>
						</div>
					`,
				)
				.join('')
		: '<p>Visit Meetup for newly announced meetings.</p>';
}

function downloadCalendar(event) {
	const day = event.date.replaceAll('-', '');
	const text = [
		'BEGIN:VCALENDAR',
		'VERSION:2.0',
		'PRODID:-//Impact Toastmasters Geneva//Meetings//EN',
		'BEGIN:VEVENT',
		'UID:impact-' + day + '@impact-toastmasters.club',
		'DTSTAMP:' + new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, ''),
		'DTSTART:' + day + 'T180000Z',
		'DTEND:' + day + 'T200000Z',
		'SUMMARY:Impact Toastmasters Geneva - Club meeting',
		'LOCATION:Espace Quartier des Grottes\\, Rue du Grand-Pré 9\\, Geneva',
		'DESCRIPTION:Guest visit. Arrive from 18:45 Geneva local time. Check Meetup for updates.',
		'URL:' + event.url,
		'END:VEVENT',
		'END:VCALENDAR',
		'',
	].join('\r\n');
	const url = URL.createObjectURL(
		new Blob([text], { type: 'text/calendar;charset=utf-8' }),
	);
	const link = document.createElement('a');
	link.href = url;
	link.download = 'impact-toastmasters-' + event.date + '.ics';
	link.click();
	setTimeout(() => URL.revokeObjectURL(url), 1000);
}
