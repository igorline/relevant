import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  InteractionManager,
  View,
  RefreshControl,
  FlatList
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import moment from 'moment';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { globalStyles, blue, darkGrey } from '../../styles/global';
import * as navigationActions from '../../actions/navigation.actions';
import * as authActions from '../../actions/auth.actions';
import StatCategory from './statCategoryView.component';
import Chart from './chart.component';
import CustomSpinner from '../CustomSpinner.component';
import ErrorComponent from '../error.component';
import EmptyList from '../emptyList.component';

let styles;

class StatsContainer extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      refreshing: false,
      loading: true
    };
    this.renderItem = this.renderItem.bind(this);
    this.renderHeader = this.renderHeader.bind(this);
    this.load = this.load.bind(this);
  }

  componentWillMount() {
    this.load();
  }

  componentWillUpdate(next) {
    if (next.auth.stats !== this.props.auth.stats) {
      this.setState({ refreshing: false });
      this.setState({ loading: false });
    }
    if (next.error && this.props.error) {
      this.setState({ refreshing: false });
    //   this.setState({ loading: false });
    }
    if (this.props.refresh !== next.refresh && this.list) {
      this.list.scrollToOffset({ y: 0 });
    }
  }

  load() {
    this.end = new Date();
    this.start = new Date();
    this.relStart = new Date();

    this.end.setUTCHours(0, 0, 0, 0);
    this.start.setUTCHours(0, 0, 0, 0);
    this.relStart.setUTCHours(0, 0, 0, 0);

    this.start.setDate(this.start.getDate() - 7);
    this.relStart.setDate(this.start.getDate() - 28);

    this.props.actions.getChart(this.start, this.end);

    this.props.actions.getRelChart(this.relStart, this.end);

    this.props.actions.getStats(this.props.auth.user);
  }

  renderHeader() {
    let nextUpdate = moment(this.props.auth.nextUpdate).fromNow(true);
    let chart;
    let relChart;

    chart = (<Chart
      start={this.start}
      end={this.end}
      type={'bar'}
      dataKey={'change'}
      data={this.props.auth.chart}
      renderHeader={() => <Text style={styles.rowTitle}>Relevance - Daily Change</Text>}
      renderFooter={() => (<LinearGradient
        colors={[
          'hsla(240, 0%, 60%, 1)',
          'hsla(240, 20%, 96%, 1)',
          'hsla(240, 20%, 100%, 1)',
        ]}
        style={[styles.separator]}
      />)}
    />);

    relChart = (<Chart
      start={this.relStart}
      end={this.end}
      type={'smooth'}
      dataKey={'aggregateRelevance'}
      data={this.props.auth.relChart}
      renderHeader={() => <Text style={styles.rowTitle}>Relevance</Text>}
      renderFooter={() => (<LinearGradient
        colors={[
          'hsla(240, 0%, 60%, 1)',
          'hsla(240, 20%, 96%, 1)',
          'hsla(240, 20%, 100%, 1)',
        ]}
        style={[styles.separator]}
      />)}
    />);

    return (
      <View>
        <View style={styles.nextUpdate}><Text
          style={[styles.font12, styles.darkGrey]}
        >
          {nextUpdate} until next update
        </Text></View>
        <StatCategory
          index={0}
          stats={this.props.auth.user}
          actions={this.props.actions}
        />

        <LinearGradient
          colors={[
            'hsla(240, 0%, 60%, 1)',
            'hsla(240, 20%, 96%, 1)',
            'hsla(240, 20%, 100%, 1)',
          ]}
          style={[styles.separator]}
        />

        {relChart}
        {chart}

        {this.props.auth.stats && this.props.auth.stats.length ?  (<Text style={styles.label}>
          Your top topics
        </Text>) : null }
      </View>
    );
  }

  renderItem({ item, index }) {
    return (
      <View>
        <StatCategory
          index={index + 1}
          stats={item}
          actions={this.props.actions}
        />
        <LinearGradient
          colors={[
            'hsla(240, 0%, 60%, 1)',
            'hsla(240, 20%, 96%, 1)',
            'hsla(240, 20%, 100%, 1)'
          ]}
          style={[styles.separator]}
        />
      </View>
    );
  }

  render() {
    let stats = this.props.auth.stats || [];
    let user = this.props.auth.user;
    let filler;

    if (this.state.loading) {
      return (<CustomSpinner visible />);
    }

    if (this.props.error) {
      return (<ErrorComponent parent={'stats'} reloadFunction={this.load} />);
    }

    if (!this.props.auth.user.level) {
      let nextUpdate = moment(this.props.auth.nextUpdate).fromNow(true);
      filler = (<EmptyList visible style={styles.emptyList}>
        <Text
          style={[styles.libre, { fontSize: 40, textAlign: 'center' }]}
        >
          You will see your stats here soon
        </Text>
        <Text
          style={[styles.georgia, styles.emptyText, styles.quarterLetterSpacing]}
        >
          {nextUpdate} until next update
        </Text>
      </EmptyList>
      );
    }

    if (user.relevance < 5) {
      filler = (<EmptyList visible style={styles.emptyList}>
        <Text
          style={[styles.libre, { fontSize: 40, textAlign: 'center' }]}
        >
          Earn 5 relevant points to see your stats!
        </Text>
        <Text
          style={[styles.georgia, styles.emptyText, styles.quarterLetterSpacing]}
        >
          Tip: 🤓 You can earn relevance by being one of the first to upvote a quality post
        </Text>
      </EmptyList>);
    }

    return (
      <FlatList
        ref={c => this.list = c}
        style={{ flex: 1 }}
        keyExtractor={(item, index) => index}
        data={stats}
        ListHeaderComponent={() => !filler ? this.renderHeader() : filler}
        renderItem={(item) => !filler ? this.renderItem(item) : null}
        refreshControl={
          <RefreshControl
            style={[{ backgroundColor: 'hsl(238,20%,95%)' }]}
            refreshing={this.state.refreshing}
            onRefresh={() => {
              this.setState({ refreshing: true });
              this.load();
            }}
          />
        }
      />
    );
  }
}

let localStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 17,
    paddingRight: 5,
    backgroundColor: 'transparent',
    fontFamily: 'System',
    paddingVertical: 20,
    alignSelf: 'center',
    color: darkGrey
  },

  label: {
    backgroundColor: blue,
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 15,
    color: 'white'
  },
  nextUpdate: {
    padding: 10,
    alignItems: 'center',
    backgroundColor: 'white',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'lightgrey',
  }
});

styles = { ...globalStyles, ...localStyles };

function mapStateToProps(state) {
  return {
    tags: state.tags,
    auth: state.auth,
    refresh: state.navigation.stats.refresh,
    error: state.error.stats
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(
      {
        ...authActions,
        ...navigationActions,
      }, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(StatsContainer);

