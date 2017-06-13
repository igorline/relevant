//
//  Relevant.m
//  relevantNative
//
//  Created by smil k on 9/28/16.
//  Copyright © 2016 Facebook. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "CodePush.h"
#import "ReactNativeShareExtension.h"
#import "RCTBundleURLProvider.h"
#import "RCTRootView.h"


//@import Firebase;


@interface Relevant : ReactNativeShareExtension
@end

@implementation Relevant

RCT_EXPORT_MODULE();

- (UIView*) shareView {
  NSURL *jsCodeLocation;
  
  jsCodeLocation = [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index.ios" fallbackResource:nil];
  #ifdef DEBUG
    jsCodeLocation = [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index.ios" fallbackResource:nil];
  #else
    jsCodeLocation = [CodePush bundleURL];
  #endif
  
  RCTRootView *rootView = [[RCTRootView alloc] initWithBundleURL:jsCodeLocation
                                                      moduleName:@"Relevant"
                                               initialProperties:nil
                                                   launchOptions:nil];
  rootView.backgroundColor = nil;
//  [FIRApp configure];

  return rootView;
}

@end
