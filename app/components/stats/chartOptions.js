import { fullWidth, blue, darkGrey } from '../../styles/global';

let options = {
  width: fullWidth - 40,
  height: 100,
  margin: {
    top: 25,
    left: 25,
    bottom: 50,
    right: 20
  },
  color: blue,
  gutter: 10,
  animate: {
    type: 'oneByOne',
    duration: 200,
    fillTransition: 3
  },
  axisX: {
    showAxis: true,
    // showLines: true,
    showLabels: true,
    showTicks: false,
    zeroAxis: false,
    orient: 'bottom',
    strokeWidth: 0.5,
    opacity: 1,
    gridColor: 'rgb(77, 78, 255, .2)',
    tailLength: .1,
    label: {
      fontFamily: 'System',
      fontSize: 8,
      fontWeight: 100,
      fill: darkGrey,
      rotate: 0,
      bold: false,
    }
  },
  axisY: {
    showAxis: true,
    // showLines: true,
    showLabels: true,
    color: blue,
    orient: 'left',
    strokeWidth: 0.5,
    opacity: 1,
    gridColor: 'rgb(77, 78, 255, .2)',
    tailLength: .1,
    label: {
      fontFamily: 'System',
      fontSize: 8,
      fontWeight: 100,
      fill: darkGrey,
      bold: false,
    }
  }
};

export default options;
