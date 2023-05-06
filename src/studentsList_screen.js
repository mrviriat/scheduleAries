import { FlashList } from "@shopify/flash-list";
import { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, FlatList, TouchableOpacity, Platform, SafeAreaView, StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFonts, Inter_400Regular } from '@expo-google-fonts/inter';
import { responsiveHeight, responsiveWidth, responsiveFontSize } from "react-native-responsive-dimensions";
import { useDispatch, useSelector } from "react-redux";
// export default function StudentsList_screen({ studentsList, setStudents }) {
export default function StudentsList_screen() {

    let [fontsLoaded] = useFonts({
        Inter_400Regular,
    });

    const dispatch = useDispatch();
    const studentsList = useSelector(state => state.studentsList);
    //TODO: заменить всё взаимодействие на redux
    //!обязательно

    const sell_Srudent = async (value) => {  //сохранение списка студентов в асинхронное хранилище
        try {
            const jsonValue = JSON.stringify(value);
            await AsyncStorage.setItem('@stu', jsonValue);
            console.log('я сохранил список студентов в @stu');
        } catch (e) {
            console.log('ошибка сохранения в sell_Srudent (function StudentsList_screen)');
        }
    };

    const onClickHandler = (name, index) => {  //изменение существующего студента
        console.log('измененяю существующего студента');
        let updatedStudents = [...studentsList]; // создаем копию массива
        updatedStudents[index].name = name; // изменяем элемент массива
        console.log(updatedStudents[index].name);
        dispatch({ type: "GET_STUDENTS", payload: updatedStudents });
        sell_Srudent(updatedStudents);
    };

    const add_Srudent = (Name) => {  //добавление нового студента
        console.log('добавляю нового студента');
        let updatedStudents = [...studentsList]; // создаем копию массива
        updatedStudents.push({ name: Name, isHere: true, desc: '' });
        dispatch({ type: "GET_STUDENTS", payload: updatedStudents });
        sell_Srudent(updatedStudents);
    };

    const dell_Srudent = (index) => {  //удаление существующего студента
        console.log('удаляю существующего студента');
        let updatedStudents = [...studentsList]; // создаем копию массива
        updatedStudents.splice(index, 1);
        dispatch({ type: "GET_STUDENTS", payload: updatedStudents });
        sell_Srudent(updatedStudents);
    };

    const ref = useRef(null);  //работа с текстовым полем ввода
    const [ChangedStudent, setChangedStudent] = useState("");
    const [NewStudent, setValue] = useState(true);
    const [ChangedIndex, setChangedIndex] = useState();

    if (!fontsLoaded) {
        return null;
    };

    return (
        <View style={styles.AndroidSafeArea}>
            <View style={{ flex: 3, justifyContent: "center", alignItems: "center" }}>
                <Text style={[styles.text, { marginBottom: responsiveHeight(1.77) }]}>
                    Cписок учебной группы🐥
                </Text>
                <TextInput
                    ref={ref}
                    style={styles.input}
                    placeholder="Новый студент"
                    autoCapitalize='words'
                    defaultValue={ChangedStudent}

                    onChangeText={setChangedStudent}
                    onSubmitEditing={NewStudent == true ?
                        () => { add_Srudent(ChangedStudent.trim()); setChangedStudent("") } :
                        () => { onClickHandler(ChangedStudent.trim(), ChangedIndex); setChangedStudent(""); setValue(true) }
                    }
                />
            </View>
            <View style={{ flex: 15, alignItems: "center" }} >
                <FlatList
                    data={studentsList}
                    keyExtractor={(item, index) => item.name + index.toString()}
                    showsVerticalScrollIndicator={false}
                    initialNumToRender={15}
                    renderItem={({ item, index }) =>
                        <TouchableOpacity style={[styles.item,
                        {
                            borderBottomWidth: index != studentsList.length - 1 ? responsiveHeight(0.1185) : 0,
                            borderColor: 'black',
                            borderBottomLeftRadius: index == studentsList.length - 1 ? responsiveHeight(0.5924) : 0,
                            borderBottomRightRadius: index == studentsList.length - 1 ? responsiveHeight(0.5924) : 0,
                            borderTopLeftRadius: index == 0 ? responsiveHeight(0.5924) : 0,
                            borderTopRightRadius: index == 0 ? responsiveHeight(0.5924) : 0,
                            marginBottom: index == studentsList.length - 1 ? responsiveHeight(1.5) : 0,
                            marginTop: index == 0 ? responsiveHeight(1.5) : 0,
                        }]}
                            onLongPress={() => dell_Srudent(index)}
                            delayLongPress={1000}
                            onPress={() => {
                                ref.current?.focus();
                                setChangedStudent(item.name);
                                setChangedIndex(index);
                                setValue(false);
                            }
                            }
                        >
                            <Text style={styles.text}>{index + 1}. </Text>
                            <Text style={styles.text}>{item.name} </Text>
                        </TouchableOpacity >
                    }
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    AndroidSafeArea: {
        flex: 1,
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : responsiveHeight(5.4)
    },
    text: {
        fontFamily: 'Inter_400Regular',
        fontSize: responsiveFontSize(2.67),
    },
    input: {
        width: responsiveWidth(92.308), //360
        height: responsiveHeight(7.109), //60
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
    item: {
        width: responsiveWidth(92.308), //360
        height: responsiveHeight(7.109), //60
        backgroundColor: '#D9D9D9',
        alignItems: 'center',
        flexDirection: 'row',
        paddingLeft: responsiveWidth(5.55), //20
        // marginHorizontal: responsiveWidth(3.846),
    }
});
