import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link, withRouter } from 'react-router';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

if (process.env.BROWSER === true) {
  require('./sidebar.css');
}

class Sidebar extends Component {
  static propTypes = {
    location: PropTypes.object,
    auth: PropTypes.object,
    communities: PropTypes.object
  };

  render() {
    const { location, auth, communities } = this.props;
    const community = communities[auth.community] || {};
    const introText = community.description;

    return (
      <div className={'sidebar'}>
        <div className={'innerSidebar'}>
          <h3>Welcome to the #{auth.community} community!</h3>
          {introText}
          <Link to={location.pathname + '#newpost'}>
            <button className={'shadowButton'} disabled={!auth.user}>
              Share a Link
            </button>
          </Link>
          <h3>How Relevant works:</h3>
          <ul>
            <li>Earn Relevance (reputation) by posting quality comments</li>
            <li>Get Relevant Tokens by upvoting quality links and comments and downvoting spam</li>
            <li>
              The higher your Relevance score, the more impact your votes have and the more tokens
              you can earn
            </li>
          </ul>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  routing: state.routing,
  communities: state.community.communities
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({}, dispatch)
});

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(Sidebar)
);
