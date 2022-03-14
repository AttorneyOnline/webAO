/* eslint no-restricted-globals: 'off', prefer-destructuring: 'off' */
const queryParser = () => {
	const queryDict = {};
	location.search.substr(1).split('&').forEach((item) => {
		queryDict[item.split('=')[0]] = item.split('=')[1];
	});
	return queryDict;
};
export default queryParser;
