import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Report from './Report';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { responsiveHeight, responsiveWidth, responsiveFontSize, } from "react-native-responsive-dimensions";
import { FontAwesome5 } from '@expo/vector-icons';
import { Feather } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { StackScreenA, StackScreenB } from './Screens';

export default function MainNavigator() {

  const ReportRef = useRef(null);
  const getDataFromGroup = (head, num, weeknumber) => {
    if (ReportRef.current) {
      ReportRef.current.getDataFromGroup(head, num, weeknumber);
    }
  }

  const Tab = createBottomTabNavigator();
  const dispatch = useDispatch();
  const visibility = useSelector(state => state.visibleReport);
  const CloseReport = () => { //!закрытие окна отправки отчёта
    dispatch({ type: "START_REPORT", payload: false });
  }

  const getValue = async () => {
    try {
      const jsonStudents = await AsyncStorage.getItem('@stu')
      if (jsonStudents != null) {
        StudentsJSON = JSON.parse(jsonStudents);
        dispatch({ type: "GET_STUDENTS", payload: StudentsJSON });
      }
    } catch (e) {
      console.log('ошибка чтения')
    }
  }

  useEffect(() => {  //чтение данных для окна отчёта и экрана со списком студентов
    async function GetDataFromAsync() {
      let head = "";
      let num = "";
      let weeknumber = "";
      try {
        const jsonValue1 = await AsyncStorage.getItem('@head')
        if (jsonValue1 != null) {
          head = JSON.parse(jsonValue1);
          // console.log('я прочитал head');
        }
        const jsonValue2 = await AsyncStorage.getItem('@num')
        if (jsonValue2 != null) {
          num = JSON.parse(jsonValue2);
          // console.log('я прочитал num');
        }
        const jsonValue3 = await AsyncStorage.getItem('@weeknumber')
        if (jsonValue3 != null) {
          weeknumber = JSON.parse(jsonValue3);
          // console.log('я прочитал weeknumber');
        }
        await getValue(); //!чтение студентов для redux
        getDataFromGroup(head, num, weeknumber);
      } catch (e) {
        console.log('ошибка чтения')
      }
    }
    GetDataFromAsync();
  }, []);

  return (
    <>
      <Tab.Navigator
        screenOptions={{
          tabBarShowLabel: false,
          tabBarActiveTintColor: "#007AFF",
          tabBarStyle: {height: Platform.OS === "android" ? responsiveHeight(8) : responsiveHeight(9), paddingBottom: Platform.OS === "android" ? responsiveHeight(1.6) : responsiveHeight(2.5)},
        }}
      >
        <Tab.Screen
          name="Расписание"
          component={StackScreenA}
          options={{
            headerShown: false,
            tabBarIcon: ({ focused, color }) => (
              <Feather name="clock" size={focused ? responsiveHeight(4.3) : responsiveHeight(3.9)} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Список студентов"
          component={StackScreenB}
          options={{
            headerShown: false,
            tabBarIcon: ({ focused, color }) => (
              <FontAwesome5 name="user-edit" size={focused ? responsiveHeight(4.3) : responsiveHeight(3.9)} color={color} />
            ),
          }}
        />
      </Tab.Navigator>
      <Report
        visible={visibility}
        options={{ type: 'slide', from: 'bottom' }}
        duration={500}
        onClose={CloseReport}
        ref={ReportRef}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
