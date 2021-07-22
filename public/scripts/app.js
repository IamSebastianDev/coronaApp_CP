/** @format */

// loader controller

const loader = {
	element: document.querySelector('.loader'),
	setActive() {
		this.element.style = '';
		this.element.setAttribute('state', 'visible');
	},
	setInactive() {
		this.element.style = 'opacity: 0';
		window.setTimeout(() => {
			this.element.setAttribute('state', 'hidden');
		}, 300);
	},
};

// state object used to track page state
const pageState = {
	started: false,
	group: [],
};

let form = document.querySelector('form.tracker-form');
let formContainer = document.querySelector('.tracker-form-container');

const createForms = (numberOfPeople) => {
	while (formContainer.lastElementChild) {
		formContainer.lastElementChild.remove();
	}

	for (let i = 0; i < numberOfPeople; i++) {
		formContainer.appendChild(form.cloneNode(true));
		formContainer.lastElementChild.querySelector('h3').textContent = `${
			i + 1
		}. Person`;
	}
};

const handleFormAction = (ev) => {
	let lastName;

	if (document.querySelector("input[name='nachname']").value != '') {
		lastName = document.querySelector("input[name='nachname']").value;
		document
			.querySelector('.button-setLastname')
			.setAttribute('state', 'active');
	}

	if (ev.target.matches('#tracker-addPerson')) {
		pageState.groupCount++;
		formContainer.appendChild(
			formContainer.lastElementChild.cloneNode(true)
		);
		formContainer.lastElementChild.querySelector('h3').textContent = `${
			document.querySelectorAll('.tracker-form').length
		}. Person`;
		formContainer.lastElementChild.querySelector('button').remove();
		formContainer.lastElementChild
			.querySelectorAll('input')
			.forEach((input) => (input.value = ''));
	}
	if (ev.target.matches('#tracker-deletePerson')) {
		if (pageState.groupCount > 1) {
			pageState.groupCount--;
			formContainer.lastElementChild.remove();
		}
	}

	if (ev.target.matches('.button-setLastname')) {
		ev.preventDefault();

		let names = document.querySelectorAll("input[name='nachname']");

		names.forEach((field) => (field.value = lastName));
	}

	if (ev.target.matches('#tracker-submit')) {
		ev.preventDefault();

		const form = document.querySelector('.tracker-form-container');
		let forms = form.querySelectorAll('form');

		const validateForm = () => {
			let errors = [];

			forms.forEach((form) => {
				// check inputs
				let inputs = form.querySelectorAll('input');

				if (inputs[0].value == '') {
					errors.push({
						elem: inputs[0],
						msg: 'Bitte gebe einen Namen an.',
					});
				} else if (inputs[0].value.length < 3) {
					errors.push({
						elem: inputs[0],
						msg:
							'Bitte gebe einen Namen mit mehr als 3 Zeichen an.',
					});
				}

				if (inputs[1].value == '') {
					errors.push({
						elem: inputs[1],
						msg: 'Bitte gebe einen Namen an.',
					});
				} else if (inputs[1].value.length < 3) {
					errors.push({
						elem: inputs[1],
						msg:
							'Bitte gebe einen Namen mit mehr als 3 Zeichen an.',
					});
				}

				if (inputs[2].value != '' || inputs[3].value != '') {
					if (inputs[2].value != '') {
						if (inputs[2].value.length < 5) {
							errors.push({
								elem: inputs[2],
								msg:
									'Bitte gebe einen korrekte Telefonnummer an.',
							});
						} else if (
							inputs[2].value.search(/[a-zA-Z]/gim) != -1
						) {
							errors.push({
								elem: inputs[2],
								msg:
									'Deine Telefonnummer sollte keine Buchstaben enthalten.',
							});
						}
					} else if (inputs[3].value != '') {
						if (!inputs[3].value.match(/.*\@.*\..*/gim)) {
							errors.push({
								elem: inputs[3],
								msg: 'Bitte gebe eine gültige Emailadresse an.',
							});
						}
					}
				} else {
					errors.push({
						elem: inputs[2],
						msg:
							'Bitte gebe eine gültige Emailadresse ODER gültige Telefonnummer an.',
					});
					errors.push({
						elem: inputs[3],
						msg:
							'Bitte gebe eine gültige Emailadresse ODER gültige Telefonnummer an.',
					});
				}
			});

			if (errors.length == 0) {
				return {
					state: true,
				};
			} else {
				return {
					errors: errors,
				};
			}
		};

		const validation = validateForm();

		const sendData = async () => {
			let result = await fetch('/api', {
				method: 'POST', // *GET, POST, PUT, DELETE, etc.
				mode: 'cors', // no-cors, *cors, same-origin
				cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
				credentials: 'same-origin', // include, *same-origin, omit
				headers: {
					'Content-Type': 'application/json',
					// 'Content-Type': 'application/x-www-form-urlencoded',
				},
				redirect: 'follow', // manual, *follow, error
				referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
				body: JSON.stringify(pageState), // body data type must match "Content-Type" header
			}).then((res) => res.json());

			if (result.success) {
				document.querySelector(
					'.tracker-success-personcount'
				).textContent = `Es ${
					pageState.group.length == 1 ? 'wurde' : 'wurden'
				} ${pageState.group.length} ${
					pageState.group.length == 1 ? 'Person' : 'Personen'
				} registriert.`;
				Router.currentPage = 4;
				document.querySelector('body').style.background =
					'var(--color-success)';
				Router.rout();
				loader.setInactive();
			} else {
				Router.currentPage = 5;
				document.querySelector('body').style.background =
					'var(--color-failure)';
				Router.rout();
				loader.setInactive();
			}
		};

		if (validation.state) {
			// set loader
			loader.setActive();

			// if form validated correctly, save the inputs data into a group object
			forms.forEach((form) => {
				let inputs = form.querySelectorAll('input');

				pageState.group.push({
					firstName: inputs[0].value,
					lastName: inputs[1].value,
					phone: inputs[2].value,
					email: inputs[3].value,
				});
			});

			// send data
			sendData();
		} else {
			validation.errors.forEach((err) => {
				let msg = document.createElement('span');
				msg.textContent = err.msg;
				msg.className = 'tracker-form-error';

				err.elem.parentElement.insertBefore(msg, err.elem);
				err.elem.setAttribute('state', 'error');
				err.elem.addEventListener('blur', (ev) => {
					msg.remove();
					err.elem.setAttribute('state', 'no-error');
				});
			});
		}
	}
};

