import React, { Component } from 'react';
import { StyleSheet, Text, View, TextInput } from 'react-native';
import PropTypes from 'prop-types';
import { globalStyles } from 'app/styles/global';
import { colors } from 'styles';

let styles;

class Search extends Component {
  static propTypes = {
    actions: PropTypes.object,
    toggleSearch: PropTypes.func
  };

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
    // this.input.blur();
    this.input.clear();
    // this.props.toggleSearch();
  }

  renderSearch() {
    let searchEl = null;
    searchEl = (
      <View style={{ flex: 1, paddingVertical: 10 }}>
        <TextInput
          ref={input => {
            this.input = input;
          }}
          onSubmitEditing={this.search}
          style={[styles.searchInput, styles.font15]}
          placeholderTextColor={colors.grey}
          placeholder={'Search'}
          autoFocus
          onBlur={this.props.toggleSearch}
          multiline={false}
          onChangeText={term => this.search(term)}
          returnKeyType="done"
          clearTextOnFocus
          // clearButtonMode="always"
        />
        <View style={styles.closeParent}>
          <Text style={styles.close} onPress={() => this.close()}>
            ✕
          </Text>
        </View>
      </View>
    );

    return searchEl;
  }

  render() {
    return this.renderSearch();
  }
}

const localStyles = StyleSheet.create({
  titleComponent: {
    justifyContent: 'flex-end'
  },
  backArrow: {
    paddingTop: 4
  },
  leftButton: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'center',
    paddingVertical: 10
  },
  rightButton: {
    flex: 1,
    marginRight: 15,
    paddingVertical: 10
  },
  statsTxt: {
    color: 'black',
    fontSize: 13,
    textAlign: 'right'
  },
  gearImg: {
    height: 20,
    width: 20,
    justifyContent: 'center'
  },
  gear: {
    flexDirection: 'row',
    justifyContent: 'flex-end'
  },
  searchInput: {
    flex: 1,
    textAlign: 'left',
    paddingLeft: 10,
    marginTop: 2,
    marginRight: 35
  },
  closeParent: {
    position: 'absolute',
    top: 3,
    right: 5,
    width: 35,
    height: 35,
    backgroundColor: 'rgba(0,0,0,0)',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  close: {
    padding: 5,
    color: 'grey',
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.8
  }
});

styles = { ...localStyles, ...globalStyles };

export default Search;
