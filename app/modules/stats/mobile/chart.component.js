import React, { Component } from 'react';
import { View } from 'react-native';
import PropTypes from 'prop-types';
import { Bar, StockLine } from 'react-native-pathjs-charts';
import moment from 'moment';
import chartOptions from './chartOptions';

export default class Chart extends Component {
  static propTypes = {
    data: PropTypes.array,
    type: PropTypes.string,
    actions: PropTypes.object,
    auth: PropTypes.object,
    renderHeader: PropTypes.func,
    renderFooter: PropTypes.func
  };

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
    const { type, data, start, end, dataKey } = props;
    const current = new Date(start);
    let min;
    let max;
    this.data = [];

    while (current < end) {
      const entry = data.find(el => new Date(el.date)
      .getTime() === current.getTime());
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
          name: moment(current)
          .utcOffset(0)
          .format('M/D', 'utc')
        });
      } else if (entry) {
        this.data.push({
          y: value,
          x: current.getTime()
        });
      }
      current.setDate(current.getDate() + 1);
    }
    max = Math.ceil(max);
    min = Math.floor(min);

    let tickCount = Math.min(min < 0 ? max - min + 1 : max + 1, 6);
    if (max - min < 1) tickCount = 6;

    if (typeof max !== 'number' || Math.abs(max) < 1) max = 1;
    if (typeof min !== 'number' || Math.abs(min) < 1) min = -1;

    this.chartOptions = {
      ...chartOptions,
      min: min || 0,
      max: max || 1,
      axisY: {
        ...chartOptions.axisY,
        tickCount,
        labelFunction: val => (max - min > 1 ? Math.round(val) : val),
        scale: 10,
        min,
        max
      },
      axisX: {
        ...chartOptions.axisX,
        labelFunction: val =>
          moment(new Date(val))
          .utcOffset(0)
          .format('M/D', 'utc')
      }
    };
  }

  render() {
    const { type } = this.props;
    let chart;

    if (type === 'bar' && this.data.length > 1) {
      chart = (
        <View>
          <Bar data={[this.data]} options={this.chartOptions} accessorKey={'v'} />
        </View>
      );
    } else if (type === 'smooth' && this.data.length > 1) {
      chart = (
        <View>
          <StockLine
            regionStyling={{ fillOpacity: 0 }}
            data={[this.data]}
            options={this.chartOptions}
            xKey={'x'}
            yKey={'y'}
          />
        </View>
      );
    } else {
      return null;
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
