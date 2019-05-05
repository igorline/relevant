import React, { Component } from 'react';
// import DaiCard from 'dai-card/src/App.js';

let DaiCard;
if (process.env.BROWSER === true) {
  // DaiCard = require('dai-card/build/bundle.js');
  // DaiCard = require('dai-card/build/bundle.js');
}

export default class CardContainer extends Component {
  state = {
    showCard: false
  };

  componentDidMount() {
    this.setState({ showCard: true });
  }

  render() {
    // const { showCard } = this.state;
    return (
      <View>
        <DaiCard />
      </View>
    );
  }
}
