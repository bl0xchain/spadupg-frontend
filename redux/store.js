import { configureStore } from '@reduxjs/toolkit'
import transactionSlice from './slices/transactionSlice'
import walletSlice from './slices/walletSlice'

export default configureStore({
    reducer: {
        wallet: walletSlice,
        transaction: transactionSlice
    }
})