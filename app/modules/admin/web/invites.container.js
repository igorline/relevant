import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as adminActions from 'modules/admin/admin.actions';
import ShadowButton from 'modules/ui/web/ShadowButton';
import InfScroll from 'modules/listview/web/infScroll.component';

if (process.env.BROWSER === true) {
  require('./admin.css');
}

const PAGE_SIZE = 40;

class Invites extends Component {
  static propTypes = {
    admin: PropTypes.object,
    actions: PropTypes.object
  };

  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.createInvite = this.createInvite.bind(this);
    this.sendEmail = this.sendEmail.bind(this);
    this.load = this.load.bind(this);
    this.hasMore = true;
    this.state = {
      email: '',
      name: '',
      number: 1,
      filter: null,
      invitedBy: ''
    };
  }

  componentDidMount() {}

  load(page) {
    const l = this.props.admin.inviteList.length;
    this.hasMore = (page - 1) * PAGE_SIZE <= l;

    if (this.hasMore) {
      this.props.actions.getInvites(l, PAGE_SIZE);
    }
  }

  sendEmail(invite) {
    if (invite.status) {
      const c = window.confirm(
        'We have already sent one email to this user, are you sure you would like to send another one?'
      );
      if (c) {
        this.props.actions.sendInvitationEmail(invite._id);
      }
    } else {
      this.props.actions.sendInvitationEmail(invite._id);
    }
  }

  destroy(invite) {
    const c = window.confirm('Are you sure you would like to delete this invite?');
    if (c) this.props.actions.destroy(invite);
  }

  createInvite() {
    const invite = {
      email: this.state.email,
      name: this.state.name,
      number: this.state.number,
      invitedByString: this.state.invitedBy
    };
    this.props.actions.createInvite(invite);
    this.setState({ name: '', email: '', number: 1 });
  }

  handleChange(event) {
    this.setState({ [event.target.name]: event.target.value });
  }

  renderInvite(inviteId) {
    const invite = this.props.admin.invites[inviteId];
    if (!invite) return null;
    if (this.state.filter === 'original' && !invite.email) return null;
    if (this.state.filter === 'registered' && invite.status !== 'registered') return null;
    if (
      this.state.filter === 'notregistered' &&
      (invite.status === 'registered' || !invite.email)
    ) {
      return null;
    }

    return (
      <div key={inviteId} className={'adminRow'}>
        <span>{invite.invitedBy}</span>
        <span>{invite.name}</span>
        <span>{invite.email}</span>
        <span>{invite.code}</span>
        <span>{invite.status}</span>
        <span style={{ width: '40px' }}>{invite.number}</span>
        <button onClick={() => this.sendEmail(invite)}>Resend Email</button>
        <button className={'alert'} onClick={() => this.destroy(invite)}>
          Delete
        </button>
      </div>
    );
  }

  render() {
    const createInvite = (
      <div className="adminInner">
        <input
          className={'blueInput'}
          type={'text'}
          name={'invitedBy'}
          placeholder={'invited by'}
          value={this.state.invitedBy}
          onChange={this.handleChange}
        />
        <input
          className={'blueInput'}
          type={'email'}
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
        <input
          className={'blueInput'}
          style={{ width: '40px', textAlign: 'right' }}
          type={'text'}
          name={'number'}
          placeholder={'number of invites'}
          value={this.state.number}
          onChange={this.handleChange}
        />
        <ShadowButton
          backgroundColor={'white'}
          color={'#3E3EFF'}
          onClick={this.createInvite}
        >
          {this.state.email ? 'Send Invite Email' : 'Create Invite Code'}
        </ShadowButton>
      </div>
    );

    const invites = this.props.admin.inviteList
      ? this.props.admin.inviteList.map(id => this.renderInvite(id))
      : null;

    return (
      <div className="adminContainer">
        <h2>Manage Invites</h2>
        {createInvite}

        <div className={'filter'}>
          <span onClick={() => this.setState({ filter: null })}>all</span>
          <span onClick={() => this.setState({ filter: 'original' })}>original</span>
          <span onClick={() => this.setState({ filter: 'registered' })}>registered</span>
          <span onClick={() => this.setState({ filter: 'notregistered' })}>
            notregistered
          </span>
        </div>

        <div key={'inviteId'} className={'titleRow'}>
          <span>Invited by</span>
          <span>Name</span>
          <span>Email</span>
          <span>Invite Code</span>
          <span>Status</span>
          <span style={{ width: '40px' }}>Number</span>
          <span style={{ maxWidth: 130 }} />
        </div>

        <InfScroll
          className={'adminContainer'}
          data={this.props.admin.inviteList}
          loadMore={this.load}
          hasMore={this.hasMore}
        >
          {invites}
        </InfScroll>
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
