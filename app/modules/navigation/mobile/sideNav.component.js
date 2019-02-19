import React from 'react';
import PropTypes from 'prop-types';
import { ScrollView } from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import styled from 'styled-components/primitives';
import NavProfileComponent from 'modules/profile/navProfile.component';
import CommunityNav from 'modules/community/communityNav.component';
// import SideNavFooter from 'modules/navigation/web/sideNavFooter.component';
import { layout } from 'app/styles';
import { showModal } from 'modules/navigation/navigation.actions';
// import { View } from 'modules/styled/uni';
import { SafeAreaView } from 'react-navigation';

const SideNavSection = styled.View`
  ${layout.universalBorder('bottom')}
`;

// const LogoContainer = styled(View)`
//   background: ${colors.secondaryBG};
//   height: ${layout.headerHeight};
//   ${mixins.border}
// `;

// const logoLink = '/relevant/new';

const SideNav = props => (
  <ScrollView>
    <SafeAreaView>
      {/*        <LogoContainer br bb>
        <ULink align={'flex-start'} to={logoLink}>
          <View
            pl={4}
            h={layout.headerHeight}
            align={'center'}
            fdirection={'row'}
          >
            <Image
              h={4}
              w={22}
              resizeMode={'contain'}
              source={require('app/public/img/logo-opt.png')}
              alt={'Relevant'}
            />
          </View>
        </ULink>
      </LogoContainer> */}
      <SideNavSection>
        <NavProfileComponent mobile />
      </SideNavSection>
      <SideNavSection>
        <CommunityNav {...props} mobile />
      </SideNavSection>
    </SafeAreaView>
  </ScrollView>
);

SideNav.propTypes = {
  className: PropTypes.string,
  actions: PropTypes.object
};

const mapStateToProps = state => ({
  isAuthenticated: state.auth.isAuthenticated
});

export default connect(
  mapStateToProps,
  dispatch => ({
    actions: bindActionCreators({ showModal }, dispatch)
  })
)(SideNav);
