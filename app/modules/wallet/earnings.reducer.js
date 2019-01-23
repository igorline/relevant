import * as types from 'core/actionTypes';
import remove from 'lodash/fp/remove';

const initialState = {
  list: [],
  entities: {},
  pending: [],
};

export default function earnings(state = initialState, action) {
  switch (action.type) {
    case types.SET_EARNINGS: {
      return {
        ...state,
        [action.payload.status || 'list']: action.payload.data.result,
        entities: action.payload.data.entities.earnings
      };
    }

    case types.ADD_EARNING: {
      return {
        ...state,
        [action.payload.status]: [
          action.payload._id,
          ...state[action.payload.status]
        ],
        entities: {
          ...state.entities,
          [action.payload._id]: action.payload
        },
        list: [
          action.payload.earning,
          ...state.list
        ]
      };
    }

    case types.REMOVE_EARNING: {
      return {
        ...state,
        entities: {
          ...state.entities,
          [action.payload._id]: null
        },
      };
    }

    case types.UPDATE_EARNING: {
      const { _id, status } = action.payload;
      const { pending } = state;
      return {
        ...state,
        pending: status !== 'pending' ? remove(id => id === _id, pending) : pending,
        entities: {
          ...state.entities,
          [action.payload._id]: action.payload
        },
      };
    }

    default:
      return state;
  }
}
