/**
* @function autoSuggest
* @param {Node} input
* @description Add autoSuggest to `input`, listen for event `autoSuggestSelect`
* @example
* <input type="search" minlength="3" list="[LIST]" data-api="[API]" data-api-cache="[0||1]" data-api-key="[KEY]">
* <datalist id="[LIST]"></datalist>
*/
function autoSuggest(input) {
	const cache = input.dataset.apiCache - 0 || 0;
	let data = [];
	const debounced = (delay, fn) => {
		let timerId;
		return function(...args) {
			if (timerId) clearTimeout(timerId);
			timerId = setTimeout(() => { fn(...args); timerId = null }, delay)
		}
	}
	const list = document.getElementById(input.getAttribute('list'));

	const onentry = async function(event) {
		const value = input.value.length >= input.minLength && input.value.toLowerCase();
		if (!value) return;
		if (event.inputType == "insertReplacementText" || event.inputType == null) {
			const option = selected(); 
			if (option) input.dispatchEvent(new CustomEvent('autoSuggestSelect', { detail: JSON.parse(option.dataset.obj) }));
			return;
		}
		if (!data.length || cache === 0) {
			data = await (await fetch(input.dataset.api + encodeURIComponent(value))).json();
			list.innerHTML = data.map(obj => `<option value="${obj[input.dataset.apiKey]}" data-obj='${obj ? JSON.stringify(obj):''}'>`).join('')
		}
	}
	const reset = () => { data = []; list.innerHTML = `<option value="">` }
	const selected = () => {
		const option = [...list.options].filter(entry => entry.value === input.value);
		return option.length === 1 ? option[0] : 0;
	}

	input.addEventListener('input', debounced(200, event => onentry(event)));
	input.addEventListener('search', () => input.value.length === 0 ? reset() : '');
}