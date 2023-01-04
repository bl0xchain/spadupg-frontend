import Decimal from "decimal.js-light";
import { useEffect, useState } from "react";
import { Button, Col, Form, FormControl, Modal, Row, Spinner } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import actionsService from "../../redux/services/actions.service";
import spadService from "../../redux/services/spad.service";
import tokensService, { getDecimals } from "../../redux/services/tokens.service";
import { showConnectionPopUp } from "../../redux/slices/walletSlice";

const ActivateSpad = ({ spadAddress, spad, loadSpad }) => {
    const [activating, setActivating] = useState(false);
    const [activationPitch, setActivationPitch] = useState("");
    const [activationModalShow, setActivationModalShow] = useState(false);
    const [allowing, setAllowing] = useState(false);
    const [currencyAllowance, setCurrencyAllowance] = useState(0);
    const [tokenType, setTokenType] = useState('');
    const [tokenAddress, setTokenAddress] = useState("");
    const [tokenAmount, setTokenAmount] = useState("");
    const [errorMsg, setErrorMsg] = useState("");

    const dispatch = useDispatch()
    const address = useSelector((state) => state.wallet.address);
    const connectionStatus = useSelector((state) => state.wallet.status);

    const handleActivate = async() => {
        if(connectionStatus !== 'CONNECTED') {
            dispatch(showConnectionPopUp())
            return;
        }
        if(spad.isPrivate) {
            setActivationModalShow(true);
        } else {
            setActivating(true);
            const amount = Decimal(spad.target).dividedBy(10);
                        
            const response = await actionsService.activateSpad(address, spadAddress, amount, spad.currencyAddress, activationPitch, tokenAddress, 0);
            if(response.code == 200 ) {
                toast.success("SPAD activated successfully.")
                loadSpad();
                
            } else {
                toast.error("SPAD activation failed.")
            }
            setActivating(false);
        }
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

        if(activationPitch === '' || tokenAmount === '' || tokenType === '') {
            setErrorMsg("All fields are compulsory");
            return;
        }

        let amount = 0;
        if(tokenType === 'external_token') {
            if(tokenAddress === "") {
                setErrorMsg("Please enter token address");
                setPitchProcessing(false);
                return;
            }
            const tokenContract = getCurrencyContract(tokenAddress);
            try {
                const balance = await tokenContract.methods.balanceOf(address).call({
                    from: address
                });
                if(balance > 0) {
                    setErrorMsg("Make sure you have token balance");
                    setPitchProcessing(false);
                    return;
                }
            } catch (error) {
                setErrorMsg("Please enter valid token address");
                setPitchProcessing(false);
                return;
            }
            const decimals = await tokenContract.methods.decimals().call({from: address});
            if(decimals == 18) {
                amount = getDecimals("", tokenAmount);
            } else if(decimals == 6) {
                amount = getDecimals("USDC", tokenAmount);
            } else {
                setErrorMsg("Token decimals should be 18 or 6");
                setPitchProcessing(false);
                return;
            }
        } else {
            amount = getDecimals("", tokenAmount);
        }
        setActivationModalShow(false);
        setActivating(true);
        const shareAmount = Decimal(spad.target).dividedBy(10);
                    
        const response = await actionsService.activateSpad(address, spadAddress, shareAmount, spad.currencyAddress, activationPitch, tokenAddress, amount);
        if(response.code == 200 ) {
            toast.success("SPAD activated successfully.")
            loadSpad();
            
        } else {
            toast.error("SPAD activation failed.")
        }
        setActivating(false);


        // setActivating(true);
        // if(activationPitch !== "") {
        //     setActivationModalShow(false);
        //     const amount = Decimal(spad.targetView).dividedBy(10);
        //     const response = await spadService.activateSpad(address, spadAddress, amount, activationPitch, spad.currencyAddress);
        //     if(response.code == 200 ) {
        //         toast.success("SPAD activated successfully.")
        //         loadSpad();
                
        //     } else {
        //         toast.error("SPAD creation failed.")
        //     }
        //     setActivating(false);
        // } else {
        //     setActivating(false);
        // }
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
                        <label className="form-label">Enter Your Activation Pitch for the SPAD</label>
                        <FormControl
                            placeholder="Your Activation Pitch"
                            className="mb-4"
                            as="textarea"
                            rows={5}
                            value={activationPitch}
                            onChange={(e) => setActivationPitch(e.target.value)}
                        />
                        <div className="mb-5">
                            <label className="form-label">Token Details for Distribution (ERC20)</label>
                            <Row className="align-items-center">
                                <Col sm="12" className="mb-2" onChange={(e) => setTokenType(e.target.value)}>
                                    <Form.Check
                                        inline
                                        label={`${spad.symbol} Token`}
                                        name="token_type"
                                        type='radio'
                                        id="spad-token"
                                        value="spad_token"
                                    />
                                    <Form.Check
                                        inline
                                        label={`External Token`}
                                        name="token_type"
                                        type='radio'
                                        id="external-token"
                                        value="external_token"
                                    />
                                </Col>
                                {
                                    tokenType == 'external_token' &&
                                    <Col sm="6">
                                        <Form.Control type="text" placeholder="Token Address" 
                                            value={tokenAddress}
                                            onChange={(e) => {setErrorMsg("");setTokenAddress(e.target.value)}}
                                        />
                                    </Col>
                                }
                                <Col sm="6">
                                    <Form.Control type="number" placeholder="Token Amount" 
                                        value={tokenAmount}
                                        onChange={(e) => {setErrorMsg("");setTokenAmount(e.target.value)}}
                                    />
                                </Col>
                            </Row>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="default" onClick={() => setActivationModalShow(false)}>
                            Cancel
                        </Button>
                        <Button variant="color" onClick={handlePitchActivation}>
                            Proceed
                        </Button>
                        
                    </Modal.Footer>
                </Modal>
            }
            </>
        }
        </div>
    )
}

export default ActivateSpad;