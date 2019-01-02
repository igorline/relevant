import { fullWidth, blue, darkGrey } from 'app/styles/global';

const options = {
  width: fullWidth - 50,
  height: 100,
  margin: {
    top: 20,
    left: 30,
    bottom: 50
    // right: 20
  },
  color: blue,
  gutter: 4,
  strokeWidth: '6',
  showAreas: false,
  animate: {
    type: 'oneByOne',
    duration: 200,
    fillTransition: 3
  },
  axisX: {
    // showAxis: true,
    showLines: true,
    showLabels: true,
    showTicks: false,
    zeroAxis: false,
    orient: 'bottom',
    strokeWidth: '0.5',
    tickCount: 14,
    opacity: 0.5,
    gridColor: '#979797',
    tailLength: 1,
    label: {
      fontFamily: 'Arial',
      fontSize: 7,
      fontWeight: 0,
      stroke: darkGrey,
      // fill: darkGrey,
      rotate: 0,
      bold: false
    }
  },
  axisY: {
    // showAxis: true,
    // showLines: true,
    // zeroAxis: false,
    showLabels: true,
    color: blue,
    orient: 'left',
    strokeWidth: '0.5',
    opacity: 1,
    gridColor: 'rgb(77, 78, 255, .2)',
    tailLength: 1,
    label: {
      fontFamily: 'Arial',
      fontSize: 7,
      fontWeight: 0,
      stroke: darkGrey,
      strokeWeight: 0.5,
      bold: false
    }
  }
};

export default options;
