import { createStore } from "redux";

const defaultSate = {
    studentsList: [],
    visibleReport: false,
    scheduleData: [],
}

const reducer = (state = defaultSate, action) => {
    switch (action.type) {
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