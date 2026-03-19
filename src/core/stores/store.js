import { configureStore } from '@reduxjs/toolkit'
import counterReducer from '../counterSlice'

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    // Aquí agregarás más reducers según necesites
  },
})