export default function auth(state = null, action) {
  switch (action.type) {

    case 'SET_ONLINE_USERS': {
      return action.payload.users;
    }

    default:
      return state;
  }
}
