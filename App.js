import { Provider } from 'react-redux';
import React from 'react';
import { StyleSheet, Platform, StatusBar, Text} from 'react-native';
import { NavigationContainer } from '@react-navigation/native'
import { TransitionPresets, createStackNavigator } from '@react-navigation/stack';
import { responsiveHeight, responsiveWidth, responsiveFontSize } from "react-native-responsive-dimensions";
import { SharedElement, createSharedElementStackNavigator } from 'react-navigation-shared-element';
import { LogBox } from 'react-native';
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state.',
]);
// ЭЛЕМЕНТЫ ИЗ МОИХ ФАЙЛОВ
import { store } from './redux/Redux';
import MainNavigator from './src/MainNavigator';
import DetailScreen from './src/DetailScreen';
import RegisterScreen from './src/RegisterScreen';

Text.defaultProps = Text.defaultProps || {}; //Disable dynamic type in IOS
Text.defaultProps.allowFontScaling = false;

const RootStack = createSharedElementStackNavigator();

export default function App() {
  const transition = {
    // gestureDirection: "vertical",
    transitionSpec: {
      open: {
        animation: "timing",
        config: {
          duration: 400,
        },
      },
      close: {
        animation: 'timing',
        config: {
          duration: 350,
        },
      },
    },
    // cardStyleInterpolator: ({ current: { progress } }) => {
    //   return {
    //     cardStyle: {
    //       opacity: progress,
    //     },
    //   };
    // },
  };

  return (
    <Provider store={store}>
      <NavigationContainer>
        <RootStack.Navigator>
          <RootStack.Screen
            name="MainNavigator"
            component={MainNavigator}
            options={{ headerShown: false }}
          />
          <RootStack.Screen
            name="Detail"
            component={DetailScreen}
            options={{
              gestureEnabled: false,
              headerShown: false,
              transitionSpec: transition.transitionSpec,
            }}
            sharedElements={(route, otherRoute, showing) => {
              const { item, index } = route.params;
              return [{ id: `item.${item.id}`, animation: 'fade' }];
            }}
          />
          <RootStack.Screen
            name="RegisterScreen"
            component={RegisterScreen}
            options={() => {
              return {
                headerShown: false,
                gestureEnabled: true,
                cardOverlayEnabled: true,
                ...TransitionPresets.ModalPresentationIOS,
              };
            }}
          />

        </RootStack.Navigator>
      </NavigationContainer>
    </Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  input: {
    width: responsiveWidth(75), //360
    height: responsiveHeight(7.109), //60
    borderBottomLeftRadius: responsiveHeight(0.5924), //5
    borderTopRightRadius: responsiveHeight(0.5924), //5
    borderBottomWidth: responsiveHeight(0.237), //2
    borderLeftWidth: responsiveHeight(0.237), //2
    padding: responsiveWidth(2.56), //10
    borderColor: 'grey',
    backgroundColor: '#ffffff90',
    fontFamily: 'Inter_400Regular',
    fontSize: responsiveFontSize(2.1)
  },
  AndroidSafeArea: {
    flex: 1,
    backgroundColor: "white",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0
  },
})
