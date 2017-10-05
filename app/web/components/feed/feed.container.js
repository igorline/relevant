import React, {
  Component,
} from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import * as authActions from '../../../actions/auth.actions';
import * as adminActions from '../../../actions/admin.actions';
import * as postActions from '../../../actions/post.actions';
import * as userActions from '../../../actions/user.actions';
import * as onlineActions from '../../../actions/online.actions';
import * as notifActions from '../../../actions/notif.actions';
import * as tagActions from '../../../actions/tag.actions';
import * as messageActions from '../../../actions/message.actions';
import * as investActions from '../../../actions/invest.actions';
import * as navigationActions from '../../../actions/navigation.actions';
import * as utils from '../../../utils';

import Posts from './posts.component';

if (process.env.BROWSER === true) {
  require('./feed.css');
}

export class Home extends Component {
  constructor(props, context) {
    super(props, context);
  }

  componentWillMount() {
    this.props.actions.getFeed(0, null);
  }

  render() {
    return (
      <div className="feedContainer">
        <h1>Feed</h1>
        <Posts {...this.props} />
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    auth: state.auth,
    user: state.auth.user,
    posts: state.posts,
    error: state.error.universal,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({
      ...authActions,
      ...postActions,
      ...onlineActions,
      ...notifActions,
      ...messageActions,
      ...userActions,
      ...investActions,
      ...navigationActions,
      ...tagActions,
      ...adminActions,
    }, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Home);
