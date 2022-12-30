import Decimal from "decimal.js-light";
import { useEffect, useState } from "react";
import { Button, FormControl, Modal, Spinner } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import actionsService from "../../redux/services/actions.service";
import spadService from "../../redux/services/spad.service";
import tokensService from "../../redux/services/tokens.service";
import { showConnectionPopUp } from "../../redux/slices/walletSlice";

const ActivateSpad = ({ spadAddress, spad, loadSpad }) => {
    const [activating, setActivating] = useState(false);
    const [activationPitch, setActivationPitch] = useState("");
    const [activationModalShow, setActivationModalShow] = useState(false);
    const [allowing, setAllowing] = useState(false);
    const [currencyAllowance, setCurrencyAllowance] = useState(0);

    const dispatch = useDispatch()
    const address = useSelector((state) => state.wallet.address);
    const connectionStatus = useSelector((state) => state.wallet.status);

    const handleActivate = async() => {
        if(connectionStatus !== 'CONNECTED') {
            dispatch(showConnectionPopUp())
            return;
        }
        // if(spad.isPrivate) {
        //     setActivationModalShow(true);
        // } else {
            setActivating(true);
            const amount = Decimal(spad.target).dividedBy(10);
                        
            const response = await actionsService.activateSpad(address, spadAddress, amount, spad.currencyAddress);
            if(response.code == 200 ) {
                toast.success("SPAD activated successfully.")
                loadSpad();
                
            } else {
                toast.error("SPAD activation failed.")
            }
            setActivating(false);
        // }
    }

    const handleCurrencyAllow = async() => {
        if(connectionStatus !== 'CONNECTED') {
            dispatch(showConnectionPopUp())
            return;
        }
        setAllowing(true);
        const amount = Decimal(spad.targetView).dividedBy(10);
        const response = await tokensService.allowCurrency(address, spad.currencyAddress, amount);
        if(response.code == 200 ) {
            toast.success("Currency allowed successfully.")
            tokensService.getCurrencyAllowance(address, spad.currencyAddress).then(allowance => {
                setCurrencyAllowance(allowance);
            })
        } else {
            toast.error("Currency allowance failed.")
        }
        setAllowing(false);
       
    }

    const handlePitchActivation = async() => {
        if(connectionStatus !== 'CONNECTED') {
            dispatch(showConnectionPopUp())
            return;
        }
        setActivating(true);
        if(activationPitch !== "") {
            setActivationModalShow(false);
            const amount = Decimal(spad.targetView).dividedBy(10);
            const response = await spadService.activateSpad(address, spadAddress, amount, activationPitch, spad.currencyAddress);
            if(response.code == 200 ) {
                toast.success("SPAD activated successfully.")
                loadSpad();
                
            } else {
                toast.error("SPAD creation failed.")
            }
            setActivating(false);
        } else {
            setActivating(false);
        }
    }

    useEffect(() => {
        if(spad.currencyAddress != "") {
            tokensService.getCurrencyAllowance(address, spad.currencyAddress).then(allowance => {
                setCurrencyAllowance(allowance);
            })
        }
    }, [spad, address]);

    return (
        <div className="spad-activate">
        {
            spad.status === "1" && spad.creator === address &&
            <>
            {
                ((spad.investmentCurrency === 'ETH') || parseFloat(currencyAllowance) >= parseFloat(Decimal(spad.targetView).dividedBy(10))) ?
                <>
                    {activating ? 
                    <Button variant="color" disabled>ACTIVATING <Spinner animation="border" size="sm" /></Button> : 
                    <Button  variant="color" onClick={handleActivate}>ACTIVATE</Button>
                    }
                </> :
                <>
                    {allowing ? 
                    <Button variant="color" disabled>Allowing {spad.investmentCurrency} <Spinner animation="border" size="sm" /></Button> :
                    <Button variant="color" onClick={handleCurrencyAllow}>Allow {spad.investmentCurrency}</Button>
                    }
                </>
            }
            {
                spad.isPrivate &&
                <Modal show={activationModalShow} centered={true} size="md" onHide={() => setActivationModalShow(false)}>
                    <Modal.Header closeButton>
                        <Modal.Title>Activation Pitch</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <label>Enter Your Activation Pitch for the SPAD</label>
                        <FormControl
                            placeholder="Your Activation Pitch"
                            as="textarea"
                            rows={5}
                            value={activationPitch}
                            onChange={(e) => setActivationPitch(e.target.value)}
                        />
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="default" onClick={() => setActivationModalShow(false)}>
                            Cancel
                        </Button>
                        {
                            activationPitch ? 
                            <Button variant="color" onClick={handlePitchActivation}>
                                Proceed
                            </Button> :
                            <Button variant="color" disabled>
                                Proceed
                            </Button>
                        }
                        
                    </Modal.Footer>
                </Modal>
            }
            </>
        }
        </div>
    )
}

export default ActivateSpad;