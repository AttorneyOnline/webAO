const fileExists = async (url) => new Promise((resolve) => {
	const xhr = new XMLHttpRequest();
	xhr.open('HEAD', url);
	xhr.onload = () => {
		if (xhr.readyState === 4) {
			if (xhr.status === 200) {
				resolve(true);
			} else {
				resolve(false);
			}
		}
	};
	xhr.onerror = () => {
		resolve(false);
	};
	xhr.send(null);
});
export default fileExists;
