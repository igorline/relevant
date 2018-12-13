import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as adminActions from '../../../actions/admin.actions';
import ShadowButton from '../common/ShadowButton';

if (process.env.BROWSER === true) {
  require('./admin.css');
}

class Waitlist extends Component {
  static propTypes = {
    actions: PropTypes.object,
    admin: PropTypes.object
  };

  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.sendInvites = this.sendInvites.bind(this);
    this.state = {
      number: 1
    };
  }

  componentDidMount() {
    this.props.actions.getWaitlist();
  }

  destroy(invite) {
    const c = window.confirm('Are you sure you would like to delete this invite?');
    if (c) this.props.actions.destroy(invite);
  }

  sendInvites() {
    const userIds = this.props.admin.waitList.slice(0, this.state.number);
    const users = userIds.map(id => this.props.admin.wait[id]);
    this.props.actions.inviteFromWaitlist(users);
  }

  handleChange(event) {
    this.setState({ [event.target.name]: event.target.value });
  }

  renderWaitlist(waitlistId) {
    const user = this.props.admin.wait[waitlistId];
    if (!user) return null;
    return (
      <div key={waitlistId} className={'adminRow'}>
        <span>{user.name}</span>
        <span>{user.email}</span>
        <span>{user.status}</span>
        <button onClick={() => this.props.actions.inviteFromWaitlist([user])}>Send Invite</button>
        <button onClick={() => this.props.actions.deleteWaitlistUser(user)}>Remove</button>
      </div>
    );
  }

  render() {
    const waitlist = this.props.admin.waitList.map(id => this.renderWaitlist(id));

    return (
      <div className="adminContainer">
        <h2>Waitlist</h2>

        <div className="adminInner">
          <input
            className={'blueInput'}
            style={{ width: '40px', textAlign: 'right' }}
            type={'text'}
            name={'number'}
            placeholder={'number of users'}
            value={this.state.number}
            onChange={this.handleChange}
          />

          <ShadowButton backgroundColor={'white'} color={'#3E3EFF'} onClick={this.sendInvites}>
            {'Invite the next ' + (this.state.number === 1 ? 'user' : this.state.number + ' users')}
          </ShadowButton>
        </div>

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

Waitlist.propTypes = {
  actions: PropTypes.object,
  admin: PropTypes.object
};

export default connect(
  state => ({
    auth: state.auth,
    admin: state.admin
  }),
  dispatch => ({
    actions: bindActionCreators(adminActions, dispatch)
  })
)(Waitlist);
