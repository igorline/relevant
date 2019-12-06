import * as types from 'core/actionTypes';

const initialState = {
  userInvestments: {},
  investments: {},
  myInvestments: [],
  myEarnings: {},
  posts: {},
  loaded: {},
  loadedProfileInv: false,
  voteSuccess: null
};

export default function investments(state = initialState, action) {
  switch (action.type) {
    case types.UPDATE_POST_INVESTMENTS: {
      return {
        ...state,
        voteSuccess: action.payload
      };
    }

    case types.LOADING_POST_INVESTMENTS: {
      return {
        ...state,
        loaded: {
          ...state.loaded,
          [action.payload]: false
        }
      };
    }

    case types.SET_POST_INVESTMENTS: {
      const post = state.posts[action.payload.postId] || [];
      return {
        ...state,
        posts: {
          ...state.posts,
          [action.payload.postId]: [
            ...post.slice(0, action.payload.index),
            ...action.payload.data.result.investments
          ]
        },
        loaded: {
          ...state.loaded,
          [action.payload.postId]: true
        },
        investments: {
          ...state.investments,
          ...action.payload.data.entities.investments
        }
      };
    }

    case types.UPDATE_EARNINGS: {
      const earnings = {};
      action.payload.forEach(earning => {
        earnings[earning.post] = earning;
      });
      return {
        ...state,
        myEarnings: {
          ...state.myEarnings,
          ...earnings
        }
      };
    }

    case 'SET_INVESTMENTS': {
      const id = action.payload.userId;
      const currentInvestments = state.userInvestments[id] || [];
      return {
        ...state,
        userInvestments: {
          ...state.userInvestments,
          [id]: [
            ...currentInvestments.slice(0, action.payload.index),
            ...action.payload.investments.result.investments
          ]
        },
        investments: {
          ...state.investments,
          ...action.payload.investments.entities.investments
        },
        loadedProfileInv: true
      };
    }

    case 'LOADING_INVESTMENTS': {
      return {
        ...state,
        loadedProfileInv: false
      };
    }

    case types.LOGOUT_USER: {
      return { ...initialState };
    }

    default:
      return state;
  }
}
