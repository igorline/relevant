import { Dimensions } from 'react-native';
import { setTooltipData, showTooltip } from 'modules/tooltip/tooltip.actions';

export function setupMobileTooltips({ tooltips, dispatch }) {
  const initTooltips = () => {
    tooltips.forEach(tooltip => {
      dispatch(
        setTooltipData({
          name: tooltip.name,
          toggle: () => toggleTooltip(tooltip.name)
        })
      );
    });
  };

  const toggleTooltip = name => {
    tooltips.forEach(tooltip => {
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
            data: tooltip.data
          })
        );
        dispatch(showTooltip(name));
      });
    });
  };

  return { initTooltips, toggleTooltip };
}
