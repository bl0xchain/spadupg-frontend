import '../styles/globals.css'
import 'bootstrap/dist/css/bootstrap.css'
import Head from 'next/head'
import Header from '../components/layout/Header'
import TransactionModal from '../components/layout/TransactionModal'
import ConnectionCheck from '../components/layout/ConnectionCheck'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css';
import Footer from '../components/layout/Footer'
import { Provider } from 'react-redux'
import store from '../redux/store'

function MyApp({ Component, pageProps }) {
    return (
        <Provider store={store}>
            <Head>
                <title>SPAD Finance</title>
                <meta name="description" content="Special Purpose Acquisition DAO. Bringing SPACs on Blockchain" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Header />
            <TransactionModal />
            <ConnectionCheck />
            <ToastContainer />
            <Component {...pageProps} />
            <Footer />
        </Provider>
    )
}

export default MyApp
