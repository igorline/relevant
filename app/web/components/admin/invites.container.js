import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as adminActions from '../../../actions/admin.actions';
import ShadowButton from '../common/ShadowButton';
import AdminHeader from './header.component';

if (process.env.BROWSER === true) {
  require('./admin.css');
}

let styles;

class Invites extends Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.createInvite = this.createInvite.bind(this);
    this.sendEmail = this.sendEmail.bind(this);
    this.state = {
      email: '',
      name: '',
    };
  }

  componentDidMount() {
    this.props.actions.getInvites();
  }

  sendEmail(invite) {
    if (invite.status) {
      let c = window.confirm('We have already sent one email to this user, are you sure you would like to send another one?');
      if (c) {
        this.props.actions.sendInvitationEmail(invite._id);
      }
    } else {
      this.props.actions.sendInvitationEmail(invite._id);
    }
  }

  destroy(invite) {
    let c = window.confirm('Are you sure you would like to delete this invite?');
    if (c) this.props.actions.destroy(invite);
  }

  createInvite() {
    let invite = {
      email: this.state.email,
      name: this.state.name
    };
    this.props.actions.createInvite(invite);
  }

  handleChange(event) {
    this.setState({ [event.target.name]: event.target.value });
  }

  renderInvite(inviteId) {
    let invite = this.props.admin.invites[inviteId];
    if (!invite) return null;
    return (<div key={inviteId} className={'adminRow'}>
      <span>{invite.invitedBy}</span>
      <span>{invite.name}</span>
      <span>{invite.email}</span>
      <span>{invite.code}</span>
      <span>{invite.status}</span>
      <button
        onClick={() => this.sendEmail(invite)}
      >
        Resend Email
      </button>
      <button
        className={'alert'}
        onClick={() => this.destroy(invite)}
      >
        Delete
      </button>
    </div>);
  }

  render() {
    let createInvite = (
      <div className="adminInner">
        <input
          className={'blueInput'}
          type={'text'}
          name={'email'}
          placeholder={'user email'}
          value={this.state.email}
          onChange={this.handleChange}
        />
        <input
          className={'blueInput'}
          type={'text'}
          name={'name'}
          placeholder={'user name'}
          value={this.state.name}
          onChange={this.handleChange}
        />
        <ShadowButton
          backgroundColor={'white'}
          color={'#3E3EFF'}
          onClick={this.createInvite}
        >
          {this.state.email ? 'And Invite Email' : 'Create Invite Code'}
        </ShadowButton>
      </div>
    );

    let invites = this.props.admin.inviteList
    .map(id => this.renderInvite(id));

    return (
      <div className="adminContainer">
        <AdminHeader />
        <h2>Manage Invites</h2>
        {createInvite}
        <div key={'inviteId'} className={'titleRow'}>
          <span>Invited by</span>
          <span>Name</span>
          <span>Email</span>
          <span>Invite Code</span>
          <span>Status</span>
          <span style={{ maxWidth: 130 }} />
        </div>
        {invites}
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
)(Invites);
