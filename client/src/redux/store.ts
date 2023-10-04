import { configureStore } from "@reduxjs/toolkit";
import journalReducer from "Redux/reducers/journalSlice";
import userReducer from "Redux/reducers/userSlice";


export const store = configureStore({
  reducer: {
    journal: journalReducer,
    user: userReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
