import * as types from 'core/actionTypes';

const initialState = {
  userInvestments: {},
  investments: {},
  myInvestments: [],
  myEarnings: {},
  posts: {},
  loaded: {},
  loadedProfileInv: false,
  myPostInvList: [],
  myPostInv: {}
};

export default function investments(state = initialState, action) {
  switch (action.type) {
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

    case types.UNDO_POST_INVESTMENT: {
      const myPostInvList = state.myPostInvList.filter(p => p !== action.payload);
      return {
        ...state,
        myPostInvList,
        myPostInv: {
          ...state.myPostInv,
          [action.payload]: null
        }
      };
    }

    case types.UPDATE_POST_INVESTMENTS: {
      const postsInv = {};
      const postInvList = action.payload.map(i => {
        postsInv[i.post] = i;
        return i.post;
      });
      return {
        ...state,
        myPostInvList: [...new Set([...state.myInvestments, ...postInvList])],
        myPostInv: {
          ...state.myPostInv,
          ...postsInv
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
