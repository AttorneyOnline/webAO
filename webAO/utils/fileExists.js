const fileExists = async (url) => {
  const xhr = new XMLHttpRequest();
  xhr.open('HEAD', url, false);
  xhr.send();

  return xhr.status === 200;
};
export default fileExists;
