import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import * as discoverHelper from './discoverHelper';

class DiscoverTabs extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      tabIndex: 1,
      routes: this.props.params.tag ?
        discoverHelper.tagRoutes : discoverHelper.standardRoutes,
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    return discoverHelper.getDiscoverState(nextProps, prevState);
  }

  render() {
    let tag = this.props.params.tag;
    const tabs = this.state.routes.map((tab, i) => {
      let dest = '/discover';
      if (this.props.tag) {
        dest += '/tag/' + tag;
      }
      dest += '/' + tab.key;
      return (
        <Link
          key={tab.key}
          className={i === this.state.tabIndex ? 'selected' : ''}
          to={dest}
        >
          <li>
            {tab.title}
          </li>
        </Link>
      );
    });
    return (
      <ul className='tabs'>
        {tabs}
      </ul>
    );
  }
}

export default DiscoverTabs;
