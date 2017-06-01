import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  InteractionManager,
  View
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import * as Progress from 'react-native-progress';
import { globalStyles, blue, fullWidth, darkGrey } from '../../styles/global';
import Stats from '../post/stats.component';
import { numbers } from '../../utils';

let styles;

export default class StatCategory extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      loaded: false,
    };
  }

  componentDidMount() {
    this.setState({ loaded: true });
  }

  goToPeople(topic) {
    this.props.actions.goToPeople(topic);
  }

  render() {
    let stats = this.props.stats;
    let rank;
    let title;
    let button;

    if (typeof stats.level !== 'number') return null;

    if (stats.tag) {
      title = stats.tag.charAt(0).toUpperCase() + stats.tag.slice(1);
      button = (
        <Text
          onPress={() => this.goToPeople(title)}
          style={[styles.button, styles.active]}
        >
          See top users in {title}
        </Text>
      );
    } else {
      title = 'Relevance Stats';
      button = (
        <Text
          onPress={() => this.goToPeople(null)}
          style={[styles.button, styles.active]}
        >
          See all users
        </Text>
      );
    }

    if (stats.rank < 10) rank = '#' + stats.rank;
    else rank = stats.level;

    rank = stats.level;
    let untilNext = Math.round((10 * stats.level % 100)) / 100;

    let level = Math.floor(stats.level / 10);
    let color = this.props.index * 80 + 240;

    let relGoal = Math.round(stats.relevance / stats.level * (level + 1) * 10);

    return (
      <View style={[styles.container, styles.statSection]}>
        <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
          <Text style={[styles.bebas, styles.rowTitle ]}>
            {title}
          </Text>
        </View>

        <View style={styles.innerContainer}>

          <View style={[styles.col, styles.vBorder]}>

            <View style={[styles.statRow, styles.hBorder]}>
              <Text style={[styles.rowText, styles.numberText]}>{level}</Text>
              <Text style={[styles.rowText]}>Level</Text>
            </View>

            <View style={[styles.statRow, styles.hBorder]}>
              <Text style={[styles.rowText, styles.numberText]}>
                #{stats.rank}
              </Text>
              <Text style={[styles.rowText]}>Rank</Text>
            </View>

            <View style={[styles.statRow]}>
              <Stats
                textStyle={{ fontWeight: 'bold', fontSize: 16 }}
                style={{ alignSelf: 'center', marginVertical: 2 }}
                type={'relevance'}
                entity={stats}
                renderLeft={title ? title + '  ' : null}
              />
              {/*<Text style={[styles.rowText, styles.numberText]}>
                        {numbers.abbreviateNumber(Math.round(stats.relevance))}
                      </Text>*/}
              {/*<Text style={[styles.rowText]}>Relevance</Text>*/}
            </View>

          </View>

          <View style={styles.col}>

            <View style={styles.statRow}>
              <Text style={[styles.rowText, { marginBottom: 5 }]}>
                Next Goal:
              </Text>
              <Text style={[styles.rowText]}>Level:{' '}
                <Text style={[styles.rowText, styles.numberText]}>
                  {level + 1}
                </Text>
              </Text>
              <Progress.Circle
                style={{ marginVertical: 10 }}
                color={'hsla(' + parseInt(color, 10) + ',      80%, 50%, 1)'}
                size={60}
                showsText
                progress={this.state.loaded ? untilNext : 0}
              />
              <Stats
                textStyle={{ fontWeight: 'bold', fontSize: 16 }}
                style={{ alignSelf: 'center', marginVertical: 2 }}
                type={'relevance'}
                entity={{ relevance: relGoal }}
                renderLeft={title ? title + '  ' : null}
              />
            </View>
          </View>

        </View>
        <View style={{ flex: 1, alignItems: 'center' }}>{button}</View>
      </View>
    );
  }
}

let localStyles = StyleSheet.create({
  linearGradient: {
    height: 60,
    width: fullWidth,
    justifyContent: 'flex-end'
  },
  rowTitle: {
    fontSize: 17,
    paddingRight: 5,
    backgroundColor: 'transparent',
    fontFamily: 'System',
    paddingVertical: 20,
    color: darkGrey,
  },
  defaultText: {
    fontFamily: 'System',
    fontSize: 15,
  },
  numberText: {
    fontFamily: 'BebasNeueRelevantRegular',
    fontWeight: 'bold',
    letterSpacing: 0.5,
    fontSize: 16,
  },
  rowText: {
    fontSize: 14,
    paddingRight: 5,
    paddingVertical: 1,
    textAlign: 'center',
    lineHeight: 17,
    color: darkGrey,
  },
  container: {
    flex: 1,
  },
  innerContainer: {
    flexDirection: 'row',
    flex: 1,
  },
  hBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: 'hsl(0,0%,80%)',
  },
  vBorder: {
    borderRightWidth: StyleSheet.hairlineWidth,
    borderColor: 'hsl(0,0%,80%)',
  },
  col: {
    marginTop: 10,
    marginBottom: 30,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statRow: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,

  },
  statSection: {
    flexDirection: 'column',
    backgroundColor: 'white',
  },
  button: {
    flex: 0,
    // borderRadius: 3,
    marginBottom: 20,
    paddingVertical: 8,
    paddingHorizontal: 10,

    // shadowColor: blue,
    // shadowOffset: { width: 2, height: 2 },
    // shadowRadius: 0,
    // shadowOpacity: 1,

    // borderColor: blue,
    // borderWidth: StyleSheet.hairlineWidth,
    // marginHorizontal: 20
  },

});

styles = { ...globalStyles, ...localStyles };
