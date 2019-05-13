/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#import "AppDelegate.h"
#import <React/RCTBridge.h>
#import <CodePush/CodePush.h>
#import <React/RCTPushNotificationManager.h>
#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>
#import <React/RCTLinkingManager.h>
#import "Orientation.h" // <--- import
#import <TwitterKit/TwitterKit.h>

@import Firebase;

@implementation AppDelegate

// Required to register for notifications
- (void)application:(UIApplication *)application didRegisterUserNotificationSettings:(UIUserNotificationSettings *)notificationSettings
{
    [RCTPushNotificationManager didRegisterUserNotificationSettings:notificationSettings];
}
// Required for the register event.
- (void)application:(UIApplication *)application didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken
{
    [RCTPushNotificationManager didRegisterForRemoteNotificationsWithDeviceToken:deviceToken];
}
// Required for the registrationError event.
- (void)application:(UIApplication *)application didFailToRegisterForRemoteNotificationsWithError:(NSError *)error
{
    [RCTPushNotificationManager didFailToRegisterForRemoteNotificationsWithError:error];
}
// Required for the notification event.
- (void)application:(UIApplication *)application didReceiveRemoteNotification:(NSDictionary *)notification
{
    [RCTPushNotificationManager didReceiveRemoteNotification:notification];
}
// Required for the localNotification event.
- (void)application:(UIApplication *)application didReceiveLocalNotification:(UILocalNotification *)notification
{
    [RCTPushNotificationManager didReceiveLocalNotification:notification];
}

// This makes linking work
- (BOOL)application:(UIApplication *)application openURL:(NSURL *)url
  sourceApplication:(NSString *)sourceApplication annotation:(id)annotation
{
  return [RCTLinkingManager application:application openURL:url
                      sourceApplication:sourceApplication annotation:annotation];
}

// twitter + url
- (BOOL)application:(UIApplication *)app openURL:(NSURL *)url options:(NSDictionary<NSString *,id> *)options {

  NSString* stringURL = [url absoluteString];

  BOOL UrlHandled = [RCTLinkingManager application:app openURL:url options:options] &&
  ([stringURL hasPrefix:@"Relevant://"] == YES || [stringURL hasPrefix:@"https://relevant.community/"] == YES);

  BOOL TwitterHandled = [[Twitter sharedInstance] application:app openURL:url options:options];

  return UrlHandled || TwitterHandled;
}

// Used for universal links
- (BOOL)application:(UIApplication *)application continueUserActivity:(NSUserActivity *)userActivity
 restorationHandler:(void(^)(NSArray * _Nullable))restorationHandler
{
  return [RCTLinkingManager application:application
                   continueUserActivity:userActivity
                     restorationHandler:restorationHandler];
}

- (UIInterfaceOrientationMask)application:(UIApplication *)application supportedInterfaceOrientationsForWindow:(UIWindow *)window {
  return [Orientation getOrientation];
}

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  RCTBridge *bridge = [[RCTBridge alloc] initWithDelegate:self launchOptions:launchOptions];

  RCTRootView *rootView = [[RCTRootView alloc] initWithBridge:bridge
                                                   moduleName:@"relevantNative"
                                            initialProperties:nil];

  // RCTRootView *rootView = [[RCTRootView alloc] initWithBundleURL:jsCodeLocation
  //                                                     moduleName:@"relevantNative"
  //                                              initialProperties:nil
  //                                                  launchOptions:launchOptions];

  for (NSString* family in [UIFont familyNames])
  {
    NSLog(@"%@", family);

    for (NSString* name in [UIFont fontNamesForFamilyName: family])
    {
      NSLog(@"  %@", name);
    }
  }

  rootView.backgroundColor = [[UIColor alloc] initWithRed:1.0f green:1.0f blue:1.0f alpha:1];

  self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
  UIViewController *rootViewController = [UIViewController new];
  rootViewController.view = rootView;
  self.window.rootViewController = rootViewController;
  [self.window makeKeyAndVisible];

  [FIRApp configure];

//  #ifdef DEBUG
//    NSLog(@"DEBUG!!!");
//  #else
//    NSLog(@"PRODUCTION");
//  #endif

  return YES;
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
  #if DEBUG
    return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index" fallbackResource:nil];
  #else
    return [CodePush bundleURL];
  #endif
}

@end
