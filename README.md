<div align="center" id="top"> 
  <img src="src/icons/owrn-icon-green-180.png" alt="owrn" />
</div>

# OWRN

## 🎯 About

This is a react native application for controlling OneWheel boards.

**Important Note**: There are certain additional steps that must be taken to be able to use Custom Shaping on Pint boards. *Those steps are left up to the you, the user!* Good luck!


**Important Note 2**: This project is not, in **any** way, affiliated with Future Motion.


## 🚦 Getting Started

### Required Software

- [NodeJS](https://nodejs.org/en); [nvm](https://github.com/nvm-sh/nvm) is highly recommended.
- [XCode](https://developer.apple.com/xcode/) (for iOS)
- [Android Command-Line Tools](https://developer.android.com/studio#command-line-tools-only) (for Android)

### Installing Dependencies

```bash
git clone https://github.com/tzfx/owrn # Clone
cd owrn         # Hop into the directory
npm install     # Install NodeJS dependencies.

### Now, choose your own adventure ###
npm run ios     # iOS
                # or
npm run android # android
```


## 😭 Troubleshooting Development

Below are some quick troubleshooting for getting things working on iOS and Android.

### 🍏 iOS Troubleshooting

Make sure you have the following installed:

- The latest version of [XCode](https://developer.apple.com/xcode/)
- Xcode Command-line tools: `xcode-select --install`
- Ruby >= 2.7.6
- [Developer Mode](https://help.testapp.io/faq/enable-developer-mode-ios/) enabled on the iPhone you'd like to publish the application to.

#### 🔥 Hot Tips

- Hot Tip #1: If things aren't compiling right, try to reinstall the react native to ios components with: `cd ios && pod install`.
- Hot Tip #2: If xcode refuses to open when you do `npm run ios`, try `xed -b ios`. This should load the right workspace.
- Hot Tip #3: There are two schema in the xcode workspace, `owrn` and `owrn - Release`. The first one is appropriate for development and debugging, the second one is what you want to use to actually use the application on your phone, in a production capacity.


### 🤖 Android Troubleshooting

Make sure you have the following installed:

- The latest version of [Java](https://www.java.com/en/download/help/download_options.html)
- [Android Command-Line Tools](https://developer.android.com/studio#command-line-tools-only), which gives you access to `sdkmanager`.
- Android platform tools `sdkmanager --install 'platform-tools'`
- The latest Android sdk: `sdkmanager --install 'platform;android-33'`
- For sim support, an android system image & g_apis package for your arch: `sdkmanager --install 'system-images;android-33;google_apis;arm64-v8a'`

#### 🔥 Hot Tips for on-device Debugging.

- Hot Tip #1: You can make sure that your phone is connected via `adb devices -l`
- Hot Tip #2: If it isn't there, make sure you [enable developer mode](https://developer.android.com/studio/debug/dev-options) on the phone.
- Hot Tip #3: If it *still* isn't there, make sure you enable USB Debugging via **Settings > System > Advanced > Developer Options > USB debugging**
- Hot Tip #4: Permissions are WHACK. If your scanner isn't showing up any devices (or you get the permissions alert), make sure Precise Location is enabled for owrn in system settings.
- Hot Tip #5: You can build a production artefact and get it on your phone by doing `npm run android -- --mode=release`. This will strip out debug logging and the dependency on metro.

### 📲 Connection Troubleshooting

You may find it difficult to connect to your board. You may have to do the following:

1. Open the official OneWheel application.
2. Connect to your board.
3. Disconnect from your board in the application.
4. Re-open OWRN and connect.

These steps may not be necessary for everyone. 🫠

---

## Made with ☸️ by [tzfx](https://github.com/tzfx)

[Back to top](#owrn)