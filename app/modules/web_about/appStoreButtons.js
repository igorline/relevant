import React from 'react';
import { View, Image } from 'modules/styled/web';

const iosLink = 'https://itunes.apple.com/us/app/relevant-communities/id1173025051?mt=8';
const googlePlay =
  'https://play.google.com/store/apps/details?id=com.relevantnative&pcampaignid=MKT-Other-global-all-co-prtnr-py-PartBadge-Mar2515-1';

const iosImg = '/img/appstore.png';
const googleImg = '/img/googleplaystore.png';

const AppStoreButtons = styleProps => (
  <View {...styleProps} mt={[8, 4]} mb={[0, 1]}>
    <a href={iosLink} target="_blank">
      <Image h={[6, 6, 5]} mr={[2, 1]} src={iosImg} />
    </a>
    <a href={googlePlay} target="_blank">
      <Image h={[6, 6, 5]} src={googleImg} />
    </a>
  </View>
);

export default AppStoreButtons;
