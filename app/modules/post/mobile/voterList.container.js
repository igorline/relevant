import React, { Component } from 'react';
import { View, InteractionManager, Text, StyleSheet, Image } from 'react-native';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { globalStyles, darkGrey } from 'app/styles/global';
import * as investActions from 'modules/post/invest.actions';
import * as navigationActions from 'modules/navigation/navigation.actions';

import DiscoverUser from 'modules/discover/mobile/discoverUser.component';
import CustomListView from 'modules/listview/mobile/customList.component';
import CustomSpinner from 'modules/ui/mobile/CustomSpinner.component';
import { numbers } from 'app/utils';

let styles;

class VoterList extends Component {
  static propTypes = {
    scene: PropTypes.object,
    invest: PropTypes.object,
    actions: PropTypes.object,
    users: PropTypes.array
  };

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
    const inv = this.props.invest.posts[this.postId];
    let data = [];
    if (inv) {
      data = inv.map(id => this.props.invest.investments[id]);
    }
    const loaded = this.props.invest.loaded[this.postId];
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
    const user = this.props.users[rowData.investor];
    if (!user || !rowData) return null;
    return (
      <DiscoverUser
        relevance
        user={user}
        {...this.props}
        renderRight={() => this.renderRight(rowData)}
      />
    );
  }

  renderRight(props) {
    const { amount, relevantPoints } = props;
    let icon = require('app/public/img/rup.png');
    const color = { color: darkGrey };
    if (amount < 0) {
      icon = require('app/public/img/rdown.png');
    }

    let inner = (
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={[styles.statNumber, color]}>+ </Text>
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
          <Text style={[styles.statNumber, color]}>- </Text>
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
    const data = this.getViewData();
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

    return <View style={{ flex: 1 }}>{listEl}</View>;
  }
}

const localStyles = StyleSheet.create({
  votes: {
    alignSelf: 'flex-end',
    fontSize: 17
  }
});

styles = { ...localStyles, ...globalStyles };

function mapStateToProps(state) {
  return {
    invest: state.investments,
    users: state.user.users,
    error: state.error.discover,
    tabs: state.navigation.tabs
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(
      {
        ...investActions,
        ...navigationActions
      },
      dispatch
    )
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(VoterList);
