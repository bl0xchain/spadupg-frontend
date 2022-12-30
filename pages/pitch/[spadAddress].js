import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { Button, Card, Col, Form, Row, Spinner } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import SpadCardPlaceholder from "../../components/spad/SpadCardPlaceholder";
import SpadDetailsCard from "../../components/spad/SpadDetailsCard";
import actionsService from "../../redux/services/actions.service";
import fundService from "../../redux/services/fund.service";
import pitchService from "../../redux/services/pitch.service";
import spadsService from "../../redux/services/spads.service";
import { getCurrencyContract, getDecimals, getFromDecimals } from "../../redux/services/tokens.service";
// import spadService from "../../redux/services/spad.service";
import { showConnectionPopUp } from "../../redux/slices/walletSlice";

const PitchSpad = () => {
    const router = useRouter()
    const { spadAddress } = router.query

    const [spad, setSpad] = useState(null);
    const [contribution, setContribution] = useState(0);
    const [pitch, setPitch] = useState(null);

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [tokenType, setTokenType] = useState('');
    const [tokenAddress, setTokenAddress] = useState("");
    const [tokenAmount, setTokenAmount] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const [pitchProcessing, setPitchProcessing] = useState(false);

    const dispatch = useDispatch()
    const address = useSelector((state) => state.wallet.address);
    const connectionStatus = useSelector((state) => state.wallet.status);

    const loadSpad = async() => {
        const spadDetails = await spadsService.getSpadDetails(spadAddress);
        setSpad(spadDetails);
    }

    const handlePitch = async () => {
        setErrorMsg("");
        if(connectionStatus !== 'CONNECTED') {
            dispatch(showConnectionPopUp())
            return;
        }
        setPitchProcessing(true);
        if(name === '' || description === '' || tokenAmount === '' || tokenType === '') {
            setErrorMsg("All fields are compulsory");
            setPitchProcessing(false);
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
        const response = await actionsService.pitchSpad(address, spadAddress, name, description, tokenAddress, amount);
        if(response.code == 200) {
            const pitch = await pitchService.getPitch(address, spadAddress);
            setPitch(pitch);
            toast.success("Pitch Proposed successfully")
        } else {
            toast.error("Pitch Propsal failed")
        }
        setPitchProcessing(false);
    }

    const loadContribution = useCallback( async() => {
        console.log('load contribution')
        if(address && spad && spadAddress)
        {
            // const contrib = await spadService.getContribution(address, spad.currencyAddress, spadAddress);
            const contrib = await fundService.getContribution(address, spadAddress);
            setContribution(parseFloat(getFromDecimals(spad.currencyAddress, contrib)));
            console.log(contrib);
            if(contrib == 0) {
                const pitch = await pitchService.getPitch(address, spadAddress);
                setPitch(pitch);
            }
        }
    }, [address, spad, spadAddress])

    useEffect(() => {
        if(spadAddress !== undefined) {
            loadSpad()
        }
    }, [spadAddress])

    useEffect(() => {
        loadContribution();
    }, [address, spad])

    return (
        <div className="main-content">
            
            {
                spad ?
                <>
                    <h1 className="fw-bold text-center">PITCH FOR <span className="text-color">{spad.name}</span></h1>
                    
                    {
                        (spad.status == 4 && contribution == 0) ?
                        <Card className="rounded color p-4 mb-4 shadow compact">
                            <Card.Body className="text-center">
                            {
                                pitch == null ?
                                <div>
                                    Loading... {" "} <Spinner animation="border" size="sm" />
                                </div> :
                                <>
                                {
                                    pitch.status === '0' ?
                                    <div>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Name</Form.Label>
                                            <Form.Control type="text" placeholder="Name of Project" 
                                                value={name}
                                                onChange={(e) => {setErrorMsg("");setName(e.target.value)}}
                                            />
                                        </Form.Group>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Description</Form.Label>
                                            <Form.Control as="textarea" rows={5} 
                                                value={description}
                                                onChange={(e) => {setErrorMsg("");setDescription(e.target.value)}}
                                            />
                                        </Form.Group>
                                        <div className="mb-5">
                                            <label className="form-label">Token Details for Distribution (ERC20)</label>
                                            <Row className="align-items-center">
                                                <Col onChange={(e) => setTokenType(e.target.value)}>
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
                                                    <Col>
                                                        <Form.Control type="text" placeholder="Token Address" 
                                                            value={tokenAddress}
                                                            onChange={(e) => {setErrorMsg("");setTokenAddress(e.target.value)}}
                                                        />
                                                    </Col>
                                                }
                                                <Col>
                                                    <Form.Control type="number" placeholder="Token Amount" 
                                                        value={tokenAmount}
                                                        onChange={(e) => {setErrorMsg("");setTokenAmount(e.target.value)}}
                                                    />
                                                </Col>
                                            </Row>
                                        </div>
                                        {
                                            
                                            pitchProcessing ?
                                            <Button variant="color" disabled>PITCHING {" "} <Spinner animation="border" size="sm" /></Button> :
                                            <Button variant="color" onClick={handlePitch}>PITCH</Button>
                                                    
                                        }
                                    </div> :
                                    <div className="mt-3">
                                        <dl className="row text-start">
                                            <dt className="col-sm-3">Name</dt>
                                            <dd className="col-sm-9">{pitch.name}</dd>
                                        </dl>
                                        <dl className="row text-start">
                                            <dt className="col-sm-3">Description</dt>
                                            <dd className="col-sm-9">{pitch.description}</dd>
                                        </dl>
                                        <dl className="row text-start">
                                            <dt className="col-sm-3">Status</dt>
                                            <dd className="col-sm-9">
                                                {
                                                    (pitch.status === '1') ? 
                                                    <span className="text-info">Pending</span> :
                                                    <div>
                                                    {
                                                        (pitch.status === '2') ? 
                                                        <span className="text-success1">Approved</span> :
                                                        <span className="text-danger1">Rejected</span>
                                                    }
                                                    </div>
                                                }
                                            </dd>
                                        </dl>
                                    </div>
                                }
                                </>
                            } 
                            { errorMsg && 
                                <p className="text-danger1 mt-3 mb-0">{errorMsg}</p>
                            }
                            </Card.Body>
                        </Card> :
                        <div className="compact text-center">
                            <h3 className="text-danger pt-4">You Cannot Pitch for this SPAD</h3>
                        </div>
                    }
                    <SpadDetailsCard spadAddress={spadAddress} spad={spad} loadSpad={loadSpad} hideActions={true} />
                </> :
                <>
                    <h1 className="fw-bold text-center"><span className="text-color">PITCH FOR A SPAD</span></h1>
                    <SpadCardPlaceholder compact={true} />
                </>
            }
        </div>
    )
}

export default PitchSpad;