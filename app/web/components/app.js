import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import Header from './common/header.component';
import Footer from './common/footer.component';

if (process.env.BROWSER === true) {
  console.log('BROWSER, import css');
  require('./index.css');
  require('./fonts.css');
  require('./splash/splash.css');
}

class App extends Component {
  constructor(props, context) {
    super(props, context);
  }

  componentDidMount() {
    // document.body.classList.remove('loading')
  }

  render() {
    return (
      <main>
        <Header location={this.props.location} />
        {this.props.children}
      </main>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.auth.user
});

const mapDispatchToProps = (dispatch) => ({
  dispatch
});

export default connect(mapStateToProps, mapDispatchToProps)(App);
