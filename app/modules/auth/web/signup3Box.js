import React, { Fragment, useState } from 'react';
import PropTypes from 'prop-types';
import { useWeb3, useMetamask } from 'modules/contract/contract.hooks';
import { Header, View, Text, Err } from 'modules/styled/uni';
import { use3BoxProfile, useUpdateProfile } from 'modules/auth/3box.hooks';
import { ActivityIndicator } from 'react-native-web';
import ProfileForm from './profile.form';

Signup3Box.propTypes = {
  close: PropTypes.func
};

export default function Signup3Box({ close }) {
  const [[profileEror, profile], setProfile] = useState([]);
  const [accounts] = useWeb3();
  const metamask = useMetamask();
  const address = accounts && accounts[0];
  use3BoxProfile({ address, metamask, setProfile });
  const setSpaceProfile = useUpdateProfile(address, metamask);

  const initialValues = profile
    ? {
        username: profile.name,
        image: getImg(profile),
        email: profile.email
      }
    : {};

  const additionalFields = profile && {
    DID: profile.DID,
    signature: profile.signature,
    boxAddress: address
  };

  return (
    <Fragment>
      <Header>Sign up with 3box</Header>
      {address && !profile && (
        <View mt={4}>
          <ActivityIndicator />
          <Text mt={2}>Fetching 3box profile...</Text>
        </View>
      )}
      {address && !profile && <Text mt={1}>Address: {address}</Text>}
      {profileEror && <Err mt={2}>Error: {profileEror}</Err>}
      <View mt={2} />
      {address && profile && (
        <ProfileForm
          initialValues={initialValues}
          setSpaceProfile={setSpaceProfile}
          additionalFields={additionalFields}
          close={close}
        />
      )}
    </Fragment>
  );
}

function getImg(profile) {
  if (!profile.image || !profile.image.length) return null;
  const url = profile.image[0].contentUrl && profile.image[0].contentUrl['/'];
  if (!url) return null;
  return 'https://ipfs.infura.io/ipfs/' + url;
}
