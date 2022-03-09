/**
 * set a cookie
 * the version from w3schools expects these to expire
 * @param {String} cname The name of the cookie to return
 * @param {String} value The value of that cookie option
 */
const setCookie = (cname, value) => {
  document.cookie = `${cname}=${value}`;
};
export default setCookie;
