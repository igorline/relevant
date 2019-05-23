import React, { Component } from 'react';
import PropTypes from 'prop-types';
import get from 'lodash.get';
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
import { Field, reduxForm } from 'redux-form';
import { Form, View, Button } from 'modules/styled/web';
import { Image } from 'modules/styled/uni';
import { required } from 'modules/form/validators';
import { colors } from 'app/styles';

class CommunityAdminForm extends Component {
  static propTypes = {
    actions: PropTypes.object,
    handleSubmit: PropTypes.func,
    isUpdate: PropTypes.bool,
    initialValues: PropTypes.object
  };

  deleteCommunity = async e => {
    e.preventDefault();
    const { initialValues } = this.props;
    if (
      // eslint-disable-next-line
      window.confirm(
        `Are you sure you want to delete this community: ${initialValues.name}?`
      )
    ) {
      this.props.actions.deleteCommunity(initialValues);
    }
  };

  submit = async values => {
    try {
      const allVals = Object.assign({}, values);
      if (allVals.image && allVals.image.preview && allVals.image.fileName) {
        const image = await s3.toS3Advanced(
          allVals.image.preview,
          allVals.image.fileName
        );
        allVals.image = image.url;
      }
      const { isUpdate } = this.props;
      if (isUpdate) {
        this.props.actions.updateCommunity(allVals);
      } else {
        this.props.actions.createCommunity(allVals);
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
    const FORM_FIELDS = [
      {
        name: 'name',
        label: 'Name',
        component: ReduxFormField,
        type: 'text',
        validate: [required]
      },
      {
        name: 'slug',
        label: 'Slug',
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
        name: 'image',
        component: ReduxFormImageUpload,
        placeholder: (
          <Image source={initialValues.image} {...imageProps} bg={colors.grey} />
        ),
        imageComponent: <Image bg={colors.blue} {...imageProps} />,
        type: 'file-upload',
        label: 'Community Image',
        validate: []
      },
      {
        name: 'topics',
        component: CreatableMulti,
        type: 'text',
        label: 'Tags',
        validate: []
      },
      {
        name: 'superAdmins',
        component: SelectField,
        options: initialValues.admins,
        type: 'text',
        label: 'Admins',
        validate: []
      },
      {
        name: 'admins',
        component: AsyncAdminField,
        type: 'text',
        label: 'Moderators',
        validate: []
      }
    ];
    return (
      <View display="flex" fdirection="column" m={4}>
        <Form
          onSubmit={handleSubmit(this.submit.bind(this))}
          fdirection="column"
          key="community-admin-form"
        >
          {FORM_FIELDS.map((field, index) => (
            <Field {...field} key={index} />
          ))}
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
  let slug = get(ownProps, 'match.params.slug') || state.auth.community;
  if (get(ownProps, 'match.path') === '/admin/community/new') slug = null;
  const community = get(state.community, `communities.${slug}`) || {};
  const isUpdate = !!Object.keys(community).length;
  const adminMembers = get(community, 'admins', []);
  const admins = adminMembers.map(m => (m.embeddedUser ? m.embeddedUser.handle : m._id));
  const superAdmins = adminMembers
  .filter(m => m.superAdmin)
  .map(m => m.embeddedUser.handle);

  const initialValues = { ...community, admins, superAdmins };
  return {
    routing: state.routing,
    community: state.community,
    isUpdate,
    initialValues,
    enableReinitialize: true
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
