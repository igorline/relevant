export default function reducer(state = {}, action){
  switch(action.type){
    case 'message':
      return Object.assign({}, {message:action.payload});
    default:
      return state;
  }
}