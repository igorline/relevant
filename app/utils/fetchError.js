export function handleErrors(response) {
  console.log(response, 'error catching any response');
    if (!response.ok) {
        throw Error(response.statusText);
    }
    return response;
}