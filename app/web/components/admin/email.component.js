import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as adminActions from '../../../actions/admin.actions';
import ShadowButton from '../common/ShadowButton';

let pell;
if (process.env.BROWSER === true) {
  pell = require('pell');
  require('pell/dist/pell.min.css');
  require('./admin.css');
}

// const customEntityTransform = (entity, text) => {
//   switch (entity.type) {
//     case 'IMAGE':
//       return `<img src="${entity.data.src}" style="margin:auto;display:block;float:${entity.data
//        .alignment || 'none'};height: ${entity.data.height};width: ${entity.data.width}"/>`;
//     default:
//       break;
//   }
// };

class Email extends Component {
  static propTypes = {
    actions: PropTypes.object
  };

  constructor(props) {
    super(props);
    this.state = {
      html: '',
      email: '',
      subject: '',
      campaign: ''
    };
    this.handleChange = this.handleChange.bind(this);
    this.submit = this.submit.bind(this);
    this.saveEmail = this.saveEmail.bind(this);
    this.loadEmail = this.loadEmail.bind(this);
  }

  componentDidMount() {
    this.loadEmail();

    this.editor = pell.init({
      element: document.getElementById('email-editor'),
      onChange: html => {
        this.setState({ html });
      },
      styleWithCSS: true,
      actions: [
        'bold',
        'underline',
        'italic',
        {
          icon: '<b>Sml</b>',
          title: 'small',
          // result: () => pell.exec('decreaseFontSize')
          result: () => pell.exec('fontSize', 2)
        },
        {
          icon: '<b>reg</b>',
          title: 'small',
          // result: () => pell.exec('decreaseFontSize')
          result: () => pell.exec('fontSize', 3)
        },
        'paragraph',
        'heading1',
        'heading2',
        {
          icon: '<b>H<sub>3</sub></b>',
          title: 'H3',
          result: () => pell.exec('formatBlock', '<H3>')
        },
        {
          icon: '<b>H<sub>4</sub></b>',
          title: 'H4',
          result: () => pell.exec('formatBlock', '<H4>')
        },
        {
          icon: '<b>Center</b>',
          title: 'center',
          result: () => pell.exec('justifyCenter')
        },
        {
          icon: '<b>Left</b>',
          title: 'left',
          result: () => pell.exec('justifyLeft')
        },
        'image',
        'link',
        {
          name: 'resize',
          icon: '<b>Resize</b>',
          result: () => pell.exec('enableObjectResizing')
        },
        {
          icon: '<b><u><i>Clear</i></u></b>',
          name: 'clear',
          result: () => pell.exec('removeFormat')
        }
      ]
      // classes: {
      //   actionbar: 'pell-actionbar-custom-name',
      //   button: 'pell-button-custom-name',
      //   content: 'pell-content-custom-name'
      // }
    });
  }

  saveEmail() {
    const { email, subject, campaign, html } = this.state;
    this.props.actions.saveEmail({
      email,
      subject,
      campaign,
      html
    });
  }

  loadEmail() {
    this.props.actions.loadEmail().then(email => {
      this.setState(email);
      this.editor.content.innerHTML = email.html;
    });
  }

  submit() {
    const { email, subject, campaign, html } = this.state;
    this.props.actions.sendEmail({ email, subject, campaign, html });
    this.saveEmail();
  }

  handleChange(event) {
    this.setState({ [event.target.name]: event.target.value });
    if (event.target.name === 'html') {
      this.editor.content.innerHTML = event.target.value;
    }
  }

  render() {
    return (
      <div className="adminContainer">
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignSelf: 'flex-start',
            marginLeft: 20
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
        <div style={{ display: 'flex', flex: 1, flexDirection: 'row', width: '100%' }}>
          <div style={{ flex: 1, margin: 20 }}>
            <div id="email-editor" />
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
            marginBottom: 60
          }}
        >
          <ShadowButton backgroundColor={'white'} color={'#3E3EFF'} onClick={this.submit}>
            Send email
          </ShadowButton>
          <ShadowButton backgroundColor={'white'} color={'#3E3EFF'} onClick={this.saveEmail}>
            Save draft
          </ShadowButton>
          <ShadowButton backgroundColor={'white'} color={'#3E3EFF'} onClick={this.loadEmail}>
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
