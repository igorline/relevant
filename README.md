# Relevant
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
