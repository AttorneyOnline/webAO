const fileExistsSync = (url) => {
  try {
    const http = new XMLHttpRequest();
    http.open('HEAD', url, false);
    http.send();
    return http.status != 404;
  } catch (e) {
    return false;
  }
};
export default fileExistsSync;
