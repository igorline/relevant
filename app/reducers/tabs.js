import { CHANGE_TAB } from '../actions/actionTypes';

const readIcon = {
  scale: 1.3,
  uri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAZCAYAAADE6YVjAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyRpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoTWFjaW50b3NoKSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo5Q0FCRDFEMzkzRjYxMUU2QUIwM0IxM0I2OTVEMkRDNiIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDo5Q0FCRDFENDkzRjYxMUU2QUIwM0IxM0I2OTVEMkRDNiI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOkZGNUU5NTZFOTNGNDExRTZBQjAzQjEzQjY5NUQyREM2IiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjlDQUJEMUQyOTNGNjExRTZBQjAzQjEzQjY5NUQyREM2Ii8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+c9P1yAAAA7dJREFUeNqsVltLVFEUXufMmTzOjLdsvOLoaCJeMhEVlehBgi5EvRRBD0YGFUXP/YIe6iGCeu5JkIggegwfhLxLaWRNDz6IoaUzQs7ojJfjOe1v2T6dyqnTZcFGzt57rW993/72HlXLssjNiDy4d2HYR1Yk5LdeBsl6dfPabbe5GrkMrxgVKtE+j0JrIuuTSq7jD7YSWY7xJ+EaRN2zJ+VEUzVt023ub+Waefzo0MeHDy+XJGLlgYBOppjL8OmkDz4/NXb+aIWv68TTA5duPCFF/XsmZceOTwbyssk79OqwrnlYKq/XS3rkfaMnGQ+FT5598SuAHeYu3GFsb9P01Yv3P/jJ2gr7rWghWa/PHXm2Hl/R3eSTWxsapklvr/fceecl682ZI49SibjrXGVjY4PW1tYq8vLy9m6LjtOFoqqmsbVF7+7fvbK/u6fPFyz4bBqGlk4dTdMoHo8nhbTvlbm5Oerr63va3d19uqioiEzT3DVpB0khVVWT26aVKRCV7yRxSA+AlZUV6u3tfdvV1XVQxWQ4HFanpqZofn4eRXgooiCGE8gUTAUb348AvCaaw/B4PBSLxWhsbIwqKysV8a2okEhIZXZ2dtLo6CiBGcIwjLRjS8gm/zoHYnFxkQYHB6m1tZVKSkpM1GfvbW5uUnZ2NnV0dDDQ7OwsU/4dgHNOAgwNDVFLSwtB+vX19W+XEWipVIqysrKovb2dNyIxFAoRjOGUZDeZ0NDS0hJL1NbWRoWFhVxPGkmD7vhAUSAHAgHeODw8zHNlZWXMNB2QBBgfH2cGBQUFlEwmKSMjg1naTPCBQlJbAEHTkZERXistLf0OyMkgGo0yg+bmZhuAnxJhHgmiSrmcBwiqAEJnAwMDNDMzw05z7sE3GPT391NDQ4MN4NxjM3HKJQ9QFoR8dXV1NDk5yZ2DEeYkg4mJCaqpqeGc1dVVtq+8M04m9sFLuQCAgvA6ipWXl7PzUFCaQZ5BY2MjbErLy8t8x4LBIOfwUyLq/ATitCQAMjMzuTgk8Pl81NTUxIzQMSxeW1tL+fn5eJJ4HY0tLCzwHA5d1gOYLRcGCqIrWBlnAnbSGH6/nztHx5AIxeQ9QOi6zgxwV3JzcyknJ+ebheWTkUgkWGdsAAsJIANAKFRdXc37cX9++j9A/M4gH41KB9oHLxI00IZDQBWLOLi0L/LOQ7nrGhosLi7GCwyXarZc09PTUUE9JvaY9ov7D/G1CSUSiSziYmvQtr6+/qZAvgUQ+n+hVFVVpcSLYXwRYABg+nJnjxSt2wAAAABJRU5ErkJggg=='
};


const tabs = [
  { key: 'read', icon: '📩', title: 'Read', regIcon: readIcon },
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
