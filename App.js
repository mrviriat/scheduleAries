import { Provider } from 'react-redux';
import React from 'react';
import { Text } from 'react-native';
import { LogBox } from 'react-native';
import { useFonts, Inter_400Regular } from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
// ЭЛЕМЕНТЫ ИЗ МОИХ ФАЙЛОВ
import { store } from './redux/redux';
import Container from './src/Container';

Text.defaultProps = Text.defaultProps || {}; //Disable dynamic type in IOS
Text.defaultProps.allowFontScaling = false;

LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state.',
]);

SplashScreen.preventAutoHideAsync();

export default function App() {

  let [fontsLoaded] = useFonts({
    Inter_400Regular,
  });

  return (
    <Provider store={store}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Container />
      </GestureHandlerRootView>
    </Provider>
  );
};