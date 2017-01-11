import React, { Component } from 'react';
import {
  Image,
  View,
  Text,
  TouchableWithoutFeedback,
  StyleSheet
} from 'react-native';
import { globalStyles } from '../../styles/global';
import Percent from '../percent.component';
import { numbers } from '../../utils'

let styles = { ...globalStyles };

export default function (props) {

  let { type, entity} = props;

  let value = (
    <Text>
      💵{numbers.abbreviateNumber(entity.value || entity.balance || 0)}
    </Text>)

  let percent = (
      <Text style={[styles.font15]}>
        <Percent user={props.entity} />
      </Text>
    )

  let relevance = (
    <Text>📈
      <Text>
        {numbers.abbreviateNumber(props.entity.relevance)}
      </Text>
    </Text>
  )

  let getLeft = () => {
    if (type === 'value') return value;
    if (type === 'percent') return percent;
    if (type === 'nav') return relevance;
  }

  let getRight = () => {
    if (type === 'value') return relevance;
    if (type === 'percent') return relevance;
    if (type === 'nav') return value;
  }

  return (
    <View style={styles.stats}>
      <Text style={[styles.font14, styles.bebas, styles.quarterLetterSpacing]}>
        {getLeft()}
        <Text>&nbsp;•&nbsp;</Text>
        {getRight()}
      </Text>
    </View>
  )
}