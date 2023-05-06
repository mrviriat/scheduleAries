import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Schedule_screen from './schedule_screen';
import StudentsList_screen from './studentsList_screen';
import Report from './Report';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createSharedElementStackNavigator } from 'react-navigation-shared-element';
import { responsiveHeight, responsiveWidth, responsiveFontSize, } from "react-native-responsive-dimensions";
import { Ionicons } from '@expo/vector-icons';
import { FontAwesome5 } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';

const StackA = createSharedElementStackNavigator();
const StackB = createSharedElementStackNavigator();

const StackScreenA = () => (
  <StackA.Navigator>
    <StackA.Screen
      name="A"
      component={Schedule_screen}
      options={{ headerShown: false }}
    />
  </StackA.Navigator>
);

const StackScreenB = () => (
  <StackB.Navigator>
    <StackB.Screen
      name="B"
      component={StudentsList_screen}
      options={{ headerShown: false }}
    />
  </StackB.Navigator>
);

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
  const CloseOffer = () => { //!закрытие окна отправки отчёта
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
      let StudentsJSON = [];
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
        // setstudentsList(StudentsJSON)
      } catch (e) {
        console.log('ошибка чтения')
      }
    }
    GetDataFromAsync();
  }, []);

  return (
    <>
      <Tab.Navigator>
        <Tab.Screen
          name="Schedule"
          component={StackScreenA}
          // children={() =>
          //   <Schedule_screen
          //     setSchedule_data={setSchedule_data}
          //   />
          // }
          options={{
            headerShown: false,
            tabBarIcon: () => {
              return (
                <Ionicons name="school" size={responsiveHeight(3.9)} color="black" />
              );
            },
          }}
        />
        <Tab.Screen
          name="StudentsList"
          component={StackScreenB}
          // children={() =>
          //   <StackScreenB
          //     studentsList={studentsList}
          //     setStudents={setstudentsList}
          //   />
          // }
          options={{
            headerShown: false,
            tabBarIcon: () => {
              return (
                <FontAwesome5 name="user-edit" size={responsiveHeight(3.9)} color="black" />
              );
            },
          }}
        />
      </Tab.Navigator>
      <Report
        visible={visibility}
        options={{ type: 'slide', from: 'bottom' }}
        duration={500}
        onClose={CloseOffer}
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