window.addEventListener('click', (ev) => handleFormAction(ev));

// create minimal router
const Router = {
	sections: document.querySelectorAll('section'),
	navRet: document.querySelector('.header-return'),
	navAdv: document.querySelector('.header-forward'),
	maximum: 0,
	currentPage: 0,
	setButtons() {
		if (this.currentPage < 4) {
			// check page index
			if (this.currentPage < this.maximum) {
				this.navAdv.setAttribute('state', 'visible');
			} else {
				this.navAdv.setAttribute('state', 'inactive');
			}

			if (this.currentPage > 0) {
				this.navRet.setAttribute('state', 'visible');
			} else {
				this.navRet.setAttribute('state', 'inactive');
			}
		} else {
			this.navAdv.setAttribute('state', 'inactive');
			this.navRet.setAttribute('state', 'inactive');
		}
	},
	rout() {
		// set main navigation buttons
		this.setButtons();

		this.sections.forEach((sec, i) =>
			i == this.currentPage
				? sec.setAttribute('state', 'visible')
				: sec.setAttribute('state', 'hidden')
		);
	},
	init() {
		this.currentPage = 0;
		this.rout();
	},
	adv() {
		if (this.currentPage < this.sections.length - 1) {
			if (this.maximum == this.currentPage) {
				this.maximum++;
			}
			this.currentPage++;
			this.rout();
		}
	},
	ret() {
		if (this.currentPage > 0) {
			this.currentPage--;
			this.rout();
		}
	},
	handleRouting(ev) {
		if (ev.target.matches('.tracker-init')) {
			pageState.started = true;
			this.adv();
		}

		if (ev.target.matches('.button-count')) {
			pageState.groupCount = parseInt(ev.target.value);

			// call the form creator
			createForms(pageState.groupCount);

			this.adv();
		}

		if (ev.target.matches('.input-count') && ev.type == 'change') {
			pageState.groupCount = ev.target.value;

			// call the form creator
			createForms(pageState.groupCount);

			this.adv();
		}

		if (ev.target.closest('.button-showTime')) {
			let dsSrc;

			if (ev.target.matches('.button-showTime')) {
				dsSrc = ev.target;
			} else {
				dsSrc = ev.target.parentElement;
			}

			pageState.show = {
				showId: dsSrc.getAttribute('showid'),
				title: dsSrc.getAttribute('title'),
				date: dsSrc.getAttribute('date'),
				time: dsSrc.getAttribute('time'),
			};

			this.adv();
		}

		// reset page on retry button
		if (ev.target.matches('.button-retry')) {
			this.currentPage = 0;
			this.maximum = 0;
			pageState = { started: false, group: [] };
			this.rout();
		}

		if (ev.target.closest('.header-return')) {
			this.ret();
		}
		if (ev.target.closest('.header-forward')) {
			this.adv();
		}
	},
};

window.addEventListener('click', (ev) => Router.handleRouting(ev));
window.addEventListener('change', (ev) => Router.handleRouting(ev));

// import shows
import { shows } from './parser/parser.mjs';
console.log(shows);

// function to create buttons für heutige shows
const createShowButtons = (show) => {
	let button = document.createElement('button');
	button.className = 'button-fullWidth button-showTime';
	button.setAttribute('showid', show.show.id);
	button.setAttribute('title', show.title);
	button.setAttribute('date', show.show.starts_at.split('T')[0]);
	button.setAttribute('time', show.show.starts_at.split('T')[1]);

	let title = document.createElement('h3');
	title.textContent = show.title;

	let time = document.createElement('span');
	time.textContent = `${show.show.starts_at.split('T')[1]}`;

	button.appendChild(title);
	button.appendChild(time);

	return button;
};

// get show container
const showContainer = document.querySelector('.tracker-show-container');

// check if filtered shows are available
if (shows.sorted.length != 0) {
	// create the show buttons
	shows.sorted.forEach((show) =>
		showContainer.appendChild(createShowButtons(show))
	);
} else {
	// show no more shows available
	document.querySelector('.show_state').setAttribute('state', 'visible');
}

window.addEventListener('load', (ev) => {
	Router.rout();
	loader.setInactive();
});
