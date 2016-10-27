import { CHANGE_TAB } from '../actions/actionTypes';


const tabs = [
  { key: 'read', icon: '📩', title: 'Read', regIcon: require('../assets/images/read.png') },
  { key: 'discover', icon: '🔮', title: 'Discover', regIcon: require('../assets/images/discover.png') },
  { key: 'createPost', icon: '📝', title: 'Create Post', regIcon: require('../assets/images/createPost.png') },
  { key: 'activity', icon: '⚡', title: 'Activity', regIcon: require('../assets/images/activity.png') },
  { key: 'myProfile', icon: '👤', title: 'Profile', regIcon: require('../assets/images/profile.png') }
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
