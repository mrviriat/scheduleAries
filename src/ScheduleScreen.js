import React, { useCallback, useRef } from 'react';
import { Pressable, StyleSheet, Platform, StatusBar, Text, View, FlatList, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { eachWeekOfInterval, eachDayOfInterval, addDays, format } from 'date-fns';
import { responsiveHeight, responsiveWidth, responsiveFontSize } from "react-native-responsive-dimensions";
import getDay from 'date-fns/getDay';
import axios from 'axios';
import { FontAwesome } from '@expo/vector-icons';
import { SharedElement } from 'react-navigation-shared-element';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { generateRandomString, createEmpty, storeData } from './Modules';

export default function ScheduleScreen({ }) {

    const navigation = useNavigation();

    const flatListRef = useRef(null);

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

    const selectedId = (getDay(new Date()) + 6) % 7;

    const dispatch = useDispatch();
    const updateCH = useSelector(state => state.updateCH);
    const isReady = useSelector(state => state.isReady);

    const OpenOffer = () => { //!открытие окна отправки отчёта
        dispatch({ type: "OPEN_REPORT", payload: true });
    }

    const weekForNewUser = async (userLogin) => { //обновление недели для новго юзера
        console.log('начинаю обновлять всю неделю для новго юзера');
        let oldCH = createEmpty(date);

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
                let group = JSON.parse(st);
                if (days[i].lessons[j].subgroup.title) {
                    if (days[i].lessons[j].subgroup.title.slice(-1) == 1) {
                        group = group.filter(student => student.flag == 1);
                    } else {
                        group = group.filter(student => student.flag == 2);
                    }
                }
                changeble = [...changeble, {
                    name: days[i].lessons[j].title,
                    timeStart: days[i].lessons[j].timeStart,
                    timeEnd: days[i].lessons[j].timeEnd,
                    type: days[i].lessons[j].type,
                    students: group,
                    id: generateRandomString(15),
                }]
            }

            oldCH[index].lessons = changeble;
        }

        dispatch({ type: "GET_SCHEDULE", payload: oldCH });
        await storeData(oldCH);
        const jsonCurrentWeek = JSON.stringify(date);
        const jsonCurrentDay = JSON.stringify((getDay(new Date()) + 6) % 7);
        await AsyncStorage.setItem('@lastWeek', jsonCurrentWeek);
        await AsyncStorage.setItem('@lastDay', jsonCurrentDay);
        console.log('я сохранил lastWeek и lastDay');
    }; //!исправил

    const changePresents = (returnedList, selectedDay, selectedLesson) => {
        console.log(`selectedDay: ${selectedDay}; selectedLesson: ${selectedLesson}`);
        let changeble = updateCH.slice();
        changeble[selectedDay].lessons[selectedLesson].students = returnedList;
        dispatch({ type: "GET_SCHEDULE", payload: changeble });
        storeData(changeble);
    } //!исправил

    const onLayoutRootView = useCallback(async () => {
        if (isReady) {
            flatListRef.current.scrollToIndex({ index: selectedId, animated: true });
        }
    }, [isReady]);

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
                <FlatList
                    // data={CH}
                    data={updateCH}
                    ref={flatListRef}
                    keyExtractor={(item) => item.ID}
                    showsHorizontalScrollIndicator={false}
                    pagingEnabled
                    horizontal
                    // initialNumToRender={selectedId}
                    getItemLayout={(data, index) => (
                        { length: width, offset: width * index, index }
                    )}
                    // initialScrollIndex={3}
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
