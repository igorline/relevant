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
import { globalStyles, blue } from '../../styles/global';
import * as navigationActions from '../../actions/navigation.actions';
import * as authActions from '../../actions/auth.actions';
import StatCategory from './statCategoryView.component';

let styles;

class StatsContainer extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      refreshing: false
    };
    this.renderItem = this.renderItem.bind(this);
    this.renderHeader = this.renderHeader.bind(this);
  }

  componentWillMount() {
    this.props.actions.getStats(this.props.auth.user);
  }

  componentWillUpdate(next) {
    if (next.auth.stats !== this.props.auth.stats) {
      this.setState({ refreshing: false });
    }
    if (this.props.refresh !== next.refresh) {
      this.list.scrollToOffset({ y: 0 });
    }
  }

  renderHeader() {
    let nextUpdate = moment(this.props.auth.nextUpdate).fromNow(true);
    console.log(this.props.auth.nextUpdate)
    return (
      <View>
        <View style={styles.nextUpdate}><Text
          onPress={() => this.toggleTooltip('subscriptions')}
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
            // 'hsla(240, 20%, 100%, 1)',
            // 'hsla(240, 20%, 96%, 1)',
          ]}
          style={[styles.separator, { borderBottomWidth: 0 }]}
        >
        </LinearGradient>
        <Text style={styles.label}>
          Your top topics
        </Text>
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
    return (
      <FlatList
        ref={c => this.list = c}
        style={{ flex: 1 }}
        keyExtractor={(item, index) => index}
        data={stats}
        ListHeaderComponent={this.renderHeader}
        renderItem={this.renderItem}
        refreshControl={
          <RefreshControl
            style={[{ backgroundColor: 'hsl(238,20%,95%)' }]}
            refreshing={this.state.refreshing}
            onRefresh={() => {
              this.setState({ refreshing: true });
              this.props.actions.getStats(this.props.auth.user);
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

