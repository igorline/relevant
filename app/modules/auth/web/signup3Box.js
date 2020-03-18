import React, { Fragment, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useWeb3, useMetamask } from 'modules/contract/contract.hooks';
import { Header, View, Text, ErrorBox, WarningBox } from 'modules/styled/uni';
import { use3BoxProfile } from 'modules/auth/3box.hooks';
import { ActivityIndicator } from 'react-native-web';
import { utils } from 'ethers';
import ProfileForm from './profile.form';

Signup3Box.propTypes = {
  close: PropTypes.func
};

export default function Signup3Box({ close }) {
  const [[profileEror, profile], setProfile] = useState([]);
  const [accounts] = useWeb3();
  const metamask = useMetamask();
  const address = accounts && utils.getAddress(accounts[0]);

  useEffect(() => {
    if (address) setProfile([]);
  }, [address]);

  use3BoxProfile({ address, metamask, setProfile });

  const initialValues = profile
    ? {
        username: profile.name,
        image: getImg(profile),
        email: profile.email
      }
    : {};

  const signature = profile && profile.signature;

  const additionalFields = profile && {
    signature,
    ethLogin: address,
    msg: profile.msg
  };

  return (
    <Fragment>
      <Header mb={2}>Sign up with 3box</Header>
      {address && !profile && (
        <View mt={4}>
          <ActivityIndicator />
          <Text mt={2}>Fetching 3box profile...</Text>
        </View>
      )}
      {address && !profile && <Text mt={1}>Address: {address}</Text>}
      {!signature && (
        <WarningBox mt={4}>
          <Text>Please sign the authorization message using Metamask</Text>
        </WarningBox>
      )}
      {profileEror && (
        <ErrorBox mt={4}>
          <Text>{profileEror}</Text>
        </ErrorBox>
      )}
      <View mt={2} />
      {address && profile && signature && (
        <ProfileForm
          initialValues={initialValues}
          additionalFields={additionalFields}
          close={close}
        />
      )}
    </Fragment>
  );
}

function getImg(profile) {
  if (!profile.image || !profile.image.length) return null;
  const url = profile.image[0].contentUrl;
  if (!url) return null;
  return url['/'] ? 'https://ipfs.infura.io/ipfs/' + url['/'] : url;
}
