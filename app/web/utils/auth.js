import cookie from 'react-cookie';

export function getToken(){
  var token = cookie.load('token');
  return token;
}