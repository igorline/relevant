import React from 'react';
import PropTypes from 'prop-types';
import { s3 } from 'app/utils';
import { useSelector, useDispatch } from 'react-redux';
import { updateUser } from 'modules/auth/auth.actions';
import SettingsModalComponent from 'modules/profile/web/settingsModal.component';
import { browserAlerts } from 'app/utils/alert';
import ToggleContainer from 'modules/profile/settings/toggle.container';
import BoxLogin from 'modules/auth/web/login.3box';
import { Header, View, Text, EthAddress } from 'modules/styled/uni';

SettingsModalContainer.propTypes = {
  close: PropTypes.func
};

export default function SettingsModalContainer({ close }) {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);

  const submit = async vals => {
    try {
      const allVals = { ...vals };
      if (allVals.image && allVals.image.preview && allVals.image.fileName) {
        const image = await s3.toS3Advanced(
          allVals.image.preview,
          allVals.image.fileName
        );
        allVals.image = image.url;
      }
      const resp = await dispatch(updateUser(allVals));
      if (resp) {
        close();
      }
    } catch (err) {
      browserAlerts.alert(err);
    }
  };

  return (
    <View>
      <SettingsModalComponent
        initialValues={user}
        enableReinitialize={true}
        onSubmit={submit}
      />
      <Header>Connect Accounts</Header>
      <View m={'3 0'} fdirection={'row'} align="center">
        <BoxLogin type="metamask" text={'Connect Ethereum Address'} />
        {user.ethLogin ? (
          <Text>
            Connected address: <EthAddress address={user.ethLogin} />
          </Text>
        ) : (
          <Text>Not connected</Text>
        )}
      </View>
      <ToggleContainer />
    </View>
  );
}
