import React from 'react';
import PostButtons from 'modules/post/vote-buttons/postbuttons.container';
import ButtonRow from 'modules/post/mobile/buttonRow';
import { View } from 'modules/styled/uni';

export default function ButtonContainer(props) {
  return (
    <View fdirection={'row'} justify={'space-between'} align={'center'}>
      <PostButtons {...props} />
      <ButtonRow {...props} />
    </View>
  );
}
