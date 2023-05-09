import { createStore } from "redux";

const defaultSate = {
    studentsList: [],
    visibleReport: false,
    scheduleData: [],
    groupName: "",
    headName: "",
    weekNumber: "",
}

const reducer = (state = defaultSate, action) => {
    switch (action.type) {
        case "GET_GROUP":
            return { ...state, groupName: action.payload };
        case "GET_HEAD":
            return { ...state, headName: action.payload };
        case "GET_WEEK":
            return { ...state, weekNumber: action.payload };
        case "GET_STUDENTS":
            return { ...state, studentsList: action.payload };
        case "START_REPORT":
            return { ...state, visibleReport: action.payload };
        case "GET_SCHEDULE":
            return { ...state, scheduleData: action.payload };
        default:
            return state;
    }
}

export const store = createStore(reducer);