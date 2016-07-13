//
//  Relevant.m
//  relevantNative
//
//  Created by jaygoss on 7/11/16.
//  Copyright © 2016 Facebook. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "ReactNativeShareExtension.h"
#import "RCTRootView.h"

@interface Relevant : ReactNativeShareExtension
@end

@implementation Relevant

RCT_EXPORT_MODULE();

- (UIView*) shareView {
  //this is the name of registered component that ShareExtension loads.
  NSString *myShareComponentName = @"relevantNative";
  
  NSURL *jsCodeLocation = [NSURL URLWithString:@"http://localhost:8081/index.ios.bundle?platform=ios&dev=true"];
  
  RCTRootView *rootView = [[RCTRootView alloc] initWithBundleURL:jsCodeLocation
                                                      moduleName:myShareComponentName
                                               initialProperties:nil
                                                   launchOptions:nil];
  rootView.backgroundColor = nil;
  return rootView;
}

@end
