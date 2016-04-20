export function handleErrors(response) {
    if (!response.ok) {
        throw Error(response.statusText);
        return false;
    }
    return response;
}