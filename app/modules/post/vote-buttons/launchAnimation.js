import { triggerAnimation } from 'modules/animation/animation.actions';

export default function launchAnimation({ type, params, el, dispatch }) {
  el.current.measureInWindow((x, y, w, h) => {
    const parent = { x, y, w, h };
    if (x + y + w + h === 0) return;
    const action = triggerAnimation(type, { parent, ...params });
    dispatch(action);
  });
}
