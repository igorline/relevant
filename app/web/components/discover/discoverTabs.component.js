import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { Link } from 'react-router';

class DiscoverTabs extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const tabs = this.props.tabs.map( (tab, i) => {
      let dest = '/discover';
      if (this.props.tag) {
        dest += '/tag/' + this.props.tag;
      }
      dest += '/' + tab.key;
      return (
        <Link
          key={tab.key}
          className={i === this.props.currentTab ? 'selected' : ''}
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
