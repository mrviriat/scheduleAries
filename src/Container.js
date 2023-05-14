import React, { useState, useEffect, useCallback } from 'react';
import { TransitionPresets } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native'
import { createSharedElementStackNavigator } from 'react-navigation-shared-element';
import MainNavigator from './MainNavigator';
import DetailScreen from './DetailScreen';
import RegisterScreen from './RegisterScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { eachWeekOfInterval, eachDayOfInterval, addDays, format } from 'date-fns';
import * as SplashScreen from 'expo-splash-screen';
import getDay from 'date-fns/getDay';
import isEqual from 'date-fns/isEqual';
import axios from 'axios';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import Feather from '@expo/vector-icons/Feather';
import { useDispatch, useSelector } from 'react-redux';
import * as Font from 'expo-font';

const RootStack = createSharedElementStackNavigator();

export default function Container() {

    const [appIsReady, setAppIsReady] = useState(false);
    const dispatch = useDispatch();

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
        }
    };

    //!ОТСЮДА НАЧАЛ ВСТАВЛЯТЬ ФУНКЦИИ

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

    const storeData = async (value) => {
        try {
            const jsonValue = JSON.stringify(value);
            await AsyncStorage.setItem('@storage_Key', jsonValue);
            console.log('я сохранил всё расписание');
        } catch (e) {
            console.log('ошибка сохранения в storeData (function Schedule_screen)')
        }
    };

    const getData = async () => {
        try {
            const jsonValue = await AsyncStorage.getItem('@storage_Key');
            let oldCH = JSON.parse(jsonValue);
            console.log('я прочитал последнее сохранённое расписание');
            return oldCH;
        } catch (e) {
            console.log(`${e} - ошибка чтения последнего сохранённого расписания в getData (function Schedule_screen)`);
        }
    };

    const generateRandomString = (length) => {
        const characters =
            '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%&()_+|}{[]:?></-=';
        let result = '';
        const charactersLength = characters.length;

        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }

        return result;
    }

    const createEmpty = () => {
        let empty = [];
        for (let i = 0; i < 7; i++) {
            let changeble = {
                day: date[i],
                lessons: [],
                ID: generateRandomString(15),
            }
            empty = [...empty, changeble]
        }
        return empty;
    };

    const getUserWeek = async (userLogin, selectedId) => { //обновление недели
        let oldCH = createEmpty();

        let { data: { days } } = await axios.get(`http://api.grsu.by/1.x/app1/getStudent?login=${userLogin}&lang=ru_RU`)
            .then(function (response) {
                return axios.get(`http://api.grsu.by/1.x/app1/getGroupSchedule?groupId=${response.data.k_sgryp}&dateStart=${format(date[0], 'dd')}.${format(date[0], 'LL')}.${format(date[0], 'uuuu')}&dateEnd=${format(date[5], 'dd')}.${format(date[5], 'LL')}.${format(date[5], 'uuuu')}&lang=ru_RU`);
            });

        let st = [];
        try {
            const jsonValue = await AsyncStorage.getItem('@stu')
            if (jsonValue) {
                st = jsonValue;
                console.log('я прочитал студентов для обновления недели');
            }
        } catch (e) {
            console.log(`${e} - (ошибка чтения @stu)`)
        }

        for (let i = 0; i < days.length; i++) {

            const index = oldCH.findIndex((item) =>
                `${format(item.day, 'uuuu')}-${format(item.day, 'LL')}-${format(item.day, 'dd')}`
                ==
                days[i].date
            );
            let changeble = [];
            days[i].lessons = days[i].lessons.filter(lesson => lesson.title != "Физическая культура");

            for (let j = 0; j < days[i].lessons.length; j++) {
                changeble = [...changeble, {
                    name: days[i].lessons[j].title,
                    timeStart: days[i].lessons[j].timeStart,
                    timeEnd: days[i].lessons[j].timeEnd,
                    type: days[i].lessons[j].type,
                    students: JSON.parse(st),
                    id: generateRandomString(15),
                }]
            }
            oldCH[index].lessons = changeble;
        }

        dispatch({ type: "GET_SCHEDULE", payload: oldCH });
        await storeData(oldCH);
        const jsonCurrentWeek = JSON.stringify(date);
        const jsonCurrentDay = JSON.stringify(selectedId);
        await AsyncStorage.setItem('@lastWeek', jsonCurrentWeek);
        await AsyncStorage.setItem('@lastDay', jsonCurrentDay);
        console.log('я сохранил lastWeek и lastDay');
    };

    const getUserDay = async (userLogin, selectedId) => { //обновление одного дня
        let oldCH = await getData();

        let { data: { days } } = await axios.get(`http://api.grsu.by/1.x/app1/getStudent?login=${userLogin}&lang=ru_RU`)
            .then(function (response) {
                return axios.get(`http://api.grsu.by/1.x/app1/getGroupSchedule?groupId=${response.data.k_sgryp}&dateStart=${format(date[0], 'dd')}.${format(date[0], 'LL')}.${format(date[0], 'uuuu')}&dateEnd=${format(date[5], 'dd')}.${format(date[5], 'LL')}.${format(date[5], 'uuuu')}&lang=ru_RU`);
            });

        let st = [];
        try {
            const jsonValue = await AsyncStorage.getItem('@stu')
            if (jsonValue != null) {
                st = jsonValue;
                console.log('я прочитал студентов для обновления одного дня');
            }
        } catch (e) {
            console.log('ошибка чтения')
        }

        const index = days.findIndex((item) => item.date == `${format(new Date(oldCH[selectedId].day), 'uuuu')}-${format(new Date(oldCH[selectedId].day), 'LL')}-${format(new Date(oldCH[selectedId].day), 'dd')}`);

        if (days[index]) {

            days[index].lessons = days[index].lessons.filter(lesson => lesson.title != "Физическая культура");
            let changeble = [];

            for (let i = 0; i < days[index].lessons.length; i++) {
                changeble = [...changeble, {
                    name: days[index].lessons[i].title,
                    timeStart: days[index].lessons[i].timeStart,
                    timeEnd: days[index].lessons[i].timeEnd,
                    type: days[index].lessons[i].type,
                    students: JSON.parse(st),
                    id: generateRandomString(15),
                }]
            }

            oldCH[selectedId].lessons = changeble;
        }
        else {
            console.log("Сегодня выходной");
        }

        dispatch({ type: "GET_SCHEDULE", payload: oldCH });
        await storeData(oldCH);

        try {
            const jsonSelectedId = JSON.stringify(selectedId);
            await AsyncStorage.setItem('@lastDay', jsonSelectedId);
            console.log('я сохранил lastDay');
        } catch (e) {
            console.log(`${e} - (ошибка сохранения lastDay)`);
        }
    };

    const updateSchedule = async () => {
        try {
            const jsonUser = await AsyncStorage.getItem('@InUser');
            console.log('я прочитал InUser');
            if (jsonUser) {
                let selectedId = (getDay(new Date()) + 6) % 7; //выбранный день
                let InUser = JSON.parse(jsonUser);
                try {
                    const jsonValue = await AsyncStorage.getItem('@lastWeek');
                    console.log('я прочитал lastWeek');
                    if (!isEqual(new Date(JSON.parse(jsonValue)[0]), date[0])) {
                        await getUserWeek(InUser, selectedId);
                        console.log('я обновил всю неделю');
                    } else {
                        console.log('Я уже обновлял эту неделю');
                        try {
                            const jsonDay = await AsyncStorage.getItem('@lastDay');
                            let lastDay = JSON.parse(jsonDay);
                            console.log(`lastDay: ${lastDay}; selectedId: ${selectedId}`);
                            if (lastDay != selectedId) {
                                await getUserDay(InUser, selectedId);
                                console.log('я обновил сегодняшний день');
                            }
                            else {
                                console.log('Я уже обновлял сегодняшний день');
                                let copy = await getData();
                                dispatch({ type: "GET_SCHEDULE", payload: copy });
                            }
                        } catch (e) {
                            console.log(`${e} - (ошибка чтения lastDay)`);
                        }
                    }
                } catch (e) {
                    console.log('ошибка чтения lastWeek')
                }
            } else {
                console.log("юзер не вошёл");
                let empty = createEmpty();
                dispatch({ type: "GET_SCHEDULE", payload: empty }); //создаю постой шаблон
            }
        } catch (e) {
            console.log(`${e} - (ошибка чтения InUser)`)
        }
    };

    const cacheFonts = (fonts) => {
        return fonts.map(font => Font.loadAsync(font));
    };

    useEffect(() => {
        async function prepare() {
            try {
                const fontAssets = cacheFonts([
                    FontAwesome5.font,
                    FontAwesome.font,
                    Feather.font
                ]);
                await Promise.all([...fontAssets]);
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
            dispatch({ type: "START_SRCOOL" });
        }
    }, [appIsReady]);

    if (!appIsReady) {
        return null;
    };

    return (
        <NavigationContainer onReady={onLayoutRootView}>
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
                    sharedElements={(route) => {
                        const { item } = route.params;
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
    );
};

