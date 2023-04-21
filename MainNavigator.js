import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { StyleSheet, Text, View, Easing, Animated } from 'react-native';
import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// import Dialog from "react-native-dialog";
import Schedule_screen from './schedule_screen';
import StudentsList_screen from './studentsList_screen';
import Report from './Report';
import Modal from './Modal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  SharedElement,
  createSharedElementStackNavigator,

} from 'react-navigation-shared-element';
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
  responsiveScreenFontSize
} from "react-native-responsive-dimensions";

import { Ionicons } from '@expo/vector-icons';

import { FontAwesome5 } from '@expo/vector-icons';





export default function MainNavigator() {
  const childRef = useRef(null);
  const deleteStudentFromLesson = (bool, lessonId, studentId) => {
    if (childRef.current) {
      childRef.current.deleteStudentFromLesson(bool, lessonId, studentId);
    }
  }
  const SetDescriptionForStudent = (text, lessonId, studentId) => {
    if (childRef.current) {
      childRef.current.SetDescriptionForStudent(text, lessonId, studentId);
    }
  }

  // const onClickHandler = (text) => {
  //   if (childRef.current) {
  //     childRef.current.onClickHandler(text);
  //   }
  // }

  const ReportRef = useRef(null);
  const getDataFromGroup = (head, num, weeknumber) => {
    if (ReportRef.current) {
      ReportRef.current.getDataFromGroup(head, num, weeknumber);
    }
  }

  const Tab = createBottomTabNavigator();
  const [visibleReport, setVisibleReport] = useState(false);
  const [visible, setVisible] = useState(false);


  const [Students, setStudents] = useState();
  const [selectedLesson, setLesson] = useState();
  const [cc, setCC] = useState(true);

  // НЕИСПОЛЬЗУЕМЫЕ ДАННЫЕ ДЛЯ СТАРТА ДИАЛОГОВОГО ОКНА // ANDROID
  // const [startDialog, setstartDialog] = useState(false);
  // var _class;


  const ScaleVlaue = useRef(new Animated.Value(1)).current;

  const SendBack = () => {
    Animated.timing(ScaleVlaue, {
      toValue: 0.88,
      duration: 200,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true
    }).start(console.log(ScaleVlaue));
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
                setStudents={setStudents}
                setLesson={(text) => setLesson(text)}
                OpenModal={() => setVisible(true)}
                changeE={() => setCC(!cc)}
                // setstartDialog={setstartDialog}
                setSchedule_data={setSchedule_data}
                SendBack={SendBack}
                ref={childRef}
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
            children={() => <StudentsList_screen studentsList={studentsList} setStudents={setstudentsList} />}
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

      <Modal
        visible={visible}
        options={{ type: 'slide', from: 'bottom' }}
        duration={500}
        onClose={() => setVisible(false)}
        students={Students}
        selectedLesson={selectedLesson}
        extra={cc}
        funcfromschudle={deleteStudentFromLesson}
        SetDescriptionForStudent={SetDescriptionForStudent}
      />
      <Report
        visible={visibleReport}
        options={{ type: 'slide', from: 'bottom' }}
        duration={500}
        onClose={() => setVisibleReport(false)}
        data={Schedule_data}
        ref={ReportRef} />

      {/* <Dialog.Container visible={startDialog}>
        <Dialog.Title>Enter your class</Dialog.Title>
        <Dialog.Description>
          Write the lesson name
        </Dialog.Description>
        <Dialog.Input onChangeText={text => _class = text} />
        <Dialog.Button label="Cancel" onPress={() => setstartDialog(false)} />
        <Dialog.Button label="Add" onPress={() => { onClickHandler(_class); setstartDialog(false); _class = ''; }} />
      </Dialog.Container> */}
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
