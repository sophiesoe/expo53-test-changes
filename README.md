# React Native Volume Manager With Expo 53 Latest

## For Android

The volume control works on both **Emulators and Real Devices**.

## For iOS

The volume control should test only on **Real Devices**.  
In **Simulators**, the behavior will not work.

### Quick Solution

If there any build errors in Android Native UI,  
Please remove `package.lock.json` file and `nodule_modules` folder before running `npx expo prebuild` and `npx expo run:android`
