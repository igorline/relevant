export function handleErrors(response) {
    if (!response.ok) {
        console.log(response, 'error response')
        throw Error(response.statusText);
        return false;
    }
    return response;
}