import { useEffect } from "react";
import { Button, Modal } from "react-bootstrap";
import { FaExclamationCircle } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { changeNetwork, connectWallet, hideConnectionPopUp } from "../../redux/slices/walletSlice";

const ConnectionCheck = () => {
    const dispatch = useDispatch()

    const show = useSelector((state) => state.wallet.popUp)
    const status = useSelector((state) => state.wallet.status)

    const handleClose = () => {
        dispatch(hideConnectionPopUp())
    }

    useEffect(() => {
        if(status === 'CONNECTED' ) {
            dispatch(hideConnectionPopUp())
        }
    }, [status, dispatch])

    return (
        <Modal
            show={show}
            onHide={handleClose}
            backdrop="static"
            keyboard={false}
            centered
            id="connection-modal"
        >
            <Modal.Body className="py-4">
                <div className="text-center">
                    <FaExclamationCircle className="text-warning fs-1 mb-3" />
                    {
                        status === 'INVALID_CHAIN' ?
                        <>
                            <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                                You are on wrong network. Please change network to <br /><span className="text-yellow-400 font-bold">Rinkeby</span> <br />to complete the transaction.
                            </h3>
                            <div className="mt-4 flex justify-center">
                                <Button variant="color" onClick={()=>dispatch(changeNetwork())}>Change Network</Button>
                            </div>
                        </> : 
                        <>
                        {
                            status === 'NOT_CONNECTED' ? 
                            <>
                                <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                                    Your wallet is not Connected. Please connect wallet to do transaction.
                                </h3>
                                <div className="mt-4 flex justify-center">
                                    <Button  variant="color" onClick={()=>dispatch(connectWallet())}>Connect Wallet</Button>
                                </div>
                            </> :
                            <>
                                <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                                    Your wallet is not Connected. Please connect wallet to do transaction.
                                </h3>
                            </>
                        }
                        </>
                    }
                </div>
            </Modal.Body>
        </Modal>
    )
}

export default ConnectionCheck;