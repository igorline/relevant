import React from 'react';
import { useDispatch } from 'react-redux';
import { BodyText, AbsoluteView, Box, Header, Title } from 'modules/styled/uni';
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
    <Box style={{ height: fullHeight - 48 * 3 - (IphoneX ? 33 : 0) }}>
      <AbsoluteView left={'-32px'} top={'-48px'}>
        <QRCodeScanner
          topViewStyle={{ flex: 0.5, alignItems: 'flex-start' }}
          topContent={
            <Box p={2}>
              <Header>Log in with Desktop Browser</Header>
            </Box>
          }
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
