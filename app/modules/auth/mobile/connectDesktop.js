import React from 'react';
import { Platform } from 'react-native';
import { useDispatch } from 'react-redux';
import { BodyText, AbsoluteView, Box, Title } from 'modules/styled/uni';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { RNCamera as Camera } from 'react-native-camera';
import { storage } from 'app/utils';
import { loginUserSuccess, getUser } from 'modules/auth/auth.actions';
import { hideModal } from 'modules/navigation/navigation.actions';
import { fullHeight, IphoneX } from 'styles/global';

export default function ConnectDesktop() {
  const dispatch = useDispatch();

  const onRead = async e => {
    const token = e.data;
    await storage.setToken(token);
    dispatch(loginUserSuccess(token));
    dispatch(getUser());
    dispatch(hideModal());
  };

  return (
    <Box
      style={{
        minHeight: fullHeight - 2 * 48 - (IphoneX ? 33 : 0)
      }}
    >
      <AbsoluteView left={'-32px'} top={Platform.OS === 'android' ? '-48px' : '0'}>
        <QRCodeScanner
          topViewStyle={{ flex: 1, alignItems: 'flex-start' }}
          topContent={
            <Box p={2}>
              <Title>Log in with Desktop Browser</Title>
            </Box>
          }
          cameraStyle={{
            overflow: 'hidden'
          }}
          cameraProps={{ flashMode: Camera.Constants.FlashMode.auto }}
          onRead={onRead}
          bottomViewStyle={{ flex: 1, alignItems: 'flex-start' }}
          bottomContent={
            <Box p={2}>
              <Title>Instructions:</Title>
              <BodyText mt={1}>1. Go to relevant.community on your computer</BodyText>
              <BodyText mt={0.5}>2. Log in and navigate to your profile</BodyText>
              <BodyText mt={0.5}>3. Click 'Connect Mobile Device'</BodyText>
              <BodyText mt={0.5}>4. Scan the QR code</BodyText>
            </Box>
          }
        />
      </AbsoluteView>
    </Box>
  );
}
