import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';

class FeedTabs extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const tabs = this.props.tabs.map( (tab, i) => {
      return (
        <li
          key={tab.key}
          className={i == this.props.currentTab ? 'selected' : ''}
          onClick={() => this.props.onChange(i)}
        >
          {tab.title}
        </li>
      )
    })
    return (
      <ul className='tabs'>
        {tabs}
      </ul>
    )
  }
}

export default FeedTabs;
