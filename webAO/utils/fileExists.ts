const fileExists = async (url) => new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.open('HEAD', url);
    xhr.onload = function checkLoad() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                resolve(true);
            } else {
                resolve(false);
            }
        }
    };
    xhr.onerror = function checkError() {
        resolve(false);
    };
    xhr.send(null);
});
export default fileExists;
