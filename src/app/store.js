import { configureStore } from '@reduxjs/toolkit';
import reduxThunk from 'redux-thunk'
import orderBookReducer from './orderBookReducer';

export const store = configureStore({
  reducer: {
    orderBook: orderBookReducer,
  },
  middleware: [reduxThunk],
});