import Link from "next/link";
import { Button, Modal } from "react-bootstrap";
import { FaCheckCircle, FaExclamationCircle, FaTimesCircle } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { hideTxPopUp } from "../../redux/slices/transactionSlice";

const TransactionModal = () => {
    const dispatch = useDispatch()
    const show = useSelector((state) => state.transaction.popUp)
    const status = useSelector((state) => state.transaction.status)
    const txHash = useSelector((state) => state.transaction.txHash)
    const message = useSelector((state) => state.transaction.message)

    const handleClose = () => {
        dispatch(hideTxPopUp())
    }

    return (
        <Modal
            show={show}
            onHide={handleClose}
            backdrop="static"
            keyboard={false}
            centered
            id="transaction-modal"
        >
            
            <Modal.Body className="p-5 text-center">
                {
                    status === 200 ?
                    <>
                        <div className="mb-4">
                            <FaCheckCircle  className="text-success1 fs-1" />
                            <h4 className="mt-3 fw-bold">{message}</h4>
                        </div>
                        <Link href={`https://goerli.etherscan.io/tx/${txHash}`}>
                            <a className="btn btn-color active" target="_blank" style={{marginRight: "15px"}}>View TXN</a>
                        </Link> {" "}
                    </>
                    :
                    <div>
                        <FaTimesCircle className="text-danger1 fs-1" />
                        <h3 className="mt-3 fw-bold">Your transaction has been cancelled</h3>
                        <p>{txHash}</p>
                    </div>
                }
                <Button variant="secondary1" onClick={handleClose}>
                    Close
                </Button>
            </Modal.Body>
        </Modal>
    );
}

export default TransactionModal;