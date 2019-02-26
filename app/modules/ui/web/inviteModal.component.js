import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReduxFormField from 'modules/styled/form/reduxformfield.component';
import { View, Button, SecondaryText, LinkFont, Divider } from 'modules/styled/web';
import { colors, sizing } from 'app/styles';
import { Field, reduxForm } from 'redux-form';
import styled from 'styled-components';
import ULink from 'modules/navigation/ULink.component';
import { required, email } from 'modules/form/validators';
import { REFERRAL_REWARD, PUBLIC_LINK_REWARD } from 'server/config/globalConstants';

const ModalDivider = styled(Divider)`
  position: relative;
  margin: 0 ${sizing(-6)};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

class InviteModal extends Component {
  submit = async vals => {
    const { reset } = this.props;
    const invite = {
      ...vals,
      invitedBy: this.props.auth.user._id
    };
    const createdInvite = await this.props.actions.createInvite(invite);
    if (createdInvite) {
      reset();
    }
    return createdInvite;
  };
  render() {
    const { handleSubmit, auth, community, count } = this.props;
    const publicInviteUrl = `/${community.active}/top/invite/${auth.user.handle}`;
    const origin = window ? window.location.origin : 'https://relevant.community';

    const FORM_FIELDS = [
      {
        name: 'name',
        component: ReduxFormField,
        type: 'text',
        placeholder: 'Name',
        validate: [required]
      },
      {
        name: 'email',
        component: ReduxFormField,
        type: 'email',
        placeholder: 'Email',
        validate: [required, email]
      }
    ];
    return (
      <View display="flex" fdirection="column">
        <SecondaryText>
          Earn Relevant Tokens by inviting people to your Relevant network
        </SecondaryText>
        <View pb={4} display="flex" fdirection="column" mt={7}>
          <View display="flex" fdirection="row">
            <LinkFont c={colors.black}>Public Invite Link</LinkFont>
            <LinkFont ml={0.5}> (+{PUBLIC_LINK_REWARD} Rnt)</LinkFont>
          </View>
          <ULink to={publicInviteUrl}>
            <LinkFont c={colors.blue}>{`${origin}${publicInviteUrl}`}</LinkFont>
          </ULink>
        </View>
        <ModalDivider />
        <View display="flex" fdirection="row" mt={4}>
          <LinkFont c={colors.black}>
            Private Invite: {count[community.active]} remaining
          </LinkFont>
          <LinkFont ml={0.5}> (+{REFERRAL_REWARD} Rnt)</LinkFont>
        </View>
        <Form onSubmit={handleSubmit(this.submit.bind(this))}>
          {FORM_FIELDS.map((field, index) => (
            <Field {...field} key={index} />
          ))}
          <View justify="flex-end" mt={3} fdirection="row">
            <Button bg={colors.white} c={colors.black} onClick={() => this.props.close()}>
              Close
            </Button>
            <Button ml={2} c={colors.white} type="submit">
              Submit
            </Button>
          </View>
        </Form>
      </View>
    );
  }
}

InviteModal.propTypes = {
  close: PropTypes.func,
  handleSubmit: PropTypes.func,
  initialValues: PropTypes.object,
  auth: PropTypes.object,
  community: PropTypes.object,
  location: PropTypes.object,
  actions: PropTypes.object,
  reset: PropTypes.func,
  count: PropTypes.object
};

export default reduxForm({
  form: 'settings'
})(InviteModal);
