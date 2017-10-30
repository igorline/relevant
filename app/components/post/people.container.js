import React, { Component } from 'react';
import {
  View,
  InteractionManager,
  Text,
  StyleSheet,
  Image
} from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { globalStyles, green, darkGrey } from '../../styles/global';
import * as investActions from '../../actions/invest.actions';
import * as navigationActions from '../../actions/navigation.actions';

import DiscoverUser from '../discoverUser.component';
import CustomListView from '../customList.component';
import CustomSpinner from '../CustomSpinner.component';
import { numbers } from '../../utils';

let styles;

class PostPeople extends Component {
  constructor(props, context) {
    super(props, context);
    this.renderRow = this.renderRow.bind(this);
    this.load = this.load.bind(this);
    this.renderRight = this.renderRight.bind(this);
    this.state = {};
    this.loading = false;
  }

  componentWillMount() {
    this.postId = this.props.scene.id;
    this.onInteraction = InteractionManager.runAfterInteractions(() => {
      this.load();
      this.forceUpdate();
    });
  }

  componentWillUnmount() {
    if (this.onInteraction) this.onInteraction.cancel();
  }

  getViewData() {
    let inv = this.props.invest.posts[this.postId];
    let data = [];
    if (inv) {
      data = inv.map(id => this.props.invest.investments[id]);
    }
    let loaded = this.props.invest.loaded[this.postId];
    return {
      data,
      loaded
    };
  }

  load(view, length) {
    if (length === undefined) length = 0;
    this.props.actions.getPostInvestments(this.postId, 100, length);
  }

  renderRow(rowData) {
    let user = this.props.users[rowData.investor];
    if (!user || !rowData) return null;
    return (<DiscoverUser
      relevance
      user={user}
      {...this.props}
      renderRight={() => this.renderRight(rowData)}
    />);
  }

  renderRight(props) {
    let { amount, relevantPoints } = props;

    let icon = require('../../assets/images/rup.png');
    let color = { color: darkGrey };
    let coin;
    if (amount < 0) {
      // color = { color: 'red' };
      icon = require('../../assets/images/rdown.png');
    }

    let inner = (
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={[styles.statNumber, color]}>
        +{' '}
        </Text>
        <Image
          resizeMode={'contain'}
          style={[styles.r, { height: 16, width: 20 }]}
          source={icon}
        />
        <Text style={[styles.bebas, color, { lineHeight: 17, fontSize: 17 }]}>
          {Math.abs(numbers.abbreviateNumber(relevantPoints))}
        </Text>
      </View>
    );


    if (amount < 0) {
      inner = (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={[styles.statNumber, color]}>
          -{' '}
          </Text>
          <Image
            resizeMode={'contain'}
            style={[styles.r, { height: 16, width: 20 }]}
            source={icon}
          />
          <Text style={[styles.bebas, color, { lineHeight: 17, fontSize: 17 }]}>
            {Math.abs(numbers.abbreviateNumber(relevantPoints))}
          </Text>
        </View>
      );
    }
    return inner;
  }

  render() {
    let data = this.getViewData();
    let listEl = <CustomSpinner />;

    if (!this.loading) {
      listEl = (
        <CustomListView
          data={data.data || []}
          loaded={data.loaded}
          renderRow={this.renderRow}
          load={this.load}
          type={'votes'}
          parent={'discover'}
          active
          view={0}
          scrollableTab
        />
      );
    }

    return (
      <View style={{ flex: 1 }}>
        {listEl}
      </View>
    );
  }
}

const localStyles = StyleSheet.create({
  votes: {
    alignSelf: 'flex-end',
    fontSize: 17,
  },
});

styles = { ...localStyles, ...globalStyles };


function mapStateToProps(state) {
  return {
    invest: state.investments,
    users: state.user.users,
    error: state.error.discover,
    tabs: state.navigation.tabs,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(
      {
        ...investActions,
        ...navigationActions,
      }, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(PostPeople);

