/* eslint @typescript-eslint/no-explicit-any: "off" */

/**
 * set a cookie
 * the version from w3schools expects these to expire
 * @param {string} cname The name of the cookie to return
 * @param {any} value The value of that cookie option
 */
const setCookie = (cname: string, value: any) => {
  document.cookie = `${cname}=${value};SameSite=Strict`;
};
export default setCookie;
