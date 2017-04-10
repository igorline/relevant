import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as InvestActions from '../../../actions/invest.actions';

class Invest extends Component {
  constructor(props) {
    super(props);
    this.state = {
      investment: 50,
      showError: false,
    };
  }

  decreaseInvestment() {
    var investment = this.state.investment;
    switch (investment) {
      case 50:
        break;
      case 100:
        this.setState({ investment: 50 });
        break;
      case 500:
        this.setState({ investment: 100 });
        break;
      case 1000:
        this.setState({ investment: 500 });
        break;
      case 5000:
        this.setState({ investment: 1000 });
        break;
    }
  }

  increaseInvestment() {
    var investment = this.state.investment;
    switch (investment) {
      case 50:
        this.setState({ investment: 100 });
        break;
      case 100:
        this.setState({ investment: 500 });
        break;
      case 500:
        this.setState({ investment: 1000 });
        break;
      case 1000:
        this.setState({ investment: 5000 });
        break;
      case 5000:
        break;
    }
  }

  componentWillMount() {
    // Check if user is invested in this post
    this.props.checkInvestment(this.props.auth.user._id, this.props.post.selectedPost.investments)
  }

  componentDidMount() {
    // If remounting, don't display error
    if (this.state.showError) this.setState({showError: false});
  }

  sendInvestment() {
    this.props.createInvestment(this.props.auth.token, this.state.investment, this.props.post.selectedPost, this.props.auth.user._id);
    this.setState({showError: true});
  }

  uninvest() {
    this.props.deleteInvestment(this.props.auth.token, this.props.post.selectedPost, this.props.auth.user._id);
  }

  render() {
    return(
      <div>
        {false ? 
          <button type="button" onClick={this.uninvest.bind(this)}>Uninvest</button>
          :
          <div>
            <form>
              <button type="button" onClick={this.decreaseInvestment.bind(this)}>-</button>
              &nbsp;
              {this.state.investment}
              &nbsp;
              <button type="button" onClick={this.increaseInvestment.bind(this)}>+</button>
              <button type="button" type="button" onClick={this.sendInvestment.bind(this)}>Invest</button>
            </form>
            {this.state.showError && this.props.invest.failureMsg && <div>{this.props.invest.failureMsg}</div>}
          </div>
        }
      </div>
    )
  }
}

export default connect(
   state => {
     return {
       invest: state.invest,
     }
   },
   dispatch => {
     return Object.assign({}, { dispatch },  bindActionCreators(InvestActions, dispatch))
 })(Invest)