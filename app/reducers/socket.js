const initialState = {
  message: null,
  socketId: null,
  clientData: null
};

export default function reducer(state = initialState, action) {
  switch(action.type) {

    case 'message': {
      return Object.assign({}, state, {
        'message': action.payload
      });
    }

    case 'socketId': {
      return Object.assign({}, state, {
        'socketId': action.payload
      });
    }

    case 'clientData': {
      return Object.assign({}, state, {
        'clientData': action.payload
      });
    }

    default:
      return state;
  }
};