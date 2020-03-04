import React, { Fragment, Component } from 'react';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import { withRouter } from 'react-router';
import { bindActionCreators } from 'redux';
import { s3 } from 'app/utils';
import { connect } from 'react-redux';
import {
  updateCommunity,
  createCommunity,
  deleteCommunity
} from 'modules/community/community.actions';
import SelectField from 'modules/form/selectField.component';
import CreatableMulti from 'modules/form/createSelectField.component';
import AsyncAdminField from 'modules/form/asyncAdminField.component';
import ReduxFormImageUpload from 'modules/styled/form/reduxformimageupload.component';
import ReduxFormField from 'modules/styled/form/reduxformfield.component';
import Checkbox from 'modules/styled/form/checkbox';
import { Field, reduxForm } from 'redux-form';
import { Form, View, Button, Title } from 'modules/styled/web';
import { Image, LinkFont, SecondaryText } from 'modules/styled/uni';
import { required } from 'modules/form/validators';
import { colors } from 'app/styles';

class CommunityAdminForm extends Component {
  static propTypes = {
    actions: PropTypes.object,
    handleSubmit: PropTypes.func,
    isUpdate: PropTypes.bool,
    initialValues: PropTypes.object,
    close: PropTypes.func,
    history: PropTypes.object
  };

  deleteCommunity = async e => {
    e.preventDefault();
    const { initialValues, close } = this.props;
    if (
      // eslint-disable-next-line
      window.confirm(
        `Are you sure you want to delete this community: ${initialValues.name}?`
      )
    ) {
      const success = await this.props.actions.deleteCommunity(initialValues);
      if (success && close) close();
    }
  };

  submit = async values => {
    const { history } = this.props;
    try {
      const community = { ...values };
      if (community.image && community.image.preview && community.image.fileName) {
        const image = await s3.toS3Advanced(
          community.image.preview,
          community.image.fileName
        );
        community.image = image.url;
      }
      const { isUpdate } = this.props;
      if (isUpdate) {
        this.props.actions.updateCommunity(community);
      } else {
        await this.props.actions.createCommunity(community);
        history.push(`/${community.slug}/new`);
      }
    } catch (err) {
      // TODO error handling
    }
  };

  render() {
    const { handleSubmit, initialValues } = this.props;
    const imageProps = {
      p: 2,
      w: 9,
      h: 9,
      bg: colors.blue,
      bradius: '50%'
    };

    const customFields = initialValues.customParams
      ? [
          {
            name: 'customParams.auth.points',
            label: 'REQUIRED FOR POSTING: Added Points of Interest',
            component: ReduxFormField,
            type: 'number'
          },
          {
            name: 'customParams.auth.tokens',
            label: 'REQUIRED FOR POSTING: FOAM token balance',
            component: ReduxFormField,
            type: 'number'
          }
        ]
      : [];

    const FORM_FIELDS = [
      {
        name: 'image',
        component: ReduxFormImageUpload,
        placeholder: '/img/blueR.png',
        imageComponent: <Image mt={1} bg={colors.blue} {...imageProps} />,
        type: 'file-upload',
        label: 'Community Image',
        validate: []
      },
      {
        name: 'name',
        label: 'Name',
        component: ReduxFormField,
        type: 'text',
        validate: [required]
      },
      // {
      //   name: 'private',
      //   label: 'Private',
      //   component: Checkbox,
      //   type: 'checkbox'
      // },
      {
        name: 'slug',
        label: (
          <View fdirection={'column'}>
            <LinkFont c={colors.black}>Slug (cannot be changed in the future)</LinkFont>
            <SecondaryText>
              Determines the url of the community, ex: relevant.community/{'<slug>'}
            </SecondaryText>
          </View>
        ),
        placeholder: 'slug',
        component: ReduxFormField,
        type: 'text',
        validate: [required]
      },
      {
        name: 'description',
        component: ReduxFormField,
        type: 'text',
        label: 'Description',
        validate: [required]
      },
      {
        name: 'topics',
        component: CreatableMulti,
        type: 'text',
        label: 'Tags',
        validate: []
      },
      {
        name: 'sectionTitle',
        text: 'Admins & Moderators'
      },
      {
        name: 'superAdmins',
        component: AsyncAdminField,
        type: 'text',
        label: (
          <View fdirection={'column'}>
            <LinkFont c={colors.black}>Admins</LinkFont>
            <SecondaryText>
              Users with admin priveleges (ability to edit community parameters and add or
              remove moderators)
            </SecondaryText>
          </View>
        ),
        validate: []
      },
      {
        name: 'admins',
        component: AsyncAdminField,
        type: 'text',
        label: (
          <View fdirection={'column'}>
            <LinkFont c={colors.black}>Moderators</LinkFont>
            <SecondaryText>
              Users that will have high reputation by default (but not necessarily admin
              priveleges)',
            </SecondaryText>
          </View>
        ),
        validate: []
      },
      {
        name: 'sectionTitle',
        text: 'Community Settings'
      },
      {
        name: 'defaultPost',
        label: 'Default Post Type',
        component: SelectField,
        // input: { value: [] },
        // value: 'link',
        options: ['link', 'text']
      },
      ...customFields,
      {
        name: 'betEnabled',
        label: 'Enable Betting',
        component: Checkbox,
        type: 'checkbox'
      },
      {
        name: 'hidden',
        label: 'Unlisted (anyone with link can still see and join the community)',
        component: Checkbox,
        type: 'checkbox'
      }
    ];
    return (
      <View display="flex" fdirection="column" m={'0 4'} mb={16}>
        <Form
          onSubmit={handleSubmit(this.submit)}
          fdirection="column"
          key="community-admin-form"
        >
          {FORM_FIELDS.map((field, index) => {
            if (field.name === 'sectionTitle')
              return (
                <Fragment key={field.text + index}>
                  <Title mt={4}>{field.text}</Title>
                </Fragment>
              );
            return <Field {...field} key={index} />;
          })}
          <View justify="flex-end" mt={3} fdirection="row">
            {initialValues._id ? (
              <Button
                ml={2}
                c={colors.white}
                bg={colors.red}
                onClick={this.deleteCommunity}
              >
                Delete
              </Button>
            ) : null}
            <Button ml={2} c={colors.white} type="submit">
              Submit
            </Button>
          </View>
        </Form>
      </View>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  const { close, history } = ownProps;
  let slug = get(ownProps, 'match.params.slug') || state.auth.community;
  if (get(ownProps, 'match.path') === '/admin/community/new') slug = null;
  if (get(ownProps, 'match.path') === '/communities/new') slug = null;
  const community = get(state.community, `communities.${slug}`, {});
  const isUpdate = !!Object.keys(community).length;
  const admins = get(community, 'admins', []).map(m => m.embeddedUser.handle);
  const superAdmins = get(community, 'superAdmins', []).map(m => m.embeddedUser.handle);

  const initialValues = { ...community, admins, superAdmins };

  return {
    routing: state.routing,
    community: state.community,
    isUpdate,
    initialValues,
    enableReinitialize: true,
    close,
    history
  };
};

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(
    {
      updateCommunity,
      createCommunity,
      deleteCommunity
    },
    dispatch
  )
});

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(
    reduxForm({
      form: 'communityAdmin'
    })(CommunityAdminForm)
  )
);
