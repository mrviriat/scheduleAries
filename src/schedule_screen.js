import React, { useState, useEffect, useCallback, forwardRef, useImperativeHandle, useRef } from 'react';
import { Pressable, StyleSheet, Platform, StatusBar, Text, View, FlatList, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFonts, Inter_400Regular } from '@expo-google-fonts/inter';
import { eachWeekOfInterval, eachDayOfInterval, addDays, format } from 'date-fns';
import * as SplashScreen from 'expo-splash-screen';
import { responsiveHeight, responsiveWidth, responsiveFontSize } from "react-native-responsive-dimensions";
import getDay from 'date-fns/getDay';
import isEqual from 'date-fns/isEqual';
import axios from 'axios';
import { FontAwesome } from '@expo/vector-icons';
import { SharedElement } from 'react-navigation-shared-element';
import { useNavigation } from '@react-navigation/native';
import { FlashList } from "@shopify/flash-list";
import { useDispatch, useSelector } from 'react-redux';
Text.defaultProps = Text.defaultProps || {}; //Disable dynamic type in IOS
Text.defaultProps.allowFontScaling = false;

export default function Schedule_screen({ }) {

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
    const selectedId = (getDay(new Date()) + 6) % 7;
    const dispatch = useDispatch();

    const OpenOffer = () => { //!открытие окна отправки отчёта
        dispatch({ type: "GET_SCHEDULE", payload: CH });
        dispatch({ type: "START_REPORT", payload: true });
    }

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
            const jsonValue = await AsyncStorage.getItem('@storage_Key');
            let oldCH = JSON.parse(jsonValue);
            setCH(oldCH);
            console.log('я прочитал последнее сохранённое расписание');
            return oldCH;
        } catch (e) {
            console.log(`${e} - ошибка чтения последнего сохранённого расписания в getData (function Schedule_screen)`);
        }
    };

    const createEmpty = () => {
        let empty = [];
        for (let i = 0; i < 7; i++) {
            let changeble = {
                day: date[i],
                lessons: [],
                ID: `selID-${i}.`,
            }
            empty = [...empty, changeble]
        }
        return empty;
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

    const weekForNewUser = async (userLogin) => { //обновление недели для новго юзера
        console.log('начинаю обновлять всю неделю для новго юзера');
        let oldCH = createEmpty();

        let { data: { days } } = await axios.get(`http://api.grsu.by/1.x/app1/getGroupSchedule?groupId=${userLogin.k_sgryp}&dateStart=${format(date[0], 'dd')}.${format(date[0], 'LL')}.${format(date[0], 'uuuu')}&dateEnd=${format(date[5], 'dd')}.${format(date[5], 'LL')}.${format(date[5], 'uuuu')}&lang=ru_RU`);

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
            const index = oldCH.findIndex((item) => `${format(item.day, 'uuuu')}-${format(item.day, 'LL')}-${format(item.day, 'dd')}` == days[i].date);

            console.log(index); // 1

            let changeble = [];
            days[i].lessons = days[i].lessons.filter(lesson => lesson.title != "Физическая культура");

            for (let j = 0; j < days[i].lessons.length; j++) {
                changeble = [...changeble, {
                    name: days[i].lessons[j].title,
                    timeStart: days[i].lessons[j].timeStart,
                    timeEnd: days[i].lessons[j].timeEnd,
                    type: days[i].lessons[j].type,
                    students: JSON.parse(st),
                    id: `selID-${index}less-${j}`,
                }]
            }

            oldCH[index].lessons = changeble;
        }

        setCH(JSON.parse(JSON.stringify(oldCH)));
        storeData(oldCH);
        const jsonCurrentWeek = JSON.stringify(date);
        const jsonCurrentDay = JSON.stringify((getDay(new Date()) + 6) % 7);
        AsyncStorage.setItem('@lastWeek', jsonCurrentWeek);
        AsyncStorage.setItem('@lastDay', jsonCurrentDay);
        console.log('я сохранил lastWeek и lastDay асинхронно');
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
            const index = oldCH.findIndex((item) => `${format(item.day, 'uuuu')}-${format(item.day, 'LL')}-${format(item.day, 'dd')}` == days[i].date);

            console.log(index); // 1

            let changeble = [];
            days[i].lessons = days[i].lessons.filter(lesson => lesson.title != "Физическая культура");

            for (let j = 0; j < days[i].lessons.length; j++) {
                changeble = [...changeble, {
                    name: days[i].lessons[j].title,
                    timeStart: days[i].lessons[j].timeStart,
                    timeEnd: days[i].lessons[j].timeEnd,
                    type: days[i].lessons[j].type,
                    students: JSON.parse(st),
                    id: `selID-${index}less-${j}`,
                }]
            }

            oldCH[index].lessons = changeble;
        }

        setCH(JSON.parse(JSON.stringify(oldCH)));
        storeData(oldCH);
        const jsonCurrentWeek = JSON.stringify(date);
        const jsonCurrentDay = JSON.stringify(selectedId);
        AsyncStorage.setItem('@lastWeek', jsonCurrentWeek);
        AsyncStorage.setItem('@lastDay', jsonCurrentDay);
        console.log('я сохранил lastWeek и lastDay асинхронно');
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
                    id: `selID-${selectedId}less-${i}`,
                }]
            }

            oldCH[selectedId].lessons = changeble;
        }
        else {
            console.log("Сегодня выходной");
        }

        setCH(oldCH);
        storeData(oldCH);

        try {
            const jsonSelectedId = JSON.stringify(selectedId);
            AsyncStorage.setItem('@lastDay', jsonSelectedId);
            console.log('я сохранил lastDay асинхронно');
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
                            if (lastDay == selectedId) {
                                console.log('захожу в getUserInfo');
                                await getUserDay(InUser, selectedId);
                                console.log('я обновил сегодняшний день');
                            }
                            else {
                                console.log('Я уже обновлял сегодняшний день');
                                let copy = await getData();
                                await storeData(copy);
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
                setCH(createEmpty()); // создаю пустой шабблон
            }
        } catch (e) {
            console.log(`${e} - (ошибка чтения InUser)`)
        }
    };

    const changePresents = (returnedList, selectedDay, selectedLesson) => {
        console.log(`selectedDay: ${selectedDay}; selectedLesson: ${selectedLesson}`);
        let changeble = CH.slice();
        changeble[selectedDay].lessons[selectedLesson].students = returnedList;
        setCH(changeble);
        storeData(changeble);
    }

    useEffect(() => {
        async function prepare() {
            try {
                await updateSchedule();
                // console.log(generateRandomString(25));
                // console.log(generateRandomString(25));
                // console.log(generateRandomString(25));
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

    return (
        <View style={styles.AndroidSafeArea} onLayout={onLayoutRootView}>
            <View style={[styles.tab_elements, { flex: 1 }]}>
                <Pressable style={styles.element_of_tab} onPress={OpenOffer}>
                    <FontAwesome name="pencil-square-o" size={responsiveHeight(3.9)} color="#007AFF" />
                </Pressable>
                <Pressable style={styles.element_of_tab} onPress={() => navigation.navigate("RegisterScreen", { getUser: async (userLogin) => await weekForNewUser(userLogin) })}>
                    <FontAwesome name="check-square-o" size={responsiveHeight(3.9)} color="#007AFF" />
                </Pressable>
            </View>
            <View style={{ backgroundColor: '#f2f2f2', flex: 13 }} >
                <FlashList
                    data={CH}
                    ref={flatListRef}
                    keyExtractor={(item) => item.ID}
                    showsHorizontalScrollIndicator={false}
                    pagingEnabled
                    horizontal
                    estimatedItemSize={width}
                    renderItem={({ item, index }) => {
                        let selectedDay = index;
                        return (
                            <View style={{ height: '100%', width: width, alignItems: 'center' }}>
                                <FlatList
                                    data={item.lessons}
                                    keyExtractor={(item) => item.id}
                                    showsVerticalScrollIndicator={false}
                                    renderItem={({ item, index }) => (
                                        <SharedElement id={`item.${item.id}`}>
                                            <Pressable style={{ marginTop: index == 0 ? responsiveHeight(6.5) : 0, marginBottom: responsiveHeight(1.5), width: responsiveWidth(90), backgroundColor: '#D9D9D9', borderRadius: 15, flexDirection: 'row' }}
                                                onPress={() => {
                                                    navigation.push('Detail', { item, selectedDay, index, changePresents })
                                                }}
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
                        );
                    }}
                />
            </View>
        </View >
    );
};

const styles = StyleSheet.create({
    AndroidSafeArea: {
        backgroundColor: '#fff',
        flex: 1,
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : responsiveHeight(5.4)
    },
    tab_elements: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
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
