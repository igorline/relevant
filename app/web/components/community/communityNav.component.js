import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link, withRouter } from 'react-router';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as communityActions from '../../../actions/community.actions';

if (process.env.BROWSER === true) {
  // require('./community.css');
}

class Community extends Component {
  static propTypes = {
    actions: PropTypes.object,
    community: PropTypes.object,
    auth: PropTypes.object
  };

  componentDidMount() {
    this.props.actions.getCommunities();
  }

  renderCommunities() {
    const { communities, list } = this.props.community;
    const currentCommunity = this.props.auth.community;
    return list.map(id => {
      const community = communities[id];
      const active = currentCommunity === community.slug;
      const className = active ? 'active' : null;
      return (
        <div>
          <Link className={className} key={community._id} to={'/' + community.slug + '/new'}>
            {community.name}
          </Link>
        </div>
      );
    });
  }

  render() {
    return <div className="communitySidebar">{this.renderCommunities()}</div>;
  }
}

const mapStateToProps = state => ({
  routing: state.routing,
  community: state.community
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(
    {
      ...communityActions
    },
    dispatch
  )
});

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(Community)
);
