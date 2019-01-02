import {
  SHOW_TOOLTIP,
  SET_TOOLTIP_DATA,
  TOOLTIP_READY,
  SET_BUTTON_TOOLTIP
} from 'core/actionTypes';

export function setButtonTooltip(type, id) {
  return {
    type: SET_BUTTON_TOOLTIP,
    payload: { id, type }
  };
}

export function tooltipReady(ready) {
  return {
    type: TOOLTIP_READY,
    payload: ready
  };
}

export function setTooltipData(data) {
  return {
    type: SET_TOOLTIP_DATA,
    payload: data
  };
}

export function showTooltip(name) {
  return {
    type: SHOW_TOOLTIP,
    payload: name
  };
}

export function createToggleAction(name, el) {
  return dispatch => {
    if (!el) return;
    el.measureInWindow((x, y, w, h) => {
      const parent = { x, y, w, h };
      if (x + y + w + h === 0) return;
      dispatch(
        setTooltipData({
          name,
          parent
        })
      );
      dispatch(showTooltip(name));
    });
  };
}
