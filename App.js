import { Provider } from 'react-redux';
import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TextInput, Text, Platform, StatusBar, KeyboardAvoidingView, Pressable, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native'
import { TransitionPresets, createStackNavigator } from '@react-navigation/stack';
import { responsiveHeight, responsiveWidth, responsiveFontSize } from "react-native-responsive-dimensions";
import { SharedElement, createSharedElementStackNavigator } from 'react-navigation-shared-element';
import axios from 'axios';
import { LogBox } from 'react-native';
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state.',
]);
// ИКОНКИ
import { AntDesign } from '@expo/vector-icons';
import { FontAwesome5 } from '@expo/vector-icons';
// ЭЛЕМЕНТЫ ИЗ МОИХ ФАЙЛОВ
import { store } from './redux/redux';
import MainNavigator from './src/MainNavigator';
import DetailScreen from './src/DetailScreen';
import RegisterScreen from './src/RegisterScreen';
// function Modal({ route, navigation }) {

//   const input = useRef(null); //ссылка на поле с логином

//   const storeData = async () => {
//     try {
//       const jsonValue = JSON.stringify(userLogin);
//       await AsyncStorage.setItem('@InUser', jsonValue);
//       console.log('я сохранил InUser в modal');
//     } catch (e) {
//       console.log('ошибка сохранения InUser в modal');
//     }
//   }

//   useEffect(() => {
//     async function fethchData() {
//       try {
//         const jsonValue = await AsyncStorage.getItem('@InUser')
//         console.log('я прочитал InUser modal');
//         if (jsonValue != null) {
//           setUserLogin(JSON.parse(jsonValue));
//         }
//       } catch (e) {
//         console.log('ошибка чтения')
//       }
//     }
//     fethchData();
//   }, []);

//   const [userLogin, setUserLogin] = useState("");

//   return (
//     <View style={styles.container}>
//       <Pressable style={{ paddingLeft: responsiveWidth(2.5), paddingTop: responsiveWidth(2.5) }} onPress={() => navigation.navigate("MainNavigator")}>
//         <AntDesign name="back" size={responsiveHeight(3.9)} color="black" />
//       </Pressable>
//       <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: responsiveHeight(25) }}>
//         <FontAwesome5 name="user-graduate" size={responsiveHeight(10)} color="black" />
//         <View>
//           <Text style={{ paddingLeft: responsiveWidth(1), fontSize: responsiveFontSize(2.67) }}>ваш логин</Text>
//           <TextInput
//             ref={input}
//             style={styles.input}
//             placeholder="student login"
//             defaultValue={userLogin}
//             onChangeText={setUserLogin}
//             onSubmitEditing={async () => {
//               const { data } = await axios.get(`http://api.grsu.by/1.x/app1/getStudent?login=${userLogin}&lang=ru_RU`);
//               if (data.k_sgryp != "") {
//                 await route.params.getUser(data);
//                 storeData(data);
//                 navigation.navigate("MainNavigator")
//               }
//               else {
//                 console.log("неверный логин");
//                 Alert.alert('Hello', 'Your user login is wrong', [
//                   {
//                     text: 'I understand',
//                     onPress: () => input.current?.focus(),
//                     style: 'cancel',
//                   },
//                   { text: ':(', onPress: () => input.current?.focus() },
//                 ]);
//               }
//             }}
//             autoCapitalize='none' />
//         </View>
//       </View>
//     </View>
//   );
// }
// const RootStack = createStackNavigator();
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
}

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
