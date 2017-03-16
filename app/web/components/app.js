import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

if (process.env.BROWSER === true) {
  require('./index.css');
  require('./fonts.css');
}

class App extends Component {

  render() {
    return (<main>
      {this.props.children}
    </main>);
  }
}

const mapStateToProps = (state) => ({
  user: state.auth.user
});

const mapDispatchToProps = (dispatch) => ({
  dispatch
});

export default connect(mapStateToProps, mapDispatchToProps)(App);
