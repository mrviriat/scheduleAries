import React, { useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StyleSheet, View, Dimensions, Animated, Easing, Text, TouchableOpacity, Platform, TextInput, KeyboardAvoidingView } from 'react-native'
import { useFonts, Inter_400Regular } from '@expo-google-fonts/inter';
import {
    responsiveHeight,
    responsiveWidth,
    responsiveFontSize,
    responsiveScreenFontSize
} from "react-native-responsive-dimensions";
import { format } from 'date-fns';
import { useDispatch, useSelector } from 'react-redux';
// FileSystem
import * as FileSystem from 'expo-file-system';
// ExcelJS
import ExcelJS from 'exceljs';
// Share excel via share dialog
import * as Sharing from 'expo-sharing';
// From @types/node/buffer
import { Buffer as NodeBuffer } from 'buffer';

export default function Report({ visible, options, duration, onClose }) {
    let [fontsLoaded] = useFonts({
        Inter_400Regular,
    });
    const { height } = Dimensions.get('screen');
    const startPointY = options?.from === 'top' ? -height : height;
    const transY = useRef(new Animated.Value(startPointY));

    const dispatch = useDispatch();
    const data = useSelector(state => state.scheduleData);
    const groupName = useSelector(state => state.groupName);
    const headName = useSelector(state => state.headName);
    const weekNumber = useSelector(state => state.weekNumber);

    useEffect(() => {
        if (visible) {
            startAnimation(0);
        } else {
            startAnimation(startPointY);
        }
    }, [visible]);

    const startAnimation = (toValue) => {
        Animated.timing(transY.current, {
            toValue,
            duration,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true
        }).start(
            () => {
                if (groupName != "" && headName != "" && toValue == 0) {
                    input.current?.focus();
                }
            }
        );
    }

    const onPress = () => {
        onClose();
        setTimeout(function () { setReady(false) }, duration);
    }

    const generateBackgroundOpacity = () => {
        if (startPointY >= 0) {
            return transY.current.interpolate({
                inputRange: [0, startPointY],
                outputRange: [0.8, 0],
                extrapolate: 'clamp'
            })
        } else {
            return transY.current.interpolate({
                inputRange: [startPointY, 0],
                outputRange: [0, 0.8],
                extrapolate: 'clamp'
            })
        }
    }

    const [Ready, setReady] = useState(false)

    const editGroup = (text) => {
        storeData(text, '@num');
        dispatch({ type: "GET_GROUP", payload: text });
    }

    const editHead = (text) => {
        storeData(text, '@head');
        dispatch({ type: "GET_HEAD", payload: text });
    }

    const editWeek = (text) => {
        storeData(text, '@weeknumber');
        dispatch({ type: "GET_WEEK", payload: text });
    }

    const storeData = async (value, key) => {
        try {
            const jsonValue = JSON.stringify(value)
            await AsyncStorage.setItem(key, jsonValue)
        } catch (e) {
            console.log('ошибка сохранения')
        }
    }

    const ucFirst = (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    const generateShareableExcel = async () => {
        const now = new Date();
        const fileName = `${weekNumber}_${headName}_${groupName}.xlsx`;
        const fileUri = FileSystem.cacheDirectory + fileName;
        return new Promise((resolve, reject) => {
            const workbook = new ExcelJS.Workbook();
            workbook.creator = 'Me';
            workbook.created = now;
            workbook.modified = now;
            // Add a sheet to work on
            const worksheet = workbook.addWorksheet(`${format(new Date(data[0].day), 'dd')}.${format(new Date(data[0].day), 'LL')}-${format(new Date(data[5].day), 'dd')}.${format(new Date(data[5].day), 'LL')}`, {});
            // Just some columns as used on ExcelJS Readme
            worksheet.columns = [
                { header: 'Имя студента', key: 'name', width: 30 },
                { header: 'Дата пропуска', key: 'dat', width: 30 },
                { header: 'Кол-во часов', key: 'hour', width: 15 },
                { header: 'Название дисциплины', key: 'less', width: 70, },
                { header: 'Причина пропуска', key: 'desc', width: 50, }
            ];


            let full_students = [];
            data.forEach(element => {
                element.lessons.forEach(lesson => {
                    lesson.students.forEach(student => {
                        if (!full_students.includes(student.name)) {
                            full_students.push(student.name)
                        }
                    })


                })
            });
            full_students.sort();

            full_students.forEach(Name => {
                let last_used_name;
                let last_used_date;
                let last_used_description;
                data.forEach(day => {
                    day.lessons.forEach(lesson => {

                        lesson.students.forEach(student => {
                            if (student.name == Name && student.isHere == false) {
                                let date;
                                let description = "";
                                let name = "";
                                if (last_used_name != Name) { name = Name }
                                if (last_used_date != day.day) { date = day.day }
                                if (last_used_description != student.desc.toLowerCase().trim() && student.desc != "") { description = student.desc.toLowerCase().trim() }

                                worksheet.addRow({ name: name, dat: date == undefined ? "" : format(new Date(date), 'PPPP'), hour: 2, less: ucFirst(lesson.name), desc: ucFirst(description) });
                                last_used_date = day.day;
                                if (student.desc != "") { last_used_description = student.desc.toLowerCase().trim() }
                                last_used_name = Name;
                            }
                        })
                    })
                });
                if (Name == last_used_name) {
                    worksheet.addRow({ name: "", dat: "", hour: "", less: "", desc: "" });
                }
            });


            // // Test styling

            // Style first row
            worksheet.getRow(1).font = {
                size: 14, bold: true
            };
            // // Style second column
            // worksheet.eachRow((row, rowNumber) => {
            //     row.getCell(2).font = {
            //         name: 'Arial Black',
            //         color: { argb: 'FF00FF00' },
            //         family: 2,
            //         size: 14,
            //         bold: true
            //     };
            // });

            // Write to file
            workbook.xlsx.writeBuffer().then((buffer) => {
                const nodeBuffer = NodeBuffer.from(buffer);
                const bufferStr = nodeBuffer.toString('base64');
                FileSystem.writeAsStringAsync(fileUri, bufferStr, {
                    encoding: FileSystem.EncodingType.Base64
                }).then(() => {
                    resolve(fileUri);
                });
            });
        });
    }

    const shareExcel = async () => {
        const shareableExcelUri = await generateShareableExcel();

        Sharing.shareAsync(shareableExcelUri, {
            mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // Android
            dialogTitle: 'Your dialog title here', // Android and Web
            UTI: 'com.microsoft.excel.xlsx' // iOS
        }).catch(error => {
            console.error('Error', error);
        }).then(() => {
            console.log('Return from sharing dialog');
        });
    }

    const [Editing, setEditing] = useState(false) //отслеживание, редактируются ли сейчас данные
    const input = useRef(null); //ссылка на поле с неделей

    if (!fontsLoaded) {
        return null;
    }

    return (
        <>
            <Animated.View pointerEvents='none' style={[styles.outerContainer, { opacity: generateBackgroundOpacity() }]} />
            <Animated.View style={[styles.container, { transform: [{ translateY: transY.current }] }]}>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <TouchableOpacity activeOpacity={1} onPressOut={() => { if (Editing == false) { onPress() } }} style={styles.container} />
                    <View style={styles.innerContainer}>
                        <View style={{ flex: 6, alignItems: 'center', justifyContent: 'center' }}>
                            <Text style={styles.text}>Excel отчёт📋</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="уч. группа (eng: POIT-211 etc.)"
                                defaultValue={groupName}
                                onChangeText={editGroup}
                                onEndEditing={() => {
                                    setEditing(false);
                                }}
                                onFocus={() => setEditing(true)}
                                autoCapitalize='characters'
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Фамилия старосты (eng)"
                                defaultValue={headName}
                                onChangeText={editHead}
                                onEndEditing={() => {
                                    setEditing(false);
                                }}
                                onFocus={() => setEditing(true)}
                                autoCapitalize={headName != "" ? "none" : "words"}
                                autoCorrect={false}
                            />
                            <TextInput
                                ref={input}
                                style={styles.input}
                                placeholder="номер уч. недели"
                                defaultValue={weekNumber}
                                onChangeText={editWeek}
                                onEndEditing={() => {
                                    setEditing(false);
                                }}
                                onFocus={() => setEditing(true)}
                                autoCapitalize='none'
                            />
                        </View>
                        <TouchableOpacity onPress={() => { if (groupName != "" && headName != "" && weekNumber != "") { shareExcel(); setReady(true) } }} style={{ flex: 2, alignItems: 'center', borderTopWidth: 1, borderColor: '#007AFF' }}>
                            <Text style={[styles.text, { marginTop: responsiveHeight(2) }]}>Сформировать отчёт</Text>
                            {Ready == true ? <Text style={{ fontFamily: 'Inter_400Regular', fontSize: responsiveFontSize(2.1), color: 'green', marginTop: Platform.OS === 'ios' ? responsiveHeight(1.5) : responsiveHeight(2.2) }}>✨Сформирован✨</Text> :
                                <Text style={{ fontFamily: 'Inter_400Regular', fontSize: responsiveFontSize(2.1), color: '#FF0000', marginTop: Platform.OS === 'ios' ? responsiveHeight(1.5) : responsiveHeight(2.2) }}>Не сформирован</Text>}
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </Animated.View>
        </>
    )
}

// export default forwardRef(Report);

const styles = StyleSheet.create({
    outerContainer: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        backgroundColor: '#2b4369',
    },
    container: {
        position: 'absolute',
        width: '100%',
        height: '100%'
    },
    innerContainer: {
        width: '80%',
        height: responsiveHeight(50),
        backgroundColor: '#D9D9D9',
        justifyContent: 'center',
        alignContent: 'center',
        borderRadius: responsiveHeight(1.8),
    },
    input: {
        width: responsiveWidth(75), //360
        height: responsiveHeight(7.109), //60
        marginTop: responsiveHeight(1.8),
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
    text: {
        fontFamily: 'Inter_400Regular',
        fontSize: responsiveFontSize(2.67),
    },
})