import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TextInput, Text, Platform, StatusBar, KeyboardAvoidingView, Pressable, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native'
import { TransitionPresets, createStackNavigator } from '@react-navigation/stack';
import { responsiveHeight, responsiveWidth, responsiveFontSize } from "react-native-responsive-dimensions";
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {
  SharedElement,
  createSharedElementStackNavigator,
} from 'react-navigation-shared-element';
import { LogBox } from 'react-native';
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state.',
]);
// ИКОНКИ
import { AntDesign } from '@expo/vector-icons';
import { FontAwesome5 } from '@expo/vector-icons';
// ЭЛЕМЕНТЫ ИЗ МОИХ ФАЙЛОВ
import MainNavigator from './MainNavigator';
import DetailScreen from './DetailScreen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { TransitionSpecs } from '@react-navigation/stack';
function Modal({ route, navigation }) {

  const input = useRef(null); //ссылка на поле с логином

  const storeData = async () => {
    try {
      const jsonValue = JSON.stringify(userLogin);
      await AsyncStorage.setItem('@InUser', jsonValue);
      console.log('я сохранил InUser в modal');
    } catch (e) {
      console.log('ошибка сохранения InUser в modal');
    }
  }

  useEffect(() => {
    async function fethchData() {
      try {
        const jsonValue = await AsyncStorage.getItem('@InUser')
        console.log('я прочитал InUser modal');
        if (jsonValue != null) {
          setUserLogin(JSON.parse(jsonValue));
        }
      } catch (e) {
        console.log('ошибка чтения')
      }
    }
    fethchData();
  }, []);

  const [userLogin, setUserLogin] = useState("");

  return (
    <View style={styles.container}>
      <Pressable style={{ paddingLeft: responsiveWidth(2.5), paddingTop: responsiveWidth(2.5) }} onPress={() => navigation.navigate("MainNavigator")}>
        <AntDesign name="back" size={responsiveHeight(3.9)} color="black" />
      </Pressable>
      {/* <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ justifyContent: 'center', alignItems: 'center', }> */}

        <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: responsiveHeight(25)  }}>
          <FontAwesome5 name="user-graduate" size={responsiveHeight(10)} color="black" />
          <View>
            <Text style={{ paddingLeft: responsiveWidth(1), fontSize: responsiveFontSize(2.67) }}>ваш логин</Text>
            <TextInput
              ref={input}
              style={styles.input}
              placeholder="student login"
              defaultValue={userLogin}
              onChangeText={setUserLogin}
              onSubmitEditing={async () => {
                const { data } = await axios.get(`http://api.grsu.by/1.x/app1/getStudent?login=${userLogin}&lang=ru_RU`);
                if (data.k_sgryp != "") {
                  await route.params.getUser(data);
                  storeData(data);
                  navigation.navigate("MainNavigator")
                }
                else {
                  console.log("неверный логин");
                  Alert.alert('Hello', 'Your user login is wrong', [
                    {
                      text: 'I understand',
                      onPress: () => input.current?.focus(),
                      style: 'cancel',
                    },
                    { text: ':(', onPress: () => input.current?.focus() },
                  ]);
                }
              }}
              autoCapitalize='none' />
          </View>

        </View>
      {/* </KeyboardAvoidingView> */}


    </View>
  );
  // return (
  //   <View style={[styles.container, {justifyContent: 'center', alignItems: 'center'}]}>
  //     <Text>я твой второй экран</Text>
  //   </View>
  // );
}
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

    <NavigationContainer>
      <RootStack.Navigator
        initialRouteName="MainNavigator"
      // screenOptions={({ route }) => {
      //   return {
      //     headerMode: "none",
      //     gestureEnabled: true,
      //     cardOverlayEnabled: true,
      //     ...TransitionPresets.ModalPresentationIOS,
      //   };
      // }}
      // mode="modal"



      // initialRouteName="MainNavigator"
      // screenOptions={{
      //   headerShown: false,
      //   // headerTransparent: true,
      //   // title: '',
      //   // headerTintColor: 'black',
      // }}
      >
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
            // cardStyleInterpolator: transition.cardStyleInterpolator
          }}
          sharedElements={(route, otherRoute, showing) => {
            const { item, index } = route.params;
            return [{ id: `item.${item.id}`, animation: 'fade' }];
          }}
        />
        <RootStack.Screen
          name="Modal"
          component={Modal}
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

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  input: {
    width: responsiveWidth(75), //360
    height: responsiveHeight(7.109), //60
    // marginTop: responsiveHeight(1.8),
    borderBottomLeftRadius: responsiveHeight(0.5924), //5
    borderTopRightRadius: responsiveHeight(0.5924), //5
    borderBottomWidth: responsiveHeight(0.237), //2
    borderLeftWidth: responsiveHeight(0.237), //2
    padding: responsiveWidth(2.56), //10
    borderColor: 'grey',
    backgroundColor: '#ffffff90',
    fontFamily: 'Inter_400Regular',
    fontSize: responsiveFontSize(2.1),
  },
  AndroidSafeArea: {
    flex: 1,
    backgroundColor: "white",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0
  },
})
