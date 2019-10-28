import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Avatar from 'modules/user/avatarbox.component';
import { View } from 'modules/styled/uni';
import styled from 'styled-components/primitives';
import { colors } from 'app/styles';

const UserSelect = styled(View)`
  &:hover {
    background: ${colors.lightGrey};
  }
  ${p =>
    p.selected
      ? `
    background: ${colors.lightGrey};
  `
      : ''}
`;

const Container = styled(View)`
  max-height: 250px;
  min-width: 250px;
  overflow-y: scroll;
  overflow-x: hidden;
  background: white;
`;

const USER_ELEMENT_HEIGHT = 38;

export default class UserSuggestion extends Component {
  static propTypes = {
    userSearchIndex: PropTypes.number,
    users: PropTypes.array,
    onChange: PropTypes.func
  };

  componentDidMount() {
    this.updateScrollPosition();
  }

  componentDidUpdate() {
    this.updateScrollPosition();
  }

  updateScrollPosition() {
    const offset = Math.max(this.props.userSearchIndex - 1, 0) * USER_ELEMENT_HEIGHT;
    if (this.el) this.el.scrollTop = offset;
  }

  render() {
    if (!this.props.users || !this.props.users.length) {
      return null;
    }
    const selected = this.props.userSearchIndex;
    const inner = this.props.users.map((user, i) => (
      <UserSelect
        p={'1 3'}
        key={i}
        selected={selected === i ? 'selected' : ''}
        onClick={() => this.props.onChange(user)}
      >
        <Avatar user={user} noLink />
      </UserSelect>
    ));
    return (
      <Container
        wrap
        fdirection={'row'}
        bl
        bb
        br
        mt={'1px'}
        ref={el => {
          this.el = el;
        }}
        className="userSearch"
      >
        {inner}
      </Container>
    );
  }
}
