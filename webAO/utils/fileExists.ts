export default async function fileExists(url: string): Promise<boolean> {
    return fetch(url, {
        method: 'HEAD',
    }).then((response) => {
        return response.ok;
    }).catch(() => {
        return false;
    });
}
