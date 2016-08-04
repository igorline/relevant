'use strict';
import React, {
  AppRegistry,
  Component,
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  TouchableHighlight,
  LinkingIOS,
  ScrollView
} from 'react-native';
import { connect } from 'react-redux';
var Button = require('react-native-button');
import { bindActionCreators } from 'redux';
import * as authActions from '../actions/auth.actions';
import * as postActions from '../actions/post.actions';
import * as notifActions from '../actions/notif.actions';
import * as tagActions from '../actions/tag.actions';
import * as viewActions from '../actions/view.actions';
import { globalStyles, fullWidth, fullHeight } from '../styles/global';

class Categories extends Component {
  constructor (props, context) {
    super(props, context)
    this.state = {
    }
  }

  componentDidMount() {
    var self = this;
    self.props.actions.setBack(true);
    self.props.actions.setName('Categories');
  }

  componentWillUnmount() {
    var self = this;
    self.props.actions.setBack(false);
    self.props.actions.setName(null);
  }

  setCategory(tag) {
    var self = this;
    self.props.actions.setPostCategory(tag);
    self.props.view.nav.pop();
  }

  render() {
    var self = this;
    var parentTags = null;
    var categoryEl = null;
    var styles = globalStyles;
    if (self.props.posts.parentTags) {
      parentTags = self.props.posts.parentTags;

      categoryEl = parentTags.map(function(tag) {
        switch (tag.name) {
          case 'Anime':
            tag.emoji = '👁';
            break;

          case 'Art':
            tag.emoji = '🎨';
            break;

          case 'Beauty':
            tag.emoji = '💅';
            break;

          case 'Books':
            tag.emoji = '📚';
            break;

          case 'Celebrities':
            tag.emoji = '👑';
            break;

          case 'Culture':
            tag.emoji = '🗿';
            break;

          case 'Design':
            tag.emoji = '📐';
            break;

          case 'Gaming':
            tag.emoji = '🎮';
            break;

          case 'Food and Drink':
            tag.emoji = '🍽';
            break;

          case 'Fashion':
            tag.emoji = '🕶';
            break;

          case 'Film':
            tag.emoji = '🎥';
            break;

          case 'LGBT':
            tag.emoji = '🌈';
            break;

          case 'Health and Fitness':
            tag.emoji = '💪';
            break;

          case 'Meta':
            tag.emoji = '💭';
            break;

          case 'LOL':
            tag.emoji = '😂';
            break;

          case 'Nature':
            tag.emoji = '🌱';
            break;

          case 'News and Politics':
            tag.emoji = '📰';
            break;

          case 'Music':
            tag.emoji = '🎹';
            break;

          case 'Other':
            tag.emoji = '🌀';
            break;

          case 'POC':
            tag.emoji = '👩🏾';
            break;

          case 'Pictures':
            tag.emoji = '🖼';
            break;

          case 'Programming':
            tag.emoji = '🔢';
            break;

          case 'Relationships':
            tag.emoji = '💞';
            break;

          case 'Sex':
            tag.emoji = '👄';
            break;

          case 'Science':
            tag.emoji = '🔬';
            break;

          case 'Selfie':
            tag.emoji = '📸';
            break;

          case 'Sports':
            tag.emoji = '🏈';
            break;

          case 'Technology':
            tag.emoji = '💻';
            break;

          case 'Travel':
            tag.emoji = '✈️';
            break;

          case 'Writing':
            tag.emoji = '📝';
            break;

          case 'TV':
            tag.emoji = '📺';
            break;
        }
        return (<TouchableHighlight  onPress={self.setCategory.bind(self, tag)} underlayColor={'transparent'} style={[styles.categoryItem]} >
            <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
              <Text>{tag.emoji}</Text>
              <Text>{tag.name}</Text>
            </View>
          </TouchableHighlight>
        )
      })
    }

return (<ScrollView contentContainerStyle={{flex: 1}}>
          {categoryEl}
        </ScrollView>
    );
  }
}

export default Categories;


const localStyles = StyleSheet.create({
});






