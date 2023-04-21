import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, FlatList, TextInput, Animated, Text, Platform, StatusBar, KeyboardAvoidingView, Pressable, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native'
import { TransitionPresets, createStackNavigator } from '@react-navigation/stack';
import { responsiveHeight, responsiveWidth, responsiveFontSize } from "react-native-responsive-dimensions";
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { LogBox } from 'react-native';
import {
  SharedElement,
  createSharedElementStackNavigator,
} from 'react-navigation-shared-element';
import { useFonts, Inter_400Regular } from '@expo-google-fonts/inter';
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state.',
]);
// ИКОНКИ
import { AntDesign } from '@expo/vector-icons';
import { FontAwesome5 } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import StudentsModal from './studentsModal';
export default function DetailScreen({ route }) {

  let [fontsLoaded] = useFonts({
    Inter_400Regular,
  });


  const opacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 200,
      delay: 500,
      useNativeDriver: true,
    }).start();
  }, []);


  const navigation = useNavigation();
  const { item, item: { students }, index, css } = route.params;


  const [studentsList, setStudents] = useState(students);
  const [Item, setItem] = useState({ name: "", isHere: true, desc: "" });
  const [Index, setIndex] = useState(0);


  const [visible, setVisible] = useState(false);


  const [scrollEnabled, setScrollEnabled] = useState(true);
  const flatListRef = useRef(0);
  const handleStopScrolling = () => {
    flatListRef.current.scrollToOffset({ animated: true, offset: currentOffset });
  };
  var currentOffset = 0;
  const handleScroll = (event) => {
    currentOffset = event.nativeEvent.contentOffset.y;
    // console.log('Current offset:', currentOffset);
  };


  const deleteStudentFromLesson = (bool, studentId) => {
    let changeble = studentsList.slice();
    changeble[studentId].isHere = bool;
    setStudents(changeble);
  };

  const SetDescriptionForStudent = (text, studentId) => {
    let changeble = studentsList.slice();
    changeble[studentId].desc = text;
    console.log(text);
    setStudents(changeble);
  };
  // console.log(studentsList);
  // console.log(students);
  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      <SharedElement id={`item.${item.id}`}>
        <Pressable style={{ width: "90%", marginTop: 40, backgroundColor: '#D9D9D9', borderRadius: 10, flexDirection: 'row' }}
          onPress={() => { handleStopScrolling(); css(studentsList); navigation.goBack(); }}
          >
          <View style={{ flex: 3, alignItems: 'center', justifyContent: 'space-between', paddingTop: responsiveHeight(2.3696682), paddingBottom: responsiveHeight(2.3696682) }}>
            <Text style={{ fontFamily: 'Inter_400Regular', fontSize: responsiveFontSize(2.67) }}>{item.timeStart}</Text>
            <Text style={{ fontFamily: 'Inter_400Regular', fontSize: responsiveFontSize(2.67) }}>{item.timeEnd}</Text>
          </View>
          <View style={{ flex: 8 }}>
            <Text style={{ marginTop: responsiveHeight(1.1848341), marginLeft: responsiveWidth(1.25), marginRight: responsiveWidth(1.25), fontFamily: 'Inter_400Regular', fontSize: responsiveFontSize(2.67) }}>{item.name}</Text>
            <Text style={{ marginTop: responsiveHeight(2.962085), marginLeft: responsiveWidth(1.25), fontFamily: 'Inter_400Regular', fontSize: responsiveFontSize(2.1), color: '#656565' }}>*{item.type}</Text>
            <Text style={{ marginBottom: responsiveHeight(1.77725118), marginLeft: responsiveWidth(1.25), fontFamily: 'Inter_400Regular', fontSize: responsiveFontSize(2.1), color: '#656565' }}>На занятии: {item.students.filter(x => x.isHere == true).length}{"\n"}Отсутствует: {item.students.filter(x => x.isHere == false).length}</Text>
          </View>
        </Pressable>
      </SharedElement>
      <Animated.FlatList
        style={{ marginTop: responsiveHeight(2), opacity }}
        data={studentsList}
        ref={flatListRef}
        onScroll={handleScroll}
        scrollEnabled={scrollEnabled}
        keyExtractor={(item, index) => item.name + index.toString()}
        showsVerticalScrollIndicator={false}

        renderItem={({ item, index }) =>
          <View style={[styles.list,
          {
            marginTop: index == 0 ? 10  : 0,
            marginBottom: index == studentsList.length - 1 ? 25 : 0,
            borderBottomWidth: index != studentsList.length - 1 ? responsiveHeight(0.1185) : 0,
            borderColor: 'black',
            borderBottomLeftRadius: index == studentsList.length - 1 ? responsiveHeight(0.5924) : 0,
            borderBottomRightRadius: index == studentsList.length - 1 ? responsiveHeight(0.5924) : 0,
            borderTopLeftRadius: index == 0 ? responsiveHeight(0.5924) : 0,
            borderTopRightRadius: index == 0 ? responsiveHeight(0.5924) : 0
          }
          ]}>
            <Pressable onPress={() => { !item.isHere & SetDescriptionForStudent("", index); deleteStudentFromLesson(!item.isHere, index) }} style={{ flexDirection: 'row', opacity: !item.isHere ? 0.4 : 1, width: responsiveWidth(90), height: responsiveHeight(7.109), alignItems: 'center' }}
            // onPress={() => { setItem(item); setIndex(index); setVisible(true) }}
            >
              <Text style={styles.text}>{index + 1}. </Text>
              <Text style={styles.text}>{item.name} </Text>
            </Pressable >
            {!item.isHere &&
              <Pressable onPress={() => { setItem(item); setIndex(index); setVisible(true) }} style={{ position: 'absolute', right: responsiveWidth(5.55) }}>
                <MaterialCommunityIcons name="note-edit-outline" size={responsiveHeight(3.9)} color={!item.desc ? "black" : "green"} />
              </Pressable>
            }
          </View>
        }
      />
      <StudentsModal
        visible={visible}
        options={{ type: 'slide', from: 'bottom' }}
        duration={500}
        onClose={() => setVisible(false)}
        item={Item}
        index={Index}
        SetDescriptionForStudent={SetDescriptionForStudent}
      />
    </View>
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
  text: {
    fontFamily: 'Inter_400Regular',
    fontSize: responsiveFontSize(2.67),
  },
  list: {
    width: responsiveWidth(90), //360
    height: responsiveHeight(7.109), //60
    backgroundColor: '#D9D9D9',
    alignItems: 'center',
    flexDirection: 'row',
    paddingLeft: responsiveWidth(5.55), //20
  }
})