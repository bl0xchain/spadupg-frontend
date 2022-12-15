import { useCallback, useEffect, useState } from "react";
import { Button, InputGroup, Spinner } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import spadService from "../../redux/services/spad.service";
import tokensService from "../../redux/services/tokens.service";
import { showConnectionPopUp } from "../../redux/slices/walletSlice";
import PassKeyModal from "./PassKeyModal";

const Contribute = ({ spadAddress, spad, loadSpad }) => {
    const [isContribute, setIsContribute] = useState(false);
    const [contributing, setContributing] = useState(false);
    const [contribution, setContribution] = useState("");
    const [contributionAmount, setAmount] = useState("");

    const [passKey, setPassKey] = useState("");
    const [passKeyModalShow, setPassKeyModalShow] = useState(false);
    const [allowanceNeeded, setAllowanceNeeded] = useState(false);
    const [allowing, setAllowing] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const dispatch = useDispatch()
    const address = useSelector((state) => state.wallet.address);
    const connectionStatus = useSelector((state) => state.wallet.status);

    const updateContribution = useCallback(async() => {
        const amount = await spadService.getContribution(address, spad.currencyAddress, spadAddress);
        setContribution(amount);
    }, [address]);

    const handleContribute = async() => {
        if(connectionStatus !== 'CONNECTED') {
            dispatch(showConnectionPopUp())
            return;
        }
        let amount = parseFloat(contributionAmount);
        if(!isNaN(amount)) {
            let minContributionNeeded = spad.minInvestmentView;
            if((spad.targetView - spad.currentInvestmentView) < spad.minInvestmentView ) {
                minContributionNeeded = spad.targetView - spad.currentInvestmentView;
            }
            let totalContribution = amount + contribution;
            if(totalContribution >= minContributionNeeded && totalContribution <= spad.maxInvestmentView) {
                if(await isAllowanceNeeded()) {
                    setAllowanceNeeded(true);
                    return;
                } else {
                    setAllowanceNeeded(false);
                }
                if(spad.isPrivate) {
                    setPassKeyModalShow(true);
                } else {
                    handlePassKeyContribute();
                }
            } else {
                setErrorMsg('Contribution must be between '+minContributionNeeded+' '+spad.investmentCurrency+' to '+spad.maxInvestmentView+' '+spad.investmentCurrency);
                setContributing(false);
            }
        } else {
            setErrorMsg('Please enter valid contribution amount');
            setContributing(false);
        }
    }

    const isAllowanceNeeded = async() => {
        if(spad.currencyAddress === "") {
            return false;
        }
        const allowance = await tokensService.getCurrencyAllowance(address, spad.currencyAddress);
        if(parseFloat(allowance) >= parseFloat(contributionAmount)) {
            return ;
        } else {
            return true;
        }
    }

    const handlePassKeyContribute = async() => {
        setContributing(true);
        const response = await spadService.contribute(address, spadAddress, spad.currencyAddress, contributionAmount, passKey);
        if(response.code == 200) {
            toast.success("Contributed for SPAD successfully")
            updateContribution();
            setIsContribute(false);
            loadSpad();
        } else {
            toast.error("Problem with contributing for SPAD")
        }
        setContributing(false);
    }

    const handleCurrencyAllow = async() => {
        if(connectionStatus !== 'CONNECTED') {
            dispatch(showConnectionPopUp())
            return;
        }
        setAllowing(true);
        const response = await tokensService.allowCurrency(address, spad.currencyAddress, contributionAmount);
        if(response.code == 200 ) {
            toast.success("Currency allowed successfully.")
            isAllowanceNeeded()
        } else {
            toast.error("Currency allowance failed.")
        }
    }

    useEffect(() => {
        if(address !== "") {
            updateContribution()
        }
    }, [address])

    return (
        <div>
        {
            contribution > 0 &&
            <>
                <div className="fw-bold text-secondary1">YOUR CONTRIBUTION</div>
                <p className="fw-bold fs-5">{contribution} {" "} {spad.investmentCurrency}</p>
            </>
        }
        {
            spad.status === "2" &&
            <>
            {
                isContribute ?
                <div style={{display: 'inline-block', maxWidth: '350px', margin: '0 auto'}}>
                {
                    contributing ?
                    <InputGroup>
                        <input min="0.1" placeholder="Enter Amount" type="number" className="form-control" style={{borderStartStartRadius: '10px'}} />
                        <Button variant="color" disabled>
                            CONTRIBUTING { ' ' } <Spinner animation="border" size="sm" />
                        </Button>
                    </InputGroup> :
                    <div>
                        <InputGroup>
                            <input min="0.1" placeholder="Enter Amount" type="number" className="form-control" 
                                onChange={(e) => {setErrorMsg(""); setAmount(e.target.value);}} 
                                value={contributionAmount} readOnly={allowing ? "readOnly" : ""}
                            />
                            {
                                allowanceNeeded ?
                                <>
                                {
                                    allowing ? 
                                    <Button variant="color" disabled>Allowing {contributionAmount} {spad.investmentCurrency} <Spinner animation="border" size="sm" /></Button> :
                                    <Button variant="color" onClick={handleCurrencyAllow}>Allow {contributionAmount} {spad.investmentCurrency}</Button>
                                }
                                </> :
                                <Button variant="color" onClick={handleContribute}>CONTRIBUTE</Button>
                            }
                            
                        </InputGroup>
                        <div className="mt-1 text-end">
                            <span style={{cursor: "pointer"}} onClick={() => setIsContribute(false)}>Cancel</span>
                        </div>
                    </div>
                }
                {
                    spad.isPrivate &&
                    <PassKeyModal show={passKeyModalShow} setShow={setPassKeyModalShow} passKey={passKey} setPassKey={setPassKey} handleAction={handlePassKeyContribute} />
                }
                </div> :
                <>
                {
                    (contribution < spad.maxInvestmentView) &&
                    <Button variant="color" onClick={() => setIsContribute(true)}>CONTRIBUTE</Button>
                }
                </>
            }
            </>
        }
        { errorMsg && 
            <p className="text-danger1">{errorMsg}</p>
        }
        </div>
    )
}

export default Contribute;