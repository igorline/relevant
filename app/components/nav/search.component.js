import React, { Component } from 'react';
import {
  StyleSheet,
  TouchableHighlight,
  Text,
  View,
  Image,
  Animated,
  TextInput,
} from 'react-native';
import { abbreviateNumber } from '../../utils';
import { globalStyles } from '../../styles/global';

let styles;

class Search extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      search: false
    };
    this.renderTitle = this.renderSearch.bind(this);
    this.close = this.close.bind(this);
    this.search = this.search.bind(this);
    this.input = null;
    this.searchTerm = '';
  }

  search(term) {
    if (term && term.length > 1) this.props.actions.searchTags(term);
    else this.props.actions.searchTags(null);
  }

  close() {
    this.search();
    this.input.blur();
    this.input.clear();
    this.props.toggleSearch();
  }

  renderSearch() {
    let searchEl = null;
    searchEl = (<View style={{ flex: 1, paddingVertical: 10 }}>
        <TextInput
          ref={(input) => { this.input = input; }}
          onSubmitEditing={this.search}
          style={[styles.searchInput, styles.font15]}
          placeholder={'Search'}
          autoFocus
          multiline={false}
          onChangeText={(term) => { this.search(term); this.searchTerm = term; }}
          returnKeyType="done"
          clearTextOnFocus
        />
        <View style={styles.closeParent}>
          <Text
            style={styles.close}
            onPress={() => this.close()}
          >
            ✕
          </Text>
        </View>
      </View>);

    return searchEl;
  }

  render() {
    return this.renderSearch();
  }
}

const localStyles = StyleSheet.create({
  titleComponent: {
    justifyContent: 'flex-end',
  },
  backArrow: {
    paddingTop: 4,
  },
  leftButton: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'center',
    paddingVertical: 10,
  },
  rightButton: {
    flex: 1,
    marginRight: 15,
    paddingVertical: 10,
  },
  statsTxt: {
    color: 'black',
    fontSize: 13,
    textAlign: 'right',
  },
  gearImg: {
    height: 20,
    width: 20,
    justifyContent: 'center'
  },
  gear: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  searchInput: {
    flex: 1,
    textAlign: 'left',
    paddingLeft: 10,
  },
  closeParent: {
    position: 'absolute',
    top: 12,
    right: 10,
    width: 20,
    height: 20,
    backgroundColor: 'rgba(0,0,0,0)',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  close: {
    color: 'grey',
    fontSize: 16,
    textAlign: 'center',
    opacity: .8
  }
});

styles = { ...localStyles, ...globalStyles };

export default Search;

