'use strict';

import React, { AppRegistry } from 'react-native';
import App from './app/containers/app';

AppRegistry.registerComponent('relevantNative', () => App);

// 'use strict';

// import React, {
//   AppRegistry,
//   Component,
//   StyleSheet,
//   Text,
//   View,
//   TextInput
// } from 'react-native';
// var Home = require('./app/containers/RelevantApp');
// import { createStore, combineReducers } from 'redux';
// import { Provider } from 'react-redux/native';

// let store = createStore(combineReducers({routerReducer}));

// class App extends Component {
//     render(){
//         return (
//             <View style={{flex:1}}>
//                 <View style={{position:'absolute',left:0,right:0,top:0,bottom:0,backgroundColor:'#F5FCFF'}}/>
//                 <Router>

//                     <Route name="home" component={Home} title="Home" type="replace"/>

//                 </Router>

//             </View>
//         );
//     }
// }
// class relevantNative extends Component {
//     render() {
//         return (
//             <Provider store={store}>
//                 {() => <App />}
//             </Provider>
//         );
//     }
// }

// AppRegistry.registerComponent('relevantNative', () => relevantNative);
