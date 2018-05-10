import React, { Component } from 'react';
import { Link, withRouter } from 'react-router';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as routerActions from 'react-router-redux';
import ShadowButton from './ShadowButton';


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
            <ShadowButton
              // onClick={() => this.props.actions.push(props.location.path + '#newpost')}
            >
              Share a Link
            </ShadowButton>
          </Link>
          <h3>How Relevant works:</h3>
          <ul>
            <li>Earn Relevance (reputation) for providing interesting commentary, analysis or synopsis of the links you share</li>
            <li>Get Relevant Tokens via Metamask to start earning curation rewards</li>
            <li>Build your Relevance to increase your earnings when you share and upvote posts</li>
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
