import datasetToType from './datasettotype.mjs';
import debounced from './debounced.mjs';

/**
* @function autoSuggest
* @param {Node} input
* @param {Object} args
* @description Add autoSuggest to `input`, listen for event `autoSuggestSelect`
* @example
* <input type="search" minlength="3" list="[LIST]" data-api="[API]" data-api-cache="[0||1]" data-api-key="[KEY]">
* <datalist id="[LIST]"></datalist>
*/
export default function autoSuggest(input, args) {
	const list = document.getElementById(input.getAttribute('list'));
	if (!list) return;

	const settings = Object.assign({
		api: '',
		apiCache: false,
		apiKey: '',
		invalid: 'Not a valid selection',
		limit: false
	}, datasetToType(args));

	let data = [];

	/* only allow input.value to match an item from the list */
	const limit = () => {
		const option = selected();
		input.setCustomValidity(option ? '' : settings.invalid);
		if (!input.checkValidity()) {
			input.reportValidity();
			console.log('invalid');
		}
		else {
			console.log('valid');
		}
	}

	/* event “oninput” */
	const onentry = async function(event) {
		const value = input.value.length >= input.minLength && input.value.toLowerCase();
		if (!value) return;

		/* “onselect” for datalist, work for both clicks and “Enter”: */
		if (event.inputType == "insertReplacementText" || event.inputType == null) {
			const option = selected();
			if (option) {
				/* Dispatch the selected option as a custom event, reset the list */
				input.dispatchEvent(new CustomEvent('autoSuggestSelect', { detail: JSON.parse(option.dataset.obj) }));
				reset();
			}
			return;
		}
		/* If data-array is empty, or data should be cached (api will only get contacted once) */
		if (!data.length || settings.apiCache === false) {
			data = await (await fetch(settings.api + encodeURIComponent(value))).json();
			list.innerHTML = data.map(obj => `<option value="${obj[settings.apiKey]}" data-obj='${obj ? JSON.stringify(obj):''}'>`).join('')
		}
	}

	/* empty data-array, set list to empty `<option>` */
	const reset = () => { data = []; list.innerHTML = `<option value="">`;  input.setCustomValidity('') }

	/* returns option from list, that matches current input.value */
	const selected = () => {
		const option = [...list.options].filter(entry => entry.value === input.value);
		return option.length === 1 ? option[0] : 0;
	}

	input.addEventListener('input', debounced(200, event => onentry(event)));
	input.addEventListener('search', () => input.value.length === 0 ? reset() : settings.limit ? limit() : '');
}