import React, { Component } from 'react';
import { Link, withRouter } from 'react-router';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as routerActions from 'react-router-redux';

if (process.env.BROWSER === true) {
  require('./sidebar.css');
}

class Sidebar extends Component {
  render() {
    const props = this.props;
    const community = props.auth.community;
    const introText = <span>
      This is a community for curating and discussing links related to critical analysis of
      {' '}<Link to={'/discover/tag/technology/new'}>#technology</Link>
      , <Link to={'/discover/tag/society/new'}>#society</Link> and <Link to={'/discover/tag/culture/new'}>#culture</Link>.
    </span>;

    return (
      <sidebar>
        <div className={'innerSidebar'}>
          <h3>Welcome to the #{community} community!</h3>
          {introText}
          <Link to={this.props.location.pathname + '#newpost'}>
            <button
              className={'shadowButton'}
              disabled={!this.props.auth.user}
            >
              Share a Link
            </button>
          </Link>
          <h3>How Relevant works:</h3>
          <ul>
            <li>Earn Relevance (reputation) by posting quality comments</li>
            <li>Get Relevant Tokens by upvoting quality links and comments and downvoting spam</li>
            <li>The higher your Relevance score, the more impact your votes have and the more tokens you can earn</li>
          </ul>
        </div>
      </sidebar>
    );
  }
}

const mapStateToProps = (state) => ({
  routing: state.routing,
});

const mapDispatchToProps = (dispatch) => ( Object.assign({}, { dispatch }, {
  actions: bindActionCreators({ }, dispatch)
}));

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Sidebar));
