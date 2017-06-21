import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet
} from 'react-native';
import { Bar, SmoothLine, StockLine } from 'react-native-pathjs-charts';
import moment from 'moment';
import chartOptions from './chartOptions';
import { globalStyles, blue } from '../../styles/global';

let styles;

export default class Chart extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      refreshing: false
    };

    this.load = this.load.bind(this);
    this.data = [];
    this.chartData = this.chartData.bind(this);
  }

  componentWillMount() {
    if (this.props.data) {
      if (this.props.data.length < 2 && this.props.type === 'smooth') {
        return;
      }
      this.data = [];
      this.chartData(this.props);
    }
  }

  componentWillReceiveProps(next) {
    if (next.data !== this.props.data && next.data.length) {
      if (next.data) {
        if (next.data.lenght < 2 && this.props.type === 'smooth') return;
        this.data = [];
        this.chartData(next);
      }
    }
  }

  load() {
    this.end = new Date();
    this.start = new Date();
    this.end.setUTCHours(0, 0, 0, 0);
    this.start.setUTCHours(0, 0, 0, 0);
    this.start.setDate(this.start.getDate() - 14);
    this.props.actions.getStats(this.props.auth.user);
    this.props.actions.getChart(this.start, this.end);
  }

  chartData(props) {
    let { type, data, start, end, dataKey } = props;


    let current = new Date(start);
    let min;
    let max;
    this.data = [];

    let x = 0;

    while (current < end) {
      let entry = data.find(el => {
        return new Date(el.date).getTime() === current.getTime();
      });
      let value;
      if (type === 'bar') {
        value = entry ? entry[dataKey] : 0;
      } else {
        value = entry ? entry.aggregateRelevance / entry.totalSamples : 0;
      }

      min = min || value;
      max = max || value;
      min = Math.min(min, value);
      max = Math.max(max, value);

      if (type === 'bar') {
        this.data.push({
          v: value,
          name: moment(current).utcOffset(0).format('M/D', 'utc')
        });
      } else if (entry) {
        this.data.push({
          y: value,
          x: current.getTime()
        });
        x += 1;
      }
      current.setDate(current.getDate() + 1);
    }
    max = Math.ceil(max);
    min = Math.floor(min);

    let tickCount = Math.min(min < 0 ? (max - min) + 1 : max + 1, 6);
    if (max - min < 1) tickCount = 6;

    if (typeof max !== 'number' || Math.abs(max) < 1) max = 1;
    if (typeof min !== 'number' || Math.abs(min) < 1) min = -1;

    this.chartOptions = {
      ...chartOptions,
      min: min || 0,
      max: max || 1,
      // color: blue,
      axisY: {
        ...chartOptions.axisY,
        tickCount,
        labelFunction: val => (max - min) > 1 ? Math.round(val) : val,
        scale: 10,
        min,
        max,
      },
      axisX: {
        ...chartOptions.axisX,
        labelFunction: val => moment(new Date(val)).utcOffset(0).format('M/D', 'utc')
      }
    };
  }

  render() {
    let { type } = this.props;
    let chart;

    if (type === 'bar' && this.data.length > 1) {
      chart = (
        <View>
          <Bar
            data={[this.data]}
            options={this.chartOptions}
            accessorKey={'v'}
          />
        </View>
      );
    } else if (type === 'smooth' && this.data.length > 1) {
      chart = (
        <View>
          <StockLine
            regionStyling={{ fillOpacity: 1 }}
            data={[this.data]}
            options={this.chartOptions}
            xKey={'x'}
            yKey={'y'}
          />
        </View>
      );
    } else {
      return null;
      // chart = (<View>
      //   <Text style={styles.noData}>There is not enough data to display this chart</Text>
      // </View>);
    }
    return (
      <View>
        {this.props.renderHeader()}
        {chart}
        {this.props.renderFooter()}
      </View>
    );
  }
}


let localStyles = StyleSheet.create({
  noData: {
    flex: 1,
    textAlign: 'center',
    paddingVertical: 30,
  },
});

styles = { ...globalStyles, ...localStyles };

