# Relevant

## Running the Web Version:

install npm dependencies
```
npm install
```

run dev version (offers hot reloading):
```
npm run dev
```
navigate to `localhost:3000`

some user accounts you can use on the test db:
username / password
test / test 
q / q 
w / w 
a / a 
s / s

build production bundle:
```
npm run build
```

run a production-like envirnoment (client uses built file, offers faster server reloads)
```
npm run native
```

run tests (runs both client and server tests)
```
npm run test
```

run tests in watch mode (runs both client and server tests)
```
npm run test:watch
```

## Running Native Code:
Xcode 7.0 or higher is required. It can be installed from the App Store.


##Install
Install the React Native command line tools:
```
$ npm install -g react-native-cli
```

install Relevant's packages
```
npm install
```

install Pod files
```
cd ios
pod install
```

##Run
Open ```ios/relevantNative.xcodeproj``` and hit run in Xcode

⌘-R in iOS simulator to reload the app and see your change

⌘-D in iOS simulator to open the dev menu

Shake iPhone to open dev menu

##Fonts
###Tab bar
In Xcode open /Libraries/React.xcodeproj/React/Views/RTCTabBarItem.m  
on line 89 paste the following and rebuild the app
```objective-c
  /* set custom font for tabBarItem */
  [_barItem setTitleTextAttributes:@{
    NSFontAttributeName: [UIFont fontWithName:@"Bebas Neue" size:10.0f]
  } forState:UIControlStateSelected];
  [_barItem setTitleTextAttributes:@{
    NSFontAttributeName: [UIFont fontWithName:@"Bebas Neue" size:10.0f]
  } forState:UIControlStateNormal];
```

##Debugging
###Chrome Developer Tools 
To debug the JavaScript code in Chrome, select Debug in Chrome from the developer menu. This will open a new tab at http://localhost:8081/debugger-ui.

In Chrome, press ```⌘ + option + i``` or select ```View → Developer → Developer Tools``` to toggle the developer tools console. Enable Pause On Caught Exceptions for a better debugging experience.

To debug on a real device:

On iOS - open the file ```RCTWebSocketExecutor.m``` and change ```localhost``` to the IP address of your computer. Shake the device to open the development menu with the option to start debugging.

##Running On Device 
Note that running on device requires Apple Developer account and provisioning your iPhone. This guide covers only React Native specific topic.

###Accessing development server from device 
You can iterate quickly on device using development server. To do that, your laptop and your phone have to be on the same wifi network.

1. Open ```AwesomeApp/ios/AwesomeApp/AppDelegate.m```
2. Change the IP in the URL from ```localhost``` to your laptop's IP. On Mac, you can find the IP address in System Preferences / Network.
3. In Xcode select your phone as build target and press "Build and run"
Hint

###Using offline bundle 

Open ```ios/AwesomeApp/AppDelegate.m```
Uncomment jsCodeLocation = [[NSBundle mainBundle] ...
The JS bundle will be built for dev or prod depending on your app's scheme (Debug = development build with warnings, Release = minified prod build with perf optimizations). To change the scheme navigate to ```Product > Scheme > Edit Scheme...``` in xcode and change ```Build Configuration``` between ```Debug``` and ```Release```.

### Talking to contracts from react

This repo uses [Statesauce](https://github.com/statesauce/redux-saga-web3) for web3 managagement, contract interactions, caching, and side-effects. Initialized in `app/core/contracts.js` and consumed by files in `app/modules/contract/` which contain the reusable hocs, hooks, helpers, and propTypes for talking to Relevant Token contracts in a reliable way while staying synced to a strictly-defined reactive data store.

`app/modules/contract/contract.container.js` exports a Higher Order Container (HOC) that exposes a RelevantToken-specific implementation of Statesauce's read/write semantics.

The mapDispatch function `cacheMethod` is used for pure contract methods that don't mutate contract state in anyway. It takes arguments `method` and `args`, and dispatches an action to announce a requested contract call, updating the store, and triggering the saga that makes the contract call that ultimately updates the store with the result.

The mapState function `methodCache` runs selector functions that derive state from the store for the method specified. It will force an update to the react component whenever any of the arguments or store keys change. It's the compliment to `cacheMethod` that tells you what's going on - it does reading, whereas `cacheMethod` does writing.
