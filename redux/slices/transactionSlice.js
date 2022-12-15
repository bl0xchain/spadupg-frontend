import { createSlice } from '@reduxjs/toolkit'

export const transactionSlice = createSlice({
    name: 'transaction',
    initialState: {
        txHash: "",
        message: "",
        status: 0,
        popUp: false
    },
    reducers: {
        showTxPopUp(state, action) {
            console.log(action.payload);
            state.txHash = action.payload.txHash
            state.message = action.payload.message
            state.status = action.payload.status
            state.popUp = true
        },
        hideTxPopUp(state, action) {
            state.popUp = false
        }
    }
})

export const { showTxPopUp, hideTxPopUp } = transactionSlice.actions

export default transactionSlice.reducer

