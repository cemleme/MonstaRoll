import {
    configureStore,
    createAction,
    createReducer,
  } from "@reduxjs/toolkit";
import networkReducer from './reducers/networkSlice'
// import accountReducer from './reducers/accountSlice'

  
//   const setAddress = createAction("SET_ADDRESS");
//   const setWallet = createAction("SET_WALLET");
  
//   const connectionState = {
//     address: null,
//     wallet: null,
//   };
  
//   const connectionReducer = createReducer(connectionState, {
//     [setAddress]: (state, action) => {
//         return { ...state, address: action.payload };
//     },
//     [setWallet]: (state, action) => {
//         return { ...state, wallet: action.payload };
//     },
//   });


export default configureStore({
  reducer: {
    network: networkReducer,
  },
});