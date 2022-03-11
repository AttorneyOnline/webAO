const fileExists = async (url) => {
  const xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.onload = function (e) {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        return true;
      }
      return false;
    }
  };
  xhr.onerror = function (e) {
    return false;
  };
  xhr.send(null);
};
export default fileExists;
