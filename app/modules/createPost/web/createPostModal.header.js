import React from 'react';
import { hideModal } from 'modules/navigation/navigation.actions';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { View, Title, Image } from 'modules/styled/uni';
import { colors, fonts, sizing } from 'app/styles';
import loadable from '@loadable/component';
import { browserAlerts } from 'utils/alert';

const Select = loadable(() => import('react-select'));

ModalHeader.propTypes = {
  history: PropTypes.object
};

function ModalHeader({ history }) {
  const dispatch = useDispatch();
  const { communities, list, active } = useSelector(state => state.community);

  const com = list.map(id => communities[id]);
  const options = com.map(c => ({ label: c.name, value: c.slug }));
  const activeCommunity = com.find(c => c.slug === active);
  if (!activeCommunity) {
    dispatch(hideModal());
    browserAlerts.alert('Please select a community first', 'error');
    return null;
  }
  const value = { label: activeCommunity.name, value: active };

  const image = activeCommunity.image
    ? { uri: activeCommunity.image }
    : require('app/public/img/default_community.png');

  return (
    <View style={{ zIndex: 1 }} fdirection="row" align={'baseline'}>
      <Title mr={1.5}>Post to:</Title>
      <Image
        w={2}
        h={2}
        mr={1}
        mt={0.25}
        style={{ bottom: '-1px' }}
        source={image}
        resizeMode={'cover'}
      />
      <Select
        isSearchable={false}
        styles={customStyles}
        value={value}
        onChange={e => history.push(`/${e.value}/new`)}
        options={options}
      />
    </View>
  );
}

const customStyles = {
  menu: provided => ({
    ...provided,
    borderRadius: 0,
    padding: 0,
    maxWidth: 300
  }),
  container: () => ({
    padding: '0px'
  }),
  option: (provided, state) => ({
    borderBottom: `1px solid ${colors.lightBorder}`,
    ...fonts.body,
    color: state.isSelected ? colors.blue : colors.black,
    padding: sizing(3),
    cursor: 'pointer'
  }),
  indicatorSeparator: () => {},
  dropdownIndicator: provided => ({
    ...provided,
    padding: 0,
    cursor: 'pointer'
  }),
  valueContainer: provided => ({
    ...provided,
    padding: 0,
    overflow: 'visible',
    paddingRight: 10,
    cursor: 'pointer'
  }),
  control: () => ({
    border: 'none',
    display: 'flex',
    padding: 0
  }),
  singleValue: (provided, state) => {
    const opacity = state.isDisabled ? 0.5 : 1;
    const transition = 'opacity 300ms';
    return {
      ...fonts.body,
      cursor: 'pointer',
      fontSize: sizing(2.5),
      lineHeight: sizing(2.5),
      opacity,
      transition
    };
  }
};

export default withRouter(ModalHeader);
