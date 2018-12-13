import React, { Component } from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';
import PropTypes from 'prop-types';
import * as Progress from 'react-native-progress';
import { globalStyles, blue, fullWidth } from '../../styles/global';
import StatRow from '../common/statRow.component';

let styles;

export default class StatCategory extends Component {
  static propTypes = {
    actions: PropTypes.object,
    stats: PropTypes.object
  };

  constructor(props, context) {
    super(props, context);
    this.state = {
      loaded: false
    };
  }

  componentDidMount() {
    this.setState({ loaded: true });
  }

  goToPeople(topic) {
    this.props.actions.goToPeople(topic);
  }

  render() {
    const stats = this.props.stats;
    let rank;
    let title;
    let button;
    let titleAction = () => null;
    let titleStyle;
    let progressEl;

    if (typeof stats.level !== 'number') return null;

    if (stats.tag) {
      title = '#' + stats.tag.charAt(0).toUpperCase() + stats.tag.slice(1);
      button = (
        <Text onPress={() => this.goToPeople(stats.tag)} style={[styles.button, styles.active]}>
          See top users.
        </Text>
      );

      const topic = {
        _id: stats.tag.replace('#', '').trim(),
        categoryName: stats.tag
      };
      titleAction = () => this.props.actions.goToTopic(topic);
      titleStyle = { color: blue };
    } else {
      title = 'Level Progress';
      button = (
        <Text onPress={() => this.goToPeople(null)} style={[styles.button, styles.active]}>
          See all users.
        </Text>
      );
    }

    if (stats.rank < 10) rank = '#' + stats.rank;
    else rank = stats.level;

    rank = stats.level;
    const untilNext = Math.round((10 * stats.level) % 100) / 100;

    const level = Math.floor(stats.level / 10);

    const relGoal = Math.round((stats.relevance / stats.level) * (level + 1) * 10);
    const relMore = Math.round(relGoal - stats.relevance);

    if (!stats.tag) {
      progressEl = (
        <Progress.Bar
          style={{ marginHorizontal: 15, marginBottom: 25, borderWidth: 0 }}
          color={blue}
          width={fullWidth - 30}
          height={7}
          borderRadius={0}
          progress={this.state.loaded ? untilNext : 0}
        >
          <Image
            resizeMode={'contain'}
            style={{ position: 'absolute', top: 0, zIndex: -1, width: fullWidth - 30, height: 7 }}
            source={require('../../assets/images/icons/dashedbg.png')}
          />
        </Progress.Bar>
      );
    }

    const rIcon = (
      <Image
        resizeMode={'contain'}
        style={[styles.smallR, { width: 10, height: 12, marginRight: 0.5 }]}
        source={require('../../assets/images/icons/smallR.png')}
      />
    );

    const statEls = [
      {
        el: <Text style={[styles.statNumber, styles.statRowNumber]}>{level}</Text>,
        label: 'Level'
      },
      {
        el: (
          <View style={{ flexDirection: 'row', justifyContent: 'flex-start' }}>
            <Text
              style={[styles.statNumber, styles.statRowNumber, { fontSize: 16, lineHeight: 18 }]}
            >
              #
            </Text>
            <Text style={[styles.statNumber, styles.statRowNumber]}>{stats.rank}</Text>
          </View>
        ),
        label: 'Rank'
      },
      {
        el: (
          <View style={{ flexDirection: 'row', justifyContent: 'flex-start' }}>
            <Text style={[styles.statNumber, styles.statRowNumber]}>
              {Math.round(untilNext * 100)}
            </Text>
            <Text
              style={[styles.statNumber, styles.statRowNumber, { fontSize: 16, lineHeight: 18 }]}
            >
              %
            </Text>
          </View>
        ),
        label: 'Completed'
      }
    ];

    return (
      <View style={[styles.container, styles.statSection]}>
        <View style={{ flexDirection: 'column', alignItems: 'center' }}>
          <Text onPress={titleAction} style={[styles.statNumber, styles.rowTitle, titleStyle]}>
            {title}
          </Text>
          <View style={[styles.textRow]}>
            <Text style={styles.smallInfo}>Get </Text>
            {rIcon}
            <Text style={styles.smallInfo}>{relMore} more to reach next level. </Text>
            {button}
          </View>
        </View>

        <View style={styles.innerContainer}>
          <StatRow elements={statEls} />
        </View>
        {progressEl}
      </View>
    );
  }
}

const localStyles = StyleSheet.create({
  rowTitle: {
    marginVertical: 5,
    marginBottom: 5
  },

  container: {
    flex: 1
  },
  innerContainer: {
    flexDirection: 'row',
    flex: 1
  },
  vBorder: {
    borderRightWidth: StyleSheet.hairlineWidth,
    borderColor: 'hsl(0,0%,80%)'
  },
  row: {
    marginTop: 20,
    marginBottom: 30,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  statRow: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  },
  statRowNumber: {
    // marginBottom: 1,
    fontSize: 25
  },
  statSection: {
    flexDirection: 'column',
    backgroundColor: 'white',
    marginBottom: 25,
    marginTop: 40
  },
  button: {
    flex: 0,
    fontSize: 10
  }
});

styles = { ...globalStyles, ...localStyles };
