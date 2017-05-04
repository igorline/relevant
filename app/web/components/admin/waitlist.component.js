import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as adminActions from '../../../actions/admin.actions';
import ShadowButton from '../common/ShadowButton';

if (process.env.BROWSER === true) {
  require('./admin.css');
}

let styles;

class Waitlist extends Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.sendInvite = this.sendInvite.bind(this);
  }

  componentDidMount() {
    this.props.actions.getWaitlist();
  }

  destroy(invite) {
    let c = window.confirm('Are you sure you would like to delete this invite?');
    if (c) this.props.actions.destroy(invite);
  }

  sendInvite(user) {
    let u = { ...user };
    delete u._id;
    this.props.actions.createInvite(u)
    .then(success => {
      if (success) {
        u.status = 'invited';
        this.props.actions.signupForMailingList(u);
      }
    });
  }

  handleChange(event) {
    this.setState({ [event.target.name]: event.target.value });
  }

  renderInvite(waitlistId) {
    let user = this.props.admin.wait[waitlistId];
    if (!user) return null;
    return (<div key={waitlistId} className={'adminRow'}>
      <span>{user.name}</span>
      <span>{user.email}</span>
      <span>{user.status}</span>
      <button
        onClick={() => this.sendInvite(user)}
      >
        Send Invite
      </button>
    </div>);
  }

  render() {

    let waitlist = this.props.admin.waitList
    .map(id => this.renderInvite(id));

    return (
      <div className="adminContainer">
        <h2>Waitlist</h2>
        <div key={'inviteId'} className={'titleRow'}>
          <span>Name</span>
          <span>Email</span>
          <span>Status</span>
          <span style={{ maxWidth: 130 }} />
        </div>
        {waitlist}
      </div>
    );
  }
}

export default connect(
  state => ({
    auth: state.auth,
    admin: state.admin
  }),
  dispatch => ({
    actions: bindActionCreators(adminActions, dispatch)
  })
)(Waitlist);
