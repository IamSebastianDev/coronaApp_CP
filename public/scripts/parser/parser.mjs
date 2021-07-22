/** @format */

// import data
import dataSrc from './deinkinotickets.js';

// get the films array
let films = dataSrc.cinemas[0].films;

// create the Date string to compare showtimes against
const DT = new Date();

const dateString = `${DT.getFullYear()}-${
	DT.getMonth() + 1 < 10 ? '0' + (DT.getMonth() + 1) : DT.getMonth() + 1
}-${DT.getDate() < 10 ? '0' + DT.getDate() : DT.getDate()}`;

// create array
let showsToday = [];

// extract shows from dataSrc and merge with title
films.forEach((film) => {
	film.performances.forEach((show) =>
		show.starts_at.includes(dateString)
			? showsToday.push({ title: film.title, show: show })
			: null
	);
});

// current time
const currentTime = new Date(Date.now() - 60000);

// filter the past shows
let filteredShows = showsToday.filter(
	(elem) => new Date(elem.show.starts_at) > currentTime
);

// sort shows
let sortedShows = filteredShows.sort(
	(a, b) => new Date(a.show.starts_at) - new Date(b.show.starts_at)
);

// create the export object
let shows = {
	today: showsToday,
	filtered: filteredShows,
	sorted: sortedShows,
};

export { shows };
