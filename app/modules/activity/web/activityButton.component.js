import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Activity from 'modules/activity/web/activity.container';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { tabStyles } from 'modules/navigation/web/tabStyles';

const StyledSpan = styled.span`
  ${tabStyles}
  margin-right: 1em;
  cursor: pointer;
  :active {
    color: black;
  }
  :hover {
    color: black;
  }
  &.active {
    color: black;
  }
`;

class ActivityButton extends Component {
  static propTypes = {
    isAuthenticated: PropTypes.bool,
    notif: PropTypes.object,
  };
  state = {
    activity: false,
  };

  componentDidMount() {
    window.addEventListener('click', e => {
      if (e.target.classList.contains('activityButton')) return true;
      if (this.state.activity) {
        this.setState({ activity: false });
      }
      return null;
    });
  }

  render() {
    const { isAuthenticated, notif } = this.props;
    if (!isAuthenticated) return null;
    const activity = this.state.activity ? (
      <Activity close={() => this.setState({ activity: false })} />
    ) : null;
    const { count } = notif;
    const badge = count ? <span className={'badge'}>{count}</span> : null;
    return (
      <StyledSpan
        onClick={() => {
          this.setState({ activity: !this.state.activity });
          return false;
        }}
        className={`activityButton ${this.state.activity ? 'active' : ''}`}
      >
        Activity
        {badge}
        {activity}
      </StyledSpan>
    );
  }
}

function mapStateToProps(state) {
  return {
    isAuthenticated: state.auth.isAuthenticated,
    notif: state.notif,
  };
}

export default connect(
  mapStateToProps,
)(ActivityButton);
