import * as types from 'core/actionTypes';

const initialState = {
  total: null,
  totalUsers: null,
  users: 0
};

export default function subscriptions(state = initialState, action) {
  switch (action.type) {
    case types.SET_SUBSCRIPTIONS: {
      let total = 0;
      let totalUsers = 0;
      const users = {};
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

    case types.LOGOUT_USER: {
      return { ...initialState };
    }

    default:
      return state;
  }
}
