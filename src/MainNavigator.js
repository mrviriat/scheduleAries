import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Schedule_screen from './schedule_screen';
import StudentsList_screen from './studentsList_screen';
import Report from './Report';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  SharedElement,
  createSharedElementStackNavigator,
} from 'react-navigation-shared-element';
import { responsiveHeight, responsiveWidth, responsiveFontSize, } from "react-native-responsive-dimensions";
import { Ionicons } from '@expo/vector-icons';
import { FontAwesome5 } from '@expo/vector-icons';

export default function MainNavigator() {

  const ReportRef = useRef(null);
  const getDataFromGroup = (head, num, weeknumber) => {
    if (ReportRef.current) {
      ReportRef.current.getDataFromGroup(head, num, weeknumber);
    }
  }

  const Tab = createBottomTabNavigator();
  const [visibleReport, setVisibleReport] = useState(false);

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
        const jsonStudents = await AsyncStorage.getItem('@stu')
        if (jsonStudents != null) {
          StudentsJSON = JSON.parse(jsonStudents);
          // console.log('я прочитал студентов');
        }
        getDataFromGroup(head, num, weeknumber);
        setstudentsList(StudentsJSON)
      } catch (e) {
        console.log('ошибка чтения')
      }
    }
    GetDataFromAsync();
  }, []);

  const [Schedule_data, setSchedule_data] = useState(); //данные расписания для excel отчёта
  const [studentsList, setstudentsList] = useState([]); //данные для экрана со списком студентов

  return (
    <>
      <Tab.Navigator>
        <Tab.Screen
          name="Schedule"
          children={() =>
            <Schedule_screen
              OpenOffer={() => setVisibleReport(true)}
              setSchedule_data={setSchedule_data}
            />
          }
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
          children={() =>
            <StudentsList_screen
              studentsList={studentsList}
              setStudents={setstudentsList}
            />
          }
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
        visible={visibleReport}
        options={{ type: 'slide', from: 'bottom' }}
        duration={500}
        onClose={() => setVisibleReport(false)}
        data={Schedule_data}
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
