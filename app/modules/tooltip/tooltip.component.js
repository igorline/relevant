let Tooltip; // eslint-disable-line
// let native;
if (process.env.WEB !== 'true') {
  // native = true;
  Tooltip = require('modules/tooltip/mobile/tooltip.component').default;
} else {
  Tooltip = require('modules/tooltip/web/tooltip.component').default;
}

export default Tooltip;
