import React, { useState, useEffect, useCallback, forwardRef, useImperativeHandle, useRef, memo } from 'react';
import { Pressable, StyleSheet, Platform, StatusBar, Text, View, FlatList, TouchableOpacity, Alert, Animated, SafeAreaView, Dimensions, Easing } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFonts, Inter_400Regular } from '@expo-google-fonts/inter';
import { eachWeekOfInterval, eachDayOfInterval, addDays, format } from 'date-fns';
import * as SplashScreen from 'expo-splash-screen';
import { responsiveHeight, responsiveWidth, responsiveFontSize } from "react-native-responsive-dimensions";
import getDay from 'date-fns/getDay';
import isEqual from 'date-fns/isEqual';
import axios from 'axios';
import 'react-native-get-random-values'
import { nanoid } from 'nanoid'
import { FontAwesome } from '@expo/vector-icons';
import { Entypo } from '@expo/vector-icons';
import { SharedElement } from 'react-navigation-shared-element';
import { useNavigation } from '@react-navigation/native';
import FlashList from '@shopify/flash-list';
import { customAlphabet } from 'nanoid/non-secure';
import { v4 as uuidv4 } from 'uuid';

Text.defaultProps = Text.defaultProps || {}; //Disable dynamic type in IOS
Text.defaultProps.allowFontScaling = false;


