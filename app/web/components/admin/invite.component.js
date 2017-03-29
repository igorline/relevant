import React, { Component } from 'react';

if (process.env.BROWSER === true) {
  require('./admin.css');
}

let styles;

export default class Invite extends Component {
  constructor(props) {
    super(props);
  }

  // componentDidMount() {
  //   this.token = this.props.routeParams.token;
  // }


  render() {
    return (
      <div style={styles.confirm}>
        Please open this link on our phone AFTER you have downloaded Relevant app from the App Store
      </div>
    );
  }
}

styles = {
  confirm: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: '100px',
    fontSize: '20px'
  }
};
