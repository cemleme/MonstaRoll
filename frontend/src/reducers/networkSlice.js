import { createSlice } from '@reduxjs/toolkit'

export const networkSlice = createSlice({
  name: 'network',
  initialState: {
    value: null,
  },
  reducers: {
    setNetwork: (state, action) => {
      state.value = action.payload
    },
  },
})

// Action creators are generated for each case reducer function
export const { setNetwork } = networkSlice.actions

export default networkSlice.reducer