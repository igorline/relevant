import React, { Component } from 'react';
import { Link, withRouter } from 'react-router';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as routerActions from 'react-router-redux';
import * as communityActions from '../../../actions/community.actions';

import TagInput from '../createPost/TagInput.component';
// import UserSearch from '../createPost/userSearch.component';
import RichText from '../common/richText.component';
import ImageUpload from '../common/imageUpload.component';

class CommunityAdmin extends Component {
  state = {
    name: '',
    slug: '',
    channels: [],
    topics: [],
    admins: [],
    image: '',
    description: '',
    adminsText: ''
  }
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.updateAdmins = this.updateAdmins.bind(this);
  }

  componentDidMount() {
    this.props.actions.getCommunities();
  }

  handleChange(event) {
    this.setState({ [event.target.name]: event.target.value });
  }

  updateAdmins(adminsText, data) {
    this.setState({ admins: data.mentions, adminsText });
  }

  createCommunity() {
    this.props.actions.createCommunity(this.state);
  }

  render() {
    let { name, slug, description, topics, adminsText, image } = this.state;
    return (
      <div>
        <div className="communityForm">
          <label>Name</label>
          <input
            className={'basic'}
            type={'text'}
            name={'name'}
            placeholder={'name'}
            value={name}
            onChange={this.handleChange}
          />
          <label>Slug</label>
          <input
            className={'basic'}
            type={'text'}
            name={'slug'}
            placeholder={'slug'}
            value={slug}
            onChange={this.handleChange}
          />
          <label>Description</label>
          <input
            className={'basic'}
            type={'text'}
            name={'description'}
            placeholder={'description'}
            value={description}
            onChange={this.handleChange}
          />
          <label>Topics</label>
          <TagInput
            selectedTags={this.state.topics}
            selectTag={(topic) => this.setState({ topics: [...topics, topic] })}
            deselectTag={(topic) => {
              topics = topics.filter(t => t !== topic);
              this.setState({ topics });
            }}
            label={'Topics'}
            placeholderText={'Add main community topics'}
          />
          <label>Admins</label>
          <RichText
            className="editor"
            body={adminsText}
            placeholder={'Add admin members'}
            onChange={this.updateAdmins}
          />
          <label>Community Image</label>
          {image ? <img src={image} /> : null}
          <ImageUpload
            onUpload={img => this.setState({ image: img })}
          />
          <br/>
          <button className={'shadowButton'} onClick={this.createCommunity.bind(this)}>
            Create Community
          </button>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  routing: state.routing,
  communities: state.community,
});

const mapDispatchToProps = (dispatch) => ( Object.assign({}, { dispatch }, {
  actions: bindActionCreators({
    ...communityActions,
  }, dispatch)
}));

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(CommunityAdmin));
