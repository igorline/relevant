import * as types from '../actions/actionTypes';

const initialState = {
  total: null,
  totalUsers: null,
  users: 0,
};

export default function subscriptions(state = initialState, action) {
  switch (action.type) {
    case types.SET_SUBSCRIPTIONS: {
      let total = 0;
      let totalUsers = 0;
      let users = {};
      action.payload.forEach(sub => {
        users[sub.following] = sub;
        total += sub.amount;
        totalUsers += 1;
      });
      return {
        total,
        totalUsers,
        users
      };
    }
    default: return state;
  }
}