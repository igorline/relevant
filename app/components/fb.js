// 'use strict';

// import React, {
//   AppRegistry,
//   Component,
//   StyleSheet,
//   Text,
//   View,
//   TextInput
// } from 'react-native';

// var FBSDKLogin = require('react-native-fbsdklogin');

// var {
//   FBSDKLoginButton,
// } = FBSDKLogin;

// class fbButton extends Component {
//   render() {
//     return (
//       <View>
//         <FBSDKLoginButton
//           onLoginFinished={(error, result) => {
//             if (error) {
//               alert('Error logging in.');
//             } else {
//               if (result.isCancelled) {
//                 alert('Login cancelled.');
//               } else {
//                 alert('Logged in.');
//               }
//             }
//           }}
//           onLogoutFinished={() => alert('Logged out.')}
//           readPermissions={[]}
//           publishPermissions={['publish_actions']}/>
//       </View>
//     );
//   }
// }

// export default fbButton