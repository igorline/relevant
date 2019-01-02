import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import * as discoverHelper from './discoverHelper';

class DiscoverTabs extends Component {
  static propTypes = {
    match: PropTypes.object,
    auth: PropTypes.object,
    tag: PropTypes.object
  };

  constructor(props, context) {
    super(props, context);
    this.state = {
      tabIndex: 1,
      routes: this.props.match.params.tag ? discoverHelper.tagRoutes : discoverHelper.standardRoutes
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    return discoverHelper.getDiscoverState(nextProps, prevState);
  }

  render() {
    const { tag } = this.props.match.params;
    const { tabIndex } = this.state;
    const { community } = this.props.auth;
    const tabs = this.state.routes.map((tab, i) => {
      let dest = '/' + community;
      dest += '/' + tab.key;
      if (tag) dest += '/' + tag;
      return (
        <Link key={tab.key} className={i === tabIndex ? 'selected' : ''} to={dest}>
          <li>{tab.title}</li>
        </Link>
      );
    });
    return <ul className="tabs">{tabs}</ul>;
  }
}

export default DiscoverTabs;
