export default function debounced(delay, fn) {
	let timerId;
	return function(...args) {
		if (timerId) clearTimeout(timerId);
		timerId = setTimeout(() => { fn(...args); timerId = null }, delay)
	}
}