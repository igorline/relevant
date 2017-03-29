const cheerio = require('cheerio');

export function generatePreview(link) {
  let responseUrl;
  return fetch('/api/post/preview/generate?url=' + link, {
    method: 'GET',
  })
  .then((response) => {
    console.log(response, 'response');
    return response.json();
  })
  .then((responseJSON) => {
    console.log(responseJSON, 'responseJSON');
    return responseJSON;
  })
  .catch((error) => {
    console.log(error, 'error');
    return false;
  });
}
