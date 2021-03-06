import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { View, Text, NumericalValue, Image } from 'modules/styled/web';
import { colors } from 'app/styles';
import { getTopPosts } from 'modules/post/post.actions';
import ULink from 'modules/navigation/ULink.component';
import { getTitle, getFavIcon, getPostUrl } from 'app/utils/post';
import { abbreviateNumber } from 'app/utils/numbers';

const MarqueeContainer = styled(View)`
  white-space: nowrap;
  width: 100vw;
  overflow: hidden;
  z-index: 10;
  position: fixed;
  top: 0;
`;

const BG_COLORS = [colors.black, colors.white];

class Marquee extends Component {
  static propTypes = {
    rows: PropTypes.number,
    actions: PropTypes.object,
    posts: PropTypes.object,
    communityState: PropTypes.object
  };

  static defaultProps = {
    rows: 1
  };

  x = [];

  rows = [];

  componentDidMount() {
    this.props.actions.getTopPosts();
    this.animate();
    window.addEventListener('blur', this.pause);
  }

  componentWillUnmount() {
    window.removeEventListener('blur', this.pause);
    window.removeEventListener('focus', this.animate);
    cancelAnimationFrame(this.lastFrame);
  }

  pause = () => {
    cancelAnimationFrame(this.lastFrame);
    window.removeEventListener('focus', this.animate);
    window.addEventListener('focus', this.animate);
  };

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
    const now = new Date();
    const elapsed = this.lastTime ? (now - this.lastTime) / 10 : 0;

    this.x = this.rows.map((row, i) => {
      const w = row.offsetWidth / 2;
      let newX = (this.x[i] || i) - elapsed * this.rowSpeed(i);
      if (newX <= -w) newX += w;
      const rX = Math.round(newX * 1000) / 1000;
      row.style.transform = `translate3d(${rX}px, 0, 0)`;
      return rX;
    });

    this.lastTime = now;
    this.lastFrame = requestAnimationFrame(this.animate);
  };

  renderTicker = (row, key) => {
    const { posts, rows, communityState } = this.props;
    const links = posts.topPosts.filter(post => post.title);

    return links.map((post, i) => {
      if (i % rows !== row) return null;
      const color = BG_COLORS[(row + 1) % 2];
      const community = communityState.communities[post.data.community];
      if (!community) return null;
      const avgRank = community.currentShares / community.postCount;
      const tick = post.data.pagerank - avgRank;
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
    const bg = BG_COLORS[row % 2];

    const tickers = this.renderTicker(row, 1);
    const tickersDouble = this.renderTicker(row, 2);

    return (
      <View fdirection="row" flex={1} bg={bg} key={`row${row}`}>
        <Text ref={c => (this.rows[row] = c)}>
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
    posts: state.posts,
    communityState: state.community
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
