import React, { Component } from 'react';
import { Link, withRouter } from 'react-router';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as routerActions from 'react-router-redux';
import * as communityActions from '../../../actions/community.actions';

if (process.env.BROWSER === true) {
  // require('./community.css');
}

class Community extends Component {

  componentDidMount() {
    this.props.actions.getCommunities();
  }

  renderCommunities() {
    let { communities, list } = this.props.community;
    let currentCommunity = this.props.auth.community;
    return list.map(id => {
      let community = communities[id];
      let active = currentCommunity === community.slug;
      let className = active ? 'active' : null;
      return <div><Link
        className={className}
        key={community._id}
        to={'/' + community.slug + '/new'}>
        {community.name}
      </Link>
      </div>;
    });
  }

  render() {
    // const props = this.props;
    return (
      <div className="communitySidebar">
        {this.renderCommunities()}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  routing: state.routing,
  community: state.community,
});

const mapDispatchToProps = (dispatch) => ( Object.assign({}, { dispatch }, {
  actions: bindActionCreators({
    ...communityActions,
  }, dispatch)
}));

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Community));