function Schedule_screen({ OpenOffer, setStudents, setLesson, OpenModal, changeE, setSchedule_data }, ref) {

    const navigation = useNavigation();


    const flatListRef = useRef(null);


    let [fontsLoaded] = useFonts({
        Inter_400Regular,
    });

    let week = eachWeekOfInterval({
        start: new Date(),
        end: new Date(),
    },
        {
            weekStartsOn: 1,
        }
    );

    let date = eachDayOfInterval({
        start: week[0],
        end: addDays(week[0], 6)
    });

    const [appIsReady, setAppIsReady] = useState(false);
    const [CH, setCH] = useState([]);
    const [selectedId, setSelectedId] = useState((getDay(new Date()) + 6) % 7);
    // const [Delete, setDelete] = useState(false);

    const deleteStudentFromLesson = (bool, lessonId, studentId) => {
        let changeble = CH.slice();
        console.log(`ID урока: ${lessonId + 1}; ID студента: ${studentId + 1}; присутствие на паре - "${bool}"`)
        changeble[selectedId].lessons[lessonId].students[studentId].isHere = bool;
        changeE();
        setCH(changeble);
        storeData(changeble);
    };

    const SetDescriptionForStudent = (text, lessonId, studentId) => {
        let changeble = CH.slice();
        console.log(`ID урока: ${lessonId + 1}; ID студента: ${studentId + 1} - "${text}"`)
        changeble[selectedId].lessons[lessonId].students[studentId].desc = text;
        changeE();
        setCH(changeble);
        storeData(changeble);
    };

    // const onClickHandler = async (name) => {
    //     let st = [];
    //     try {
    //         const jsonValue = await AsyncStorage.getItem('@stu')
    //         if (jsonValue != null) {
    //             st = JSON.parse(jsonValue);
    //             console.log('я прочитал список студентов в функции onClickHandler');
    //         }
    //     } catch (e) {
    //         console.log('ошибка чтения в функции onClickHandler')
    //     }
    //     let changeble = CH.slice();
    //     changeble[selectedId].lessons = [...changeble[selectedId].lessons, { name: name, students: st }];
    //     setCH(changeble);
    //     storeData(changeble);
    // };

    // useImperativeHandle(ref, () => ({ deleteStudentFromLesson, SetDescriptionForStudent, onClickHandler }));
    useImperativeHandle(ref, () => ({ deleteStudentFromLesson, SetDescriptionForStudent }));

    const storeData = async (value) => {
        try {
            const jsonValue = JSON.stringify(value)
            await AsyncStorage.setItem('@storage_Key', jsonValue)
            console.log('я сохранил всё расписание в storeData (function Schedule_screen)')
        } catch (e) {
            console.log('ошибка сохранения в storeData (function Schedule_screen)')
        }
    };

    const getData = async () => {
        try {
            const jsonValue = await AsyncStorage.getItem('@storage_Key')
            if (jsonValue != null) {
                let oldCH = JSON.parse(jsonValue);

                //тут я буду делать функцию которая должна произойти только один раз 

                try {
                    console.log("я тут")
                    const isFirstLaunch = await AsyncStorage.getItem('isFirst');
                    if (!isFirstLaunch) {
                        console.log("я теперь тут")
                        for (let i = 0; i < 7; i++) { // выведет 0, затем 1, затем 2
                            oldCH[i].ID = nanoid();
                            for (let j = 0; j < oldCH[i].lessons.length; j++) { // выведет 0, затем 1, затем 2
                                oldCH[i].lessons[j].id = nanoid();
                            }
                        }

                        // вызов функции, которую нужно запустить только один раз
                        await AsyncStorage.setItem('isFirst', 'true');
                        storeData(oldCH)
                        console.log("сохранил действие, которое больше выполняться не будет")
                    }
                } catch (error) {
                    console.error(error);
                }

                //закончил этот блок


                setCH(oldCH)
            } else {
                setCH(
                    date.map(item => ({
                        day: item,
                        lessons: []
                    }))
                );
            }
            console.log('я прочитал последнее сохранённое расписание');
        } catch (e) {
            console.log('ошибка чтения последнего сохранённого расписания в getData (function Schedule_screen)');
        }
    };

    // НЕИСПОЛЬЗУЕМАЯ ФУНКЦИЯ ДЛЯ ЗАПОЛНЕНИЯ ПАР // IOS
    // const onButtonPress = () => {
    //     Alert.prompt("Enter your class", "Write the lesson name",
    //         [
    //             {
    //                 text: "Cancel",
    //                 style: "cancel"
    //             },
    //             {
    //                 text: "OK",
    //                 onPress: className => onClickHandler(className)
    //             }
    //         ]
    //     )
    // };

    // const DeleteLesson = (index) => {
    //     let changeble = CH.slice();
    //     changeble[selectedId].lessons.splice(index, 1);
    //     setCH(changeble);
    //     storeData(changeble);
    //     if (changeble[selectedId].lessons.length == 0) {
    //         setDelete(!Delete)
    //     }
    // };

    const handleVisibleModal = (students, index) => {
        setStudents(students);
        setLesson(index)
        OpenModal();
    };

    const updateSchedule = async () => {
        try {
            const jsonValue = await AsyncStorage.getItem('@InUser');
            console.log('я прочитал InUser');
            if (jsonValue != null) {

                let selectedId = (getDay(new Date()) + 6) % 7;
                let InUser = JSON.parse(jsonValue);
                try {
                    const jsonValue = await AsyncStorage.getItem('@lastWeek');
                    console.log('я прочитал lastWeek');
                    if (!isEqual(new Date(JSON.parse(jsonValue)[0]), date[0])) {
                        await getUserWeek(InUser);
                        console.log('я обновил всю неделю');
                        try {
                            const jsonValue = JSON.stringify(date);
                            const jsonCurrentDay = JSON.stringify(selectedId);
                            AsyncStorage.setItem('@lastWeek', jsonValue);
                            AsyncStorage.setItem('@lastDay', jsonCurrentDay);
                            console.log('я сохранил lastWeek и lastDay асинхронно');
                        } catch (e) {
                            console.log('ошибка сохранения lastWeek');
                        }
                    } else {
                        console.log('Я уже обновлял эту неделю');

                        try {
                            const jsonValue = await AsyncStorage.getItem('@lastDay')
                            console.log('я прочитал lastDay: ' + JSON.parse(jsonValue));
                            console.log("selectedId : " + selectedId)
                            if (JSON.parse(jsonValue) != selectedId) {
                                console.log('захожу в getUserInfo');
                                await getUserInfo(InUser, selectedId);
                                console.log('я обновил сегодняшний день');

                                try {
                                    const jsonValue = JSON.stringify(selectedId)
                                    AsyncStorage.setItem('@lastDay', jsonValue)
                                    console.log('я сохранил lastDay асинхронно')
                                } catch (e) {
                                    console.log('ошибка сохранения lastDay')
                                }
                            }
                            else {
                                console.log('Я уже обновлял сегодняшний день')
                                await getData();
                            }
                        } catch (e) {
                            console.log('ошибка чтения lastDay вот тут')

                        }
                    }
                } catch (e) {
                    console.log('ошибка чтения lastWeek')
                }
            } else {
                console.log("юзер не вошёл");
                await getData();
            }
        } catch (e) {
            console.log('ошибка чтения InUser')
        }
    };

    // const Item = ({ title, onPress, backgroundColor, index }) => (
    //     <Pressable onPress={onPress} style={[{ backgroundColor }, { width: responsiveWidth(25), height: responsiveHeight(6, 15), borderRightWidth: index == 6 ? 0 : 1, alignItems: 'center', justifyContent: 'center' }]}>
    //         <Text style={{ fontFamily: 'Inter_400Regular', fontSize: responsiveFontSize(2.1) }}>{title.getDate()}.{format(title, 'LL')} {format(title, 'EEEEEE')}</Text>
    //     </Pressable>
    // );
    // const renderItem = ({ item, index }) => {
    //     const backgroundColor = index === selectedId ? '#9F9F9F' : '#D9D9D9';
    //     return (
    //         <Item
    //             title={item}
    //             onPress={() => setSelectedId(index)}
    //             backgroundColor={backgroundColor}
    //             index={index}
    //         />
    //     );
    // };

    // const Footer_Component = () => {
    //     return (
    //         <Pressable style={styles.Footer_Component} onPress={() => Platform.OS === 'ios' ? onButtonPress() : setstartDialog(true)} >
    //             <AntDesign name="plus" size={responsiveHeight(3.9)} color="#007AFF" />
    //         </Pressable>
    //     );
    // };

    //responsiveHeight(3.9) - 30

    // const send_data_to_report = () => {
    //     for (let i = 0; i < 7; i++) { // выведет 0, затем 1, затем 2
    //         CH[i].day = date[i];
    //     }
    // };

    const weekForNewUser = async (userLogin) => { //обновление недели для новго юзера
        console.log('начинаю обновлять всю неделю для новго юзера');
        let oldCH = [];
        try {
            await AsyncStorage.removeItem('@storage_Key');
            console.log('Значение успешно удалено из @storage_Key');
            const jsonValue = await AsyncStorage.getItem('@storage_Key')
            if (jsonValue != null) {
                oldCH = JSON.parse(jsonValue);

                //тут я буду делать функцию которая должна произойти только один раз 

                try {
                    console.log("я проверяю уникальную ункцию")
                    await AsyncStorage.removeItem("isFirst");
                    console.log('Значение успешно удалено из AsyncStorage');
                    const isFirstLaunch = await AsyncStorage.getItem('isFirst');
                    if (!isFirstLaunch) {
                        console.log("я выполняю уникальную ункцию")
                        for (let i = 0; i < 7; i++) {
                            let a;
                            try {
                                a = nanoid();
                            } catch
                            {
                                a = `selID-${i}.`;
                            }

                            oldCH[i].ID = a;
                            if (i != 6) {
                                for (let j = 0; j < oldCH[i].lessons.length; j++) { // выведет 0, затем 1, затем 2
                                    try {
                                        oldCH[i].lessons[j].id = nanoid();
                                    } catch {
                                        oldCH[i].lessons[j].id = `selID-${i}less-${j}`;
                                    }
                                }


                            }
                        }
                        console.log("я теперь тут уже")
                        // вызов функции, которую нужно запустить только один раз
                        await AsyncStorage.setItem('isFirst', 'true');
                        storeData(oldCH)
                        console.log("сохранил действие, которое больше выполняться не будет")
                    }
                } catch (error) {
                    console.log(error);
                }

                //закончил этот блок

            }
            else {
                console.log("буду делать новый шаблон")
                for (let i = 0; i < 7; i++) { // выведет 0, затем 1, затем 2
                    try {
                        oldCH = [...oldCH, {
                            day: date[i],
                            lessons: [],
                            ID: nanoid()
                        }];
                    } catch
                    {
                        oldCH = [...oldCH, {
                            day: date[i],
                            lessons: [],
                            ID: `selID-${i}.`
                        }];
                    }

                }
                console.log("я справился")
            };
            console.log('я прочитал старое расписание для обновления недели')
        } catch (e) {
            console.log('ошибка чтения')
        }

        let { data: { days } } = await axios.get(`http://api.grsu.by/1.x/app1/getGroupSchedule?groupId=${userLogin.k_sgryp}&dateStart=${format(date[0], 'dd')}.${format(date[0], 'LL')}.${format(date[0], 'uuuu')}&dateEnd=${format(date[5], 'dd')}.${format(date[5], 'LL')}.${format(date[5], 'uuuu')}&lang=ru_RU`);
        console.log("я тут 0");
        let st = [];
        try {
            const jsonValue = await AsyncStorage.getItem('@stu')
            if (jsonValue != null) {
                st = JSON.parse(jsonValue);
                console.log('я прочитал студентов для обновления недели');

            }
        } catch (e) {
            console.log('ошибка чтения')
        }


        for (let index = 0; index < 6; index++) {

            console.log("я вошёл в changeble");
            days[index].lessons = days[index].lessons.filter(lesson => lesson.title != "Физическая культура");
            let changeble = [];

            for (let i = 0; i < days[index].lessons.length; i++) {
                let a;
                try {
                    a = nanoid();
                } catch
                {
                    a = `selID-${index}less-${i}`;
                }
                // console.log(a)
                changeble = [...changeble, {
                    name: days[index].lessons[i].title,
                    timeStart: days[index].lessons[i].timeStart,
                    timeEnd: days[index].lessons[i].timeEnd,
                    type: days[index].lessons[i].type,
                    students: st,
                    id: a,
                }]
                console.log(`сделал ${i + 1} пару`)
            }

            console.log("я вышел из changeble");
            oldCH[index].lessons = changeble;
            console.log(`сделал ${index + 1} день`)
        }


        for (let i = 0; i < 7; i++) { // выведет 0, затем 1, затем 2
            let a;
            try {
                a = nanoid();
            } catch
            {
                a = `selID-${i}.`;
            }

            oldCH[i].day = date[i];
            oldCH[i].ID = a;
        }

        setCH(JSON.parse(JSON.stringify(oldCH)));
        storeData(oldCH);
        const jsonCurrentWeek = JSON.stringify(date);
        const jsonCurrentDay = JSON.stringify((getDay(new Date()) + 6) % 7);
        AsyncStorage.setItem('@lastWeek', jsonCurrentWeek);
        AsyncStorage.setItem('@lastDay', jsonCurrentDay);
        console.log('я сохранил lastWeek и lastDay асинхронно');
    };

    const getUserWeek = async (userLogin) => { //обновление недели
        let oldCH = [];
        try {
            const jsonValue = await AsyncStorage.getItem('@storage_Key')
            if (jsonValue != null) {
                oldCH = JSON.parse(jsonValue);



                //тут я буду делать функцию которая должна произойти только один раз 

                try {
                    console.log("я проверяю уникальную ункцию")
                    const isFirstLaunch = await AsyncStorage.getItem('isFirst');
                    if (!isFirstLaunch) {
                        console.log("я выполняю уникальную ункцию")
                        for (let i = 0; i < 7; i++) {
                            let a;
                            try {
                                a = nanoid();
                            } catch
                            {
                                a = `selID-${i}.`;
                            }

                            oldCH[i].ID = a;
                            if (i != 6) {
                                for (let j = 0; j < oldCH[i].lessons.length; j++) { // выведет 0, затем 1, затем 2
                                    try {
                                        oldCH[i].lessons[j].id = nanoid();
                                    } catch {
                                        oldCH[i].lessons[j].id = `selID-${i}less-${j}`;
                                    }
                                }


                            }
                        }
                        console.log("я теперь тут уже")
                        // вызов функции, которую нужно запустить только один раз
                        await AsyncStorage.setItem('isFirst', 'true');
                        storeData(oldCH)
                        console.log("сохранил действие, которое больше выполняться не будет")
                    }
                } catch (error) {
                    console.log(error);
                }

                //закончил этот блок



            }
            else {
                for (let i = 0; i < 7; i++) { // выведет 0, затем 1, затем 2
                    try {
                        oldCH = [...oldCH, {
                            day: date[i],
                            lessons: [],
                            ID: nanoid()
                        }];
                    } catch
                    {
                        oldCH = [...oldCH, {
                            day: date[i],
                            lessons: [],
                            ID: `selID-${i}.`
                        }];
                    }

                }
            };
            console.log('я прочитал старое расписание для обновления недели');
        } catch (e) {
            console.log('ошибка чтения')
        }

        let { data: { days } } = await axios.get(`http://api.grsu.by/1.x/app1/getStudent?login=${userLogin}&lang=ru_RU`)
            .then(function (response) {
                return axios.get(`http://api.grsu.by/1.x/app1/getGroupSchedule?groupId=${response.data.k_sgryp}&dateStart=${format(date[0], 'dd')}.${format(date[0], 'LL')}.${format(date[0], 'uuuu')}&dateEnd=${format(date[5], 'dd')}.${format(date[5], 'LL')}.${format(date[5], 'uuuu')}&lang=ru_RU`);
            });
        let st = [];
        try {
            const jsonValue = await AsyncStorage.getItem('@stu')
            if (jsonValue != null) {
                st = JSON.parse(jsonValue);
                console.log('я прочитал студентов для обновления недели');
            }
        } catch (e) {
            console.log('ошибка чтения')
        }


        for (let index = 0; index < 6; index++) {

            console.log("я вошёл в changeble");
            days[index].lessons = days[index].lessons.filter(lesson => lesson.title != "Физическая культура");
            let changeble = [];

            for (let i = 0; i < days[index].lessons.length; i++) {
                let a;
                try {
                    a = nanoid();
                } catch
                {
                    a = `selID-${index}less-${i}`;
                }
                // console.log(a)
                changeble = [...changeble, {
                    name: days[index].lessons[i].title,
                    timeStart: days[index].lessons[i].timeStart,
                    timeEnd: days[index].lessons[i].timeEnd,
                    type: days[index].lessons[i].type,
                    students: st,
                    id: a,
                }]
                console.log(`сделал ${i + 1} пару`)
            }

            console.log("я вышел из changeble");
            oldCH[index].lessons = changeble;
            console.log(`сделал ${index + 1} день`)
        }

        // for (let index = 0; index < 6; index++) {
        //     let changeble = days[index].lessons.filter(lesson => lesson.title != "Физическая культура").map(lesson => (
        //         {
        //             name: lesson.title,
        //             timeStart: lesson.timeStart,
        //             timeEnd: lesson.timeEnd,
        //             type: lesson.type,
        //             students: st,
        //             id: nanoid()
        //         }
        //     ))
        //     oldCH[index].lessons = changeble;
        // }
        for (let i = 0; i < 7; i++) { // выведет 0, затем 1, затем 2
            let a;
            try {
                a = nanoid();
            } catch
            {
                a = `selID-${i}.`;
            }
            oldCH[i].day = date[i];
            oldCH[i].ID = a;
        }
        setCH(JSON.parse(JSON.stringify(oldCH)));
        storeData(oldCH);
    };

    const getUserInfo = async (userLogin, selectedId) => { //обновление одного дня
        let oldCH = [];
        try {
            const jsonValue = await AsyncStorage.getItem('@storage_Key')
            if (jsonValue != null) {
                oldCH = JSON.parse(jsonValue);


                //тут я буду делать функцию которая должна произойти только один раз 

                try {
                    console.log("я проверяю уникальную ункцию")
                    const isFirstLaunch = await AsyncStorage.getItem('isFirst');
                    if (!isFirstLaunch) {
                        console.log("я выполняю уникальную ункцию")
                        for (let i = 0; i < 7; i++) {
                            let a;
                            try {
                                a = nanoid();
                            } catch
                            {
                                a = `selID-${i}.`;
                            }

                            oldCH[i].ID = a;
                            if (i != 6) {
                                for (let j = 0; j < oldCH[i].lessons.length; j++) { // выведет 0, затем 1, затем 2
                                    try {
                                        oldCH[i].lessons[j].id = nanoid();
                                    } catch {
                                        oldCH[i].lessons[j].id = `selID-${i}less-${j}`;
                                    }
                                }


                            }
                        }
                        console.log("я теперь тут уже")
                        // вызов функции, которую нужно запустить только один раз
                        await AsyncStorage.setItem('isFirst', 'true');
                        storeData(oldCH)
                        console.log("сохранил действие, которое больше выполняться не будет")
                    }
                } catch (error) {
                    console.log(error);
                }

                //закончил этот блок



            }
            else {

                for (let i = 0; i < 7; i++) { // выведет 0, затем 1, затем 2
                    try {
                        oldCH = [...oldCH, {
                            day: date[i],
                            lessons: [],
                            ID: nanoid()
                        }];
                    } catch
                    {
                        oldCH = [...oldCH, {
                            day: date[i],
                            lessons: [],
                            ID: `selID-${i}.`
                        }];
                    }

                }
                // try {
                //     oldCH = date.map(item => ({
                //         day: item,
                //         lessons: [],
                //         ID: nanoid()
                //     }));
                // }
                // catch {
                //     oldCH = date.map(item => ({
                //         day: item,
                //         lessons: [],
                //         ID: uuidv4()
                //     }));
                // }
            }
            console.log('я прочитал старое расписание для обновления одного дня')
        } catch (e) {
            console.log('ошибка чтения')
        }
        let { data: { days } } = await axios.get(`http://api.grsu.by/1.x/app1/getStudent?login=${userLogin}&lang=ru_RU`)
            .then(function (response) {
                return axios.get(`http://api.grsu.by/1.x/app1/getGroupSchedule?groupId=${response.data.k_sgryp}&dateStart=${format(date[0], 'dd')}.${format(date[0], 'LL')}.${format(date[0], 'uuuu')}&dateEnd=${format(date[5], 'dd')}.${format(date[5], 'LL')}.${format(date[5], 'uuuu')}&lang=ru_RU`);
            });
        let st = [];
        try {
            const jsonValue = await AsyncStorage.getItem('@stu')
            if (jsonValue != null) {
                st = JSON.parse(jsonValue);
                console.log('я прочитал студентов для обновления одного дня');
            }
        } catch (e) {
            console.log('ошибка чтения')
        }
        if (days[selectedId]) {
            // console.log("я вошёл в changeble");
            // let changeble = days[selectedId].lessons.filter(lesson => lesson.title != "Физическая культура").map(lesson => (
            //     {
            //         name: lesson.title,
            //         timeStart: lesson.timeStart,
            //         timeEnd: lesson.timeEnd,
            //         type: lesson.type,
            //         students: st,
            //         id: nanoid()
            //     }

            // ))


            console.log("я вошёл в changeble");
            days[selectedId].lessons = days[selectedId].lessons.filter(lesson => lesson.title != "Физическая культура");
            let changeble = [];
            console.log(days[selectedId].lessons.length)
            for (let i = 0; i < days[selectedId].lessons.length; i++) {
                let a;
                try {
                    a = nanoid();
                } catch
                {
                    a = `selID-${selectedId}less-${i}`;
                }
                console.log(a)
                changeble = [...changeble, {
                    name: days[selectedId].lessons[i].title,
                    timeStart: days[selectedId].lessons[i].timeStart,
                    timeEnd: days[selectedId].lessons[i].timeEnd,
                    type: days[selectedId].lessons[i].type,
                    students: st,
                    id: a,
                }]
                console.log(`сделал ${i + 1} пару`)
            }

            console.log("я вышел из changeble");
            oldCH[selectedId].lessons = changeble;
            console.log("я изменил день");

            if (oldCH[selectedId].lessons != JSON.parse(JSON.stringify(changeble))) {
                oldCH[selectedId].lessons = JSON.parse(JSON.stringify(changeble));
                setCH(oldCH);
                storeData(oldCH);
            } else {
                setCH(oldCH);
                console.log("На сегодня уже загружено актуальное расписание - ничего не обновлял");
            };
        }
        else {
            setCH(oldCH);
        }

    };



    // const Lesson = memo(({ item, index }) => (
    //     <SharedElement id={`item.${item.id}`}>
    //         <Pressable style={{ marginTop: index == 0 ? responsiveHeight(6.5) : 0, marginBottom: responsiveHeight(1.5), width: responsiveWidth(90), backgroundColor: '#D9D9D9', borderRadius: 15, flexDirection: 'row' }}
    //             onPress={() => { less = index; navigation.navigate('Detail', { item, index, css }) }}
    //         >
    //             <View style={{ flex: 3, alignItems: 'center', justifyContent: 'space-between', paddingTop: responsiveHeight(2.3696682), paddingBottom: responsiveHeight(2.3696682) }}>
    //                 <Text style={{ fontFamily: 'Inter_400Regular', fontSize: responsiveFontSize(2.67) }}>{item.timeStart}</Text>
    //                 <Text style={{ fontFamily: 'Inter_400Regular', fontSize: responsiveFontSize(2.67) }}>{item.timeEnd}</Text>
    //             </View>
    //             <View style={{ flex: 8 }}>
    //                 <Text style={{ marginTop: responsiveHeight(1.1848341), marginLeft: responsiveWidth(1.25), marginRight: responsiveWidth(1.25), fontFamily: 'Inter_400Regular', fontSize: responsiveFontSize(2.67) }}>{item.name}</Text>
    //                 <Text style={{ marginTop: responsiveHeight(2.962085), marginLeft: responsiveWidth(1.25), fontFamily: 'Inter_400Regular', fontSize: responsiveFontSize(2.1), color: '#656565' }}>*{item.type}</Text>
    //                 <Text style={{ marginBottom: responsiveHeight(1.77725118), marginLeft: responsiveWidth(1.25), fontFamily: 'Inter_400Regular', fontSize: responsiveFontSize(2.1), color: '#656565' }}>На занятии: {item.students.filter(x => x.isHere == true).length}{"\n"}Отсутствует: {item.students.filter(x => x.isHere == false).length}</Text>
    //             </View>
    //         </Pressable>
    //     </SharedElement>
    // ));
    // const renderLesson = ({ item, index }) => {
    //     return (
    //         <Lesson item={item} index={index} />
    //     );
    // };


    // const ListItem = memo(({ item }) => {
    //     return (
    //         <View style={{ flex: 1, width: width, alignItems: 'center' }}>
    //             <FlatList
    //                 data={item.lessons}
    //                 keyExtractor={(item) => item.id}
    //                 showsVerticalScrollIndicator={false}
    //                 renderItem={renderLesson}
    //             />
    //             <View style={{ position: 'absolute', left: responsiveWidth(5), top: responsiveHeight(1), width: responsiveWidth(50), height: responsiveHeight(4), backgroundColor: 'white', borderRadius: responsiveWidth(2), justifyContent: 'center', paddingLeft: responsiveWidth(1) }}>
    //                 <Text style={{ fontFamily: 'Inter_400Regular', fontSize: responsiveFontSize(2.67) }}>{new Date(item.day).getDate()}.{format(new Date(item.day), 'LL')} {format(new Date(item.day), 'EEEE')}</Text>
    //             </View>
    //         </View>
    //     );
    // });




    useEffect(() => {
        async function prepare() {
            try {

                await updateSchedule();

            } catch (e) {
                console.warn(e);
            } finally {
                setAppIsReady(true);
            }
        }
        prepare();
    }, []);

    const onLayoutRootView = useCallback(async () => {
        if (appIsReady) {
            await SplashScreen.hideAsync();
            flatListRef.current.scrollToIndex({ index: selectedId, animated: true });
        }
    }, [appIsReady]);

    if (!appIsReady || !fontsLoaded) {
        return null;
    };


    const { height, width } = Dimensions.get('window');

    let less;
    const css = (returnedList) => {
        let changeble = CH.slice();
        changeble[selectedId].lessons[less].students = returnedList;
        setCH(changeble);
        storeData(changeble);
    }


    return (
        <SafeAreaView style={styles.AndroidSafeArea} onLayout={onLayoutRootView}>
            <View style={{ flex: 1, backgroundColor: '#fff' }}>
                <View style={styles.tab_elements}>
                    <Pressable style={styles.element_of_tab} onPress={() => { setSchedule_data(CH); OpenOffer(); }}>
                        <FontAwesome name="pencil-square-o" size={responsiveHeight(3.9)} color="#007AFF" />
                    </Pressable>

                    <Pressable style={styles.element_of_tab} onPress={() => navigation.navigate("Modal", { getUser: async (userLogin) => await weekForNewUser(userLogin) })}>
                        <FontAwesome name="check-square-o" size={responsiveHeight(3.9)} color="#007AFF" />
                    </Pressable>
                </View>
            </View>
            <View style={{ backgroundColor: '#f2f2f2', flex: 12 }} >
                <FlatList
                    data={CH}
                    ref={flatListRef}
                    keyExtractor={(item) => item.ID}
                    showsHorizontalScrollIndicator={false}
                    pagingEnabled
                    horizontal
                    onScroll={e => {
                        const x = e.nativeEvent.contentOffset.x;
                        setSelectedId((x / width).toFixed(0));
                    }}
                    // renderItem={({ item, index }) => {
                    //     return (
                    //         <View style={{ flex: 1, width: width, alignItems: 'center' }}>
                    //             <FlatList
                    //                 data={item.lessons}
                    //                 keyExtractor={(item) => item.id}
                    //                 showsVerticalScrollIndicator={false}
                    //                 renderItem={renderLesson}
                    //             />
                    //             <View style={{ position: 'absolute', left: responsiveWidth(5), top: responsiveHeight(1), width: responsiveWidth(50), height: responsiveHeight(4), backgroundColor: 'white', borderRadius: responsiveWidth(2), justifyContent: 'center', paddingLeft: responsiveWidth(1) }}>
                    //                 <Text style={{ fontFamily: 'Inter_400Regular', fontSize: responsiveFontSize(2.67) }}>{new Date(item.day).getDate()}.{format(new Date(item.day), 'LL')} {format(new Date(item.day), 'EEEE')}</Text>
                    //             </View>
                    //         </View>
                    //     )
                    // }}
                    // renderItem={({ item }) => <ListItem item={item} />}
                    renderItem={({ item, index }) => {
                        return (
                            <View style={{ flex: 1, width: width, alignItems: 'center' }}>
                                <FlatList
                                    data={item.lessons}
                                    keyExtractor={(item) => item.id}
                                    showsVerticalScrollIndicator={false}
                                    renderItem={({ item, index }) => (
                                        <SharedElement id={`item.${item.id}`}>
                                            <Pressable style={{ marginTop: index == 0 ? responsiveHeight(6.5) : 0, marginBottom: responsiveHeight(1.5), width: responsiveWidth(90), backgroundColor: '#D9D9D9', borderRadius: 15, flexDirection: 'row' }}
                                                onPress={() => { less = index; navigation.navigate('Detail', { item, index, css }) }}
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
                                    )}
                                />
                                <View style={{ position: 'absolute', left: responsiveWidth(5), top: responsiveHeight(1), width: responsiveWidth(50), height: responsiveHeight(4), backgroundColor: 'white', borderRadius: responsiveWidth(2), justifyContent: 'center', paddingLeft: responsiveWidth(1) }}>
                                    <Text style={{ fontFamily: 'Inter_400Regular', fontSize: responsiveFontSize(2.67) }}>{new Date(item.day).getDate()}.{format(new Date(item.day), 'LL')} {format(new Date(item.day), 'EEEE')}</Text>
                                </View>
                            </View>
                        )
                    }}
                />
            </View>
        </SafeAreaView >
    );
};

export default forwardRef(Schedule_screen);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: responsiveHeight(5),

    },
    AndroidSafeArea: {
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0
    },
    tab_elements: {
        flexDirection: 'row',
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingLeft: responsiveWidth(5),
        paddingRight: responsiveWidth(5)
    },
    element_of_tab: {
        alignItems: 'center',
        justifyContent: 'center'
    },
    Footer_Component: {
        marginTop: 15,
        marginBottom: 15,
        width: responsiveWidth(91, 79),
        height: responsiveHeight(13),
        backgroundColor: '#D9D9D9',
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center'
    }
});
