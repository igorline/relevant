export function handleErrors(response) {
  if (!response.ok) {
    console.log('error response', response);
    throw Error(response.statusText);
    return false;
  }
  return response;
}
