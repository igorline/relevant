import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import SelectTags from 'modules/createPost/web/selectTags.component';
import { View, Divider } from 'modules/styled/uni';
import TagInput from 'modules/createPost/web/TagInput.component';

TagsInput.propTypes = {
  selectedTags: PropTypes.array,
  allTags: PropTypes.array,
  setState: PropTypes.func
};

export default function TagsInput({ selectedTags, setState, allTags }) {
  const selectTags = tag => {
    if (!tag || !tag.length) return;
    if (typeof tag === 'string') tag = [tag];
    selectedTags = [...new Set([...selectedTags, ...tag])];
    setState({ selectedTags });
  };

  return (
    <Fragment>
      <View mt={[3, 2]}>
        <TagInput
          selectedTags={selectedTags}
          selectTag={selectTags}
          deselectTag={tag =>
            setState({ selectedTags: selectedTags.filter(t => t !== tag) })
          }
          placeholderText={!selectedTags.length ? 'Please add at least one tag' : ''}
        />
        <View mt={[4, 2]}>
          <SelectTags
            text={'Suggested tags'}
            tags={allTags}
            selectedTags={selectedTags}
            selectTag={selectTags}
            deselectTag={tag =>
              setState({ selectedTags: selectedTags.filter(t => t !== tag) })
            }
          />
        </View>
        <Divider mt={[4, 2]} />
      </View>
    </Fragment>
  );
}
