import { Dimensions } from 'react-native';
import { setTooltipData, showTooltip } from 'modules/tooltip/tooltip.actions';

const defaultData = {
  vertical: 'top',
  horizontal: 'right',
  horizontalOffset: 0,
  verticalOffset: 10
};

export function setupMobileTooltips({ tooltips, dispatch }) {
  // this is used to programatically trigger toolitps
  // needs name refactor
  const initTooltips = () => {
    tooltips.forEach(tooltip => {
      if (tooltip.data.desktopOnly) return null;
      return dispatch(
        setTooltipData({
          name: tooltip.name,
          toggle: () => toggleTooltip(tooltip.name)
        })
      );
    });
  };

  const toggleTooltip = name => {
    tooltips.forEach(tooltip => {
      if (tooltip.data.desktopOnly) return;
      if (!tooltip.el.current) return;
      tooltip.el.current.measureInWindow((x, y, w, h) => {
        const parent = { x, y, w, h };
        if (x + y + w + h === 0) return;
        const fullHeight = Dimensions.get('window').height;
        if (y > fullHeight - 50) return;
        dispatch(
          setTooltipData({
            name: tooltip.name,
            parent,
            ...defaultData,
            data: tooltip.data
          })
        );
        dispatch(showTooltip(name));
      });
    });
  };

  return { initTooltips, toggleTooltip };
}
