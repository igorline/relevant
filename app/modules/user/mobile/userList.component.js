import React, { Component } from 'react';
import { View, InteractionManager } from 'react-native';
import PropTypes from 'prop-types';

import CustomListView from 'modules/listview/mobile/customList.component';
import CustomSpinner from 'modules/ui/mobile/CustomSpinner.component';

export default class UserList extends Component {
  static propTypes = {
    getDataAction: PropTypes.func,
    getViewData: PropTypes.func,
    renderRow: PropTypes.func,
    type: PropTypes.string
  };

  constructor(props, context) {
    super(props, context);
    this.load = this.load.bind(this);
    this.state = {};
    this.loading = true;
  }

  componentWillMount() {
    this.onInteraction = InteractionManager.runAfterInteractions(() => {
      this.loading = false;
      this.load();
      this.forceUpdate();
    });
  }

  componentWillUnmount() {
    if (this.onInteraction) this.onInteraction.cancel();
  }

  load(view, length) {
    if (length === undefined) length = 0;
    this.props.getDataAction(view, length);
  }

  render() {
    const data = this.props.getViewData();
    let listEl = <CustomSpinner />;

    if (!this.loading) {
      listEl = (
        <CustomListView
          data={data.data || []}
          loaded={data.loaded}
          renderRow={this.props.renderRow}
          load={this.load}
          type={this.props.type}
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

UserList.propTypes = {
  getViewData: PropTypes.func,
  renderRow: PropTypes.func,
  getDataAction: PropTypes.func,
  type: PropTypes.string
};
