import React from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { showModal } from 'modules/navigation/navigation.actions';
import { View, Button } from 'modules/styled/uni';
import AppStoreButtons from 'modules/web_about/appStoreButtons';

Banner.propTypes = {
  location: PropTypes.object,
  history: PropTypes.object
};

export default function Banner({ location, history }) {
  const dispatch = useDispatch();
  const screenSize = useSelector(state => state.navigation.screenSize);

  if (screenSize > 0) return <AppStoreButtons mt={[8, 4]} mb={[0, 1]} />;

  const setRedirect = () => history.replace({ search: `?redirect=${location.pathname}` });

  return (
    <View display="flex" fdirection="row" justify={['flex-start']}>
      <Button
        onPress={() => {
          setRedirect();
          dispatch(showModal('login'));
        }}
        mr={4}
      >
        Login
      </Button>
      <Button
        onPress={() => {
          setRedirect();
          dispatch(showModal('signupSocial'));
        }}
        mr={0}
      >
        Sign Up
      </Button>
    </View>
  );
}
