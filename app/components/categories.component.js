import React, { Component } from 'react';
import {
  Text,
  View,
  TouchableHighlight,
  ScrollView
} from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as tagActions from '../actions/tag.actions';
import * as createPostActions from '../actions/createPost.actions';
import * as navigationActions from '../actions/navigation.actions';
import { globalStyles } from '../styles/global';

class Categories extends Component {
  constructor(props, context) {
    super(props, context);
    this.setCategory.bind(this);
    this.state = {
    };
  }

  componentWillMount() {
    this.props.actions.getParentTags();
  }

  setCategory(tag) {
    this.props.actions.setPostCategory(tag);
    this.props.actions.push({
      key: 'createPostFinish',
      back: true,
      title: 'Post',
      next: 'Post'
    }, 'home');
  }

  render() {
    let parentTags = null;
    let categoryEl = null;
    let styles = globalStyles;
    if (this.props.tags) {
      parentTags = this.props.tags;
      categoryEl = parentTags.map((tag, i) => {
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

          case 'thisie':
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

          default:
            break;
        }

        return (
          <TouchableHighlight
            key={i}
            onPress={() => this.setCategory(tag)}
            underlayColor={'transparent'}
            style={[styles.categoryItem]}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center' }}
            >
              <Text>{tag.emoji}</Text>
              <Text>{tag.name}</Text>
            </View>
          </TouchableHighlight>
        );
      });
    }

    return (
      <ScrollView >
        {categoryEl}
      </ScrollView>
    );
  }
}

// export default Categories;
function mapStateToProps(state) {
  return {
    tags: state.tags.parentTags,
    view: state.view,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(
      { ...createPostActions,
        ...tagActions,
        ...navigationActions,
      }, dispatch),
  };
}


export default connect(mapStateToProps, mapDispatchToProps)(Categories);
