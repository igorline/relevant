import React, { Component } from 'react';
import { Editor } from 'react-draft-wysiwyg';
import ReactDOM from 'react-dom';
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs';
import ContentEditable from 'react-contenteditable';

import { convertToHTML } from 'draft-convert';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { ContentState, convertFromHTML, convertToRaw, EditorState } from 'draft-js';
import * as adminActions from '../../../actions/admin.actions';
import ShadowButton from '../common/ShadowButton';

if (process.env.BROWSER === true) {
  require('react-draft-wysiwyg/dist/react-draft-wysiwyg.css');
}

class Email extends Component {
  constructor(props) {
    super(props);
    this.state = {
      editorState: null,
      html: '',
      email: '',
      subject: '',
      campaign: '',
    };
    this.handleChange = this.handleChange.bind(this);
    this.submit = this.submit.bind(this);
    this.onEditorStateChange = this.onEditorStateChange.bind(this);
    this.onContentStateChange = this.onContentStateChange.bind(this);
    this.saveEmail = this.saveEmail.bind(this);
    this.loadEmail = this.loadEmail.bind(this);
  }

  componentDidMount() {
    this.loadEmail();
  }

  saveEmail() {
    let { email, subject, campaign } = this.state;
    let html = draftToHtml(convertToRaw(this.state.editorState.getCurrentContent()));
    this.props.actions.saveEmail({
      email,
      subject,
      campaign,
      html,
    });
  }

  loadEmail() {
    this.props.actions.loadEmail()
    .then(email => {
      this.setState(email);
      console.log(email.html);
      let blocksFromHTML = htmlToDraft(email.html);
      let contentState = ContentState.createFromBlockArray(blocksFromHTML);
      let editorState = EditorState.createWithContent(contentState);
      editorState = EditorState.createWithContent(contentState);
      this.setState({ editorState });
    });
  }

  submit() {
    let { email, subject, campaign } = this.state;
    let html = draftToHtml(convertToRaw(this.state.editorState.getCurrentContent()));
    this.props.actions.sendEmail({ email, subject, campaign, html });
    this.saveEmail();
  }

  handleChange(event) {
    this.setState({ [event.target.name]: event.target.value });
    if (event.target.name === 'html') {
      let blocksFromHTML = htmlToDraft(event.target.value);
      let contentState = ContentState.createFromBlockArray(blocksFromHTML);
      let editorState = EditorState.createWithContent(contentState);
      editorState = EditorState.createWithContent(contentState);
      this.setState({ editorState });
    }
  }

  onContentStateChange(contentState) {
    this.setState({
      contentState,
    });
  }

  onEditorStateChange(editorState) {
    let html = draftToHtml(convertToRaw(editorState.getCurrentContent()));
    this.setState({
      editorState,
      html
    });
  }

  render() {
    return (
      <div className="adminContainer">
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignSelf: 'flex-start',
            marginLeft: 20,
          }}
        >
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
            type={'subject'}
            name={'subject'}
            placeholder={'subject'}
            value={this.state.subject}
            onChange={this.handleChange}
          />
          <input
            className={'blueInput'}
            type={'campaign'}
            name={'campaign'}
            placeholder={'campaign'}
            value={this.state.campaign}
            onChange={this.handleChange}
          />
        </div>
        <div style={{ display: 'flex', flex: 1, flexDirection: 'row' }}>
          <div style={{ flex: 1, margin: 20 }}>
            <Editor
              editorState={this.state.editorState}
              toolbarClassName="home-toolbar"
              wrapperClassName="home-wrapper"
              editorClassName="home-editor"
              onEditorStateChange={this.onEditorStateChange}
            />
          </div>
          <textarea
            style={{ flex: 1, margin: 20 }}
            value={this.state.html}
            name={'html'}
            onChange={this.handleChange}
          />
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'flex-end',
            alignSelf: 'flex-start',
            margin: 20,
            marginBottom: 60,
          }}
        >
          <ShadowButton
            backgroundColor={'white'}
            color={'#3E3EFF'}
            onClick={this.submit}
          >
            Send email
          </ShadowButton>
          <ShadowButton
            backgroundColor={'white'}
            color={'#3E3EFF'}
            onClick={this.saveEmail}
          >
            Save draft
          </ShadowButton>
          <ShadowButton
            backgroundColor={'white'}
            color={'#3E3EFF'}
            onClick={this.loadEmail}
          >
            Load
          </ShadowButton>
        </div>
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
)(Email);