import AsyncStorage from '@react-native-async-storage/async-storage';

export const generateRandomString = (length) => {
    const characters =
        '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%&()_+|}{[]:?></-=';
    let result = '';
    const charactersLength = characters.length;

    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
};

export const createEmpty = (date) => {
    let empty = [];

    for (let i = 0; i < 7; i++) {
        let changeble = {
            day: date[i],
            lessons: [],
            ID: generateRandomString(15)
        }
        empty = [...empty, changeble]
    }

    return empty;
};

export const storeData = async (value) => {
    try {
        const jsonValue = JSON.stringify(value);
        await AsyncStorage.setItem('@storage_Key', jsonValue);
        // console.log('я сохранил всё расписание');
    } catch (e) {
        // console.log('ошибка сохранения в storeData')
    }
};