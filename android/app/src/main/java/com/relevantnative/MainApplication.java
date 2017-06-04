package com.relevantnative;

import android.app.Application;
import android.util.Log;

import com.facebook.react.ReactApplication;
import com.oblador.vectoricons.VectorIconsPackage;
import com.brentvatne.react.ReactVideoPackage;
import com.BV.LinearGradient.LinearGradientPackage;
import com.horcrux.svg.RNSvgPackage;
import com.meedan.ShareMenuPackage;
import com.alinz.parkerdan.shareextension.SharePackage;
import cl.json.RNSharePackage;
import com.imagepicker.ImagePickerPackage;
import com.rt2zz.reactnativecontacts.ReactNativeContacts;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;
import com.evollu.react.fa.FIRAnalyticsPackage;
import com.github.alinz.rnsk.RNSKPackage;
import com.gnet.bottomsheet.RNBottomSheetPackage;

import java.util.Arrays;
import java.util.List;

public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
          new MainReactPackage(),
            new VectorIconsPackage(),
            new ReactVideoPackage(),
            new LinearGradientPackage(),
            new RNSvgPackage(),
            new ShareMenuPackage(),
            new SharePackage(),
            new RNSharePackage(),
            new ImagePickerPackage(),
            new FIRAnalyticsPackage(),
            new ReactNativeContacts(),
            new RNSKPackage(),
            new RNBottomSheetPackage()
      );
    }
  };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    SoLoader.init(this, /* native exopackage */ false);
  }
}
