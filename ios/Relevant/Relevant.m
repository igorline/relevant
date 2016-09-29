//
//  Relevant.m
//  relevantNative
//
//  Created by smil k on 9/28/16.
//  Copyright © 2016 Facebook. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "ReactNativeShareExtension.h"
#import "RCTRootView.h"
#import "RCTBundleURLProvider.h"

@interface MyShareEx : ReactNativeShareExtension
@end

@implementation MyShareEx

RCT_EXPORT_MODULE();

- (UIView*) shareView {
  NSURL *jsCodeLocation;
  
  jsCodeLocation = [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index.ios" fallbackResource:nil];
  
  RCTRootView *rootView = [[RCTRootView alloc] initWithBundleURL:jsCodeLocation
                                                      moduleName:@"MyShareEx"
                                               initialProperties:nil
                                                   launchOptions:nil];
  rootView.backgroundColor = nil;
  return rootView;
}

@end