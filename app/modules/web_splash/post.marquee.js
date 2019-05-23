import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { View, Text, NumericalValue, Image } from 'modules/styled/web';
import { colors } from 'app/styles';
import { getTopPosts } from 'modules/post/post.actions';
import ULink from 'modules/navigation/ULink.component';
import { getPostUrl } from 'app/utils/routing';
import { getTitle, getFavIcon } from 'app/utils/post';
import { abbreviateNumber } from 'app/utils/numbers';

const MarqueeContainer = styled(View)`
  white-space: nowrap;
  width: 100vw;
  overflow: hidden;
  z-index: 1;
`;

const BG_COLORS = [colors.black, colors.white];

class Marquee extends Component {
  static propTypes = {
    rows: PropTypes.number,
    actions: PropTypes.object,
    posts: PropTypes.object
  };

  static defaultProps = {
    rows: 1
  };

  state = {
    x: []
  };

  rows = [];

  componentDidMount() {
    this.props.actions.getTopPosts();
    this.animate();
  }

  componentWillUnmount() {
    window.cancelAnimationFrame(this.lastFrame);
  }

  rowSpeed = i => {
    switch (i % 3) {
      case 0:
        return 0.6;
      case 1:
        return 0.85;
      case 2:
        return 0.75;
      default:
        return 0.6;
    }
  };

  animate = () => {
    const { x } = this.state;
    const now = new Date();
    const elapsed = this.lastTime ? (now - this.lastTime) / 10 : 0;

    const updatedX = this.rows.map((row, i) => {
      const w = row.offsetWidth / 2;
      let newX = (x[i] || i) - elapsed * this.rowSpeed(i);
      if (newX <= -w) newX += w;
      const rX = Math.round(newX * 1000) / 1000;
      // row.style.transform = 'translateX(' + rX + 'px) translateZ(0px)';
      return rX;
    });

    this.setState({ x: updatedX });

    this.lastTime = now;
    this.lastFrame = window.requestAnimationFrame(() => this.animate());
  };

  renderTicker = (row, key) => {
    const { posts, rows } = this.props;
    const links = posts.topPosts.filter(post => post.title);

    return links.map((post, i) => {
      if (i % rows !== row) return null;
      const color = BG_COLORS[(row + 1) % 2];
      const tick = post.data.pagerank - 25;
      const title = getTitle({ post, maxLength: 60 }).toUpperCase();
      const icon = getFavIcon(post.metaPost.domain);

      const tickerString = (
        <React.Fragment>
          <Image bg={colors.white} w={2} h={2} mr={1} src={icon} resizeMode={'contain'} />
          <Text mr={0.5} c={color}>
            {title}
          </Text>
          <Text mr={0.5} c={tick < 0 ? colors.red : colors.green}>
            {tick >= 0 ? '▲' : '▼'}
          </Text>
          <Text c={color}>{abbreviateNumber(tick)}%</Text>
        </React.Fragment>
      );

      return (
        <ULink
          m={'1 4'}
          key={`${post._id}${key}`}
          to={getPostUrl(post.data.community, post)}
        >
          <NumericalValue>{tickerString}</NumericalValue>
        </ULink>
      );
    });
  };

  renderRow = row => {
    const { x } = this.state;
    const bg = BG_COLORS[row % 2];

    const tickers = this.renderTicker(row, 1);
    const tickersDouble = this.renderTicker(row, 2);

    return (
      <View fdirection="row" flex={1} bg={bg} key={`row${row}`}>
        <Text
          style={{ transform: `translateX(${x[row]}px)` }}
          ref={c => (this.rows[row] = c)}
        >
          {tickers}
          {tickersDouble}
        </Text>
      </View>
    );
  };

  render() {
    const { rows: N } = this.props;
    const rows = Array.from(Array(N).keys());
    return (
      <MarqueeContainer fdirection="column">{rows.map(this.renderRow)}</MarqueeContainer>
    );
  }
}

function mapStateToProps(state) {
  return {
    posts: state.posts
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(
      {
        getTopPosts
      },
      dispatch
    )
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Marquee);
