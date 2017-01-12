import React from 'react';
import {
  View,
  Text,
} from 'react-native';
import { globalStyles } from '../../styles/global';
import Percent from '../percent.component';
import { numbers } from '../../utils';

let styles = { ...globalStyles };

export default function (props) {
  let { type, entity } = props;

  let value = (
    <Text>
      💵{numbers.abbreviateNumber(entity.value || entity.balance || 0)}
    </Text>);

  let percent = <Percent user={props.entity} />;


  let relevance = (
    <Text>📈{numbers.abbreviateNumber(props.entity.relevance)}
    </Text>
  );

  let getLeft = () => {
    if (type === 'value') return value;
    if (type === 'percent') return percent;
    if (type === 'nav') return null;
    return null;
  };

  let getRight = () => {
    if (type === 'value') return relevance;
    if (type === 'percent') return relevance;
    if (type === 'nav') return value;
    return null;
  };

  return (
    <View style={styles.stats}>
      <Text style={[styles.font17, styles.bebas, styles.quarterLetterSpacing]}>
        {getLeft()}
        {getLeft() ? <Text>&nbsp;•&nbsp;</Text> : null}
        {getRight()}
      </Text>
    </View>
  );
}
