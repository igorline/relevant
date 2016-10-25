import { CHANGE_TAB } from '../actions/actionTypes';


const tabs = [
  { key: 'read', icon: '📩', title: 'Read' },
  { key: 'discover', icon: '🔮', title: 'Discover' },
  { key: 'createPost', icon: '📝', title: 'Create Post' },
  { key: 'activity', icon: '⚡', title: 'Activity' },
  { key: 'profile', icon: '👤', title: 'Profile' }
];

const initialState = {
  index: 0,
  routes: tabs
};

export default function tabsNav(state = initialState, action) {
  if (action.index === state.index) return state;
  switch (action.type) {
    case CHANGE_TAB:
      return {
        ...state,
        index: action.index
      };
    default:
      return state;
  }
}
