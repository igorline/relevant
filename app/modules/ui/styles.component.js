import React from 'react';
import {
  View,
  Header,
  Title,
  BodyText,
  SecondaryText,
  Button,
  CommentText,
  NumericalValue
} from 'app/modules/styled/uni';
import { StyledTextarea, Input } from 'app/modules/styled/web';

export default () => (
  <View p={4}>
    <Header mt={2}>Header</Header>
    <Title mt={2}>Title</Title>
    <BodyText mt={2}>BodyText</BodyText>
    <SecondaryText mt={2}>SecondaryText</SecondaryText>
    <NumericalValue mt={2}>NumericalValue</NumericalValue>
    <Button mt={2} mr={'auto'}>
      Button
    </Button>
    <Button disabled mt={2} mr={'auto'}>
      Disabled Button
    </Button>
    <Input type={'text'} value={'Input'} mr={'auto'} mt={2} />
    <CommentText mr={'auto'} mt={2}>
      CommentText
    </CommentText>
    <StyledTextarea value={'StyledTextarea'} mt={2} />
  </View>
);
