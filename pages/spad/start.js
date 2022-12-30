import { useRouter } from "next/router";
import { useState } from "react";
import { Button, Card, Col, Fade, Form, FormControl, InputGroup, Row, Spinner } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { spadFactoryContract } from "../../redux/services/spad.service";
import { currencies, getDecimals } from "../../redux/services/tokens.service";
import { showConnectionPopUp } from "../../redux/slices/walletSlice";
import factoryService, { factoryContract } from "../../redux/services/factory.service";

const Start = () => {
    const [name, setName] = useState("")
    const [tokenSymbol, setTokenSymbol] = useState("")
    const [currency, setCurrency] = useState("")
    const [target, setTarget] = useState("")
    const [minInvestment, setMinInvestment] = useState("")
    const [maxInvestment, setMaxInvestment] = useState("")
    const [totalSupply, setTotalSupply] = useState("")
    const [isPrivate, setIsPrivate] = useState(false)
    const [passKey, setPassKey] = useState("")
    const [startSpadLoading, setStartSpadLoading] = useState(false)
    const [errorMsg, setErrorMsg] = useState("")
    const [tnc, setTnc] = useState(false)
    const [disclaimer, setDisclaimer] = useState(false)

    const currencyOptions = Object.keys(currencies);

    const dispatch = useDispatch()
    const address = useSelector((state) => state.wallet.address);
    const connectionStatus = useSelector((state) => state.wallet.status);

    const router = useRouter();

    const handleStartSpad = async(e) => {
        e.preventDefault();
        if(connectionStatus !== 'CONNECTED') {
            dispatch(showConnectionPopUp())
            return;
        }
        if(name === '' || tokenSymbol === '' || target === '' || minInvestment === '' || maxInvestment === '') {
            setErrorMsg("All fields are compulsory");
            return;
        }
        if(Number(minInvestment) >= Number(maxInvestment)) {
            setErrorMsg("Minimum investment amount should be less than maximum investment");
            return;
        }
        if(Number(maxInvestment) >= Number(target)) {
            setErrorMsg("Maximum investment amount should be less than SPAD size");
            return;
        }
        if(isPrivate && passKey === '') {
            setErrorMsg("Pass key is required for private SPADs");
            return;
        }
        if(!tnc || !disclaimer) {
            setErrorMsg("Please accept terms and diclaimer");
            return;
        }

        if(Number(minInvestment) < (Number(target * 1.02 / 100))) {
            setErrorMsg("Due to the limitation of 99 members per spad, we recommend the min contribution to be 1.02% of SPAD Size");
            return;
        }

        setStartSpadLoading(true);

        const currencyAddress = (currency == "") ? '0x0000000000000000000000000000000000000000' : currency;

        try {
            const newSpadResponse = await factoryContract.methods.createSpad(name, tokenSymbol, getDecimals(currency, target), getDecimals(currency, minInvestment), getDecimals(currency, maxInvestment), currencyAddress).send({
                from: address,
                value: 0
            });
            toast.success("SPAD created successfully.");
            console.log(newSpadResponse.events.SPADCreated.returnValues.spadAddress);
            // router.push({
            //     pathname: '/spad/'+newSpadResponse.events.SPADCreated.returnValues.spadAddress,
            //     query: { isNew: 1 }
            // })
        } catch (error) {
            if(error.message) {
                toast.error("SPAD creation failed." + error.message)
            } else {
                toast.error("SPAD creation failed.")
            }
            
            setStartSpadLoading(false);
        }
        // const response = await factoryService.startSpad(address, name, tokenSymbol, target, minInvestment, maxInvestment, currency);
        // if(response.status == 200) {
        //     toast.success("SPAD created successfully.")
        //     router.push({
        //         pathname: '/spad/'+response.data.events.SpadCreated.returnValues.spadAddress,
        //         query: { isNew: 1 }
        //     })
        // } else {
        //     toast.error("SPAD creation failed.")
        // }
        // setStartSpadLoading(false);
    }

    return (
        <div className="main-content">
            <div className="text-center">
                <small className="fw-bolder">LETS GET STARTED</small>
                <h1 className="fw-bold"><span className="text-color">START A SPAD</span></h1>
            </div>
            <Card className="rounded shadow mt-4 compact">
                <Card.Body className="p-5">
                    <Form>
                        <Row>
                            <Col md="8">
                                <Form.Group className="mb-4">
                                    <Form.Label>SPAD NAME</Form.Label>
                                    <Form.Control type="text" placeholder="Name your Spad (10 characters)" 
                                        id="name"
                                        value={name}
                                        onChange={
                                            (e) => {
                                                setName(e.target.value);
                                                setErrorMsg("")
                                            }
                                        }
                                        className={errorMsg != '' && name == '' ? 'error' : ''}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md="4">
                                <Form.Group className="mb-4">
                                    <Form.Label>SPAD TOKEN SYMBOL</Form.Label>
                                    <Form.Control type="text" 
                                        id="tokenSymbol"
                                        value={tokenSymbol}
                                        onChange={
                                            (e) => {
                                                setTokenSymbol(e.target.value);
                                                setErrorMsg("")
                                            }
                                        }
                                        className={errorMsg != '' && tokenSymbol == '' ? 'error' : ''}
                                    />
                                    <Form.Text muted>max 5 characters</Form.Text>
                                </Form.Group>
                            </Col>
                        </Row>
                        <Form.Group className="mb-4">
                            <Form.Label>CURRENCY</Form.Label><br />
                            {currencyOptions.map(
                                (value, i) => <Form.Check 
                                inline
                                key={i}
                                type="radio"
                                id={`default-${currencies[value].name}`}
                                label={currencies[value].name}
                                value={value}
                                name="currency"
                                onChange={
                                    (e) => {
                                        setCurrency(e.target.value);
                                        setErrorMsg("")
                                    }
                                }
                            />
                            )}
                        </Form.Group>
                        <Row>
                            <Col md="4">
                                <Form.Label>&nbsp;</Form.Label>
                                <Form.Group className="mb-4">
                                    <Form.Label>TOTAL SPAD SIZE</Form.Label>
                                    <InputGroup className="mb-3">
                                        <FormControl type="number" min="1" placeholder="100"
                                            id="target"
                                            onChange={
                                                (e) => {
                                                    setTarget(e.target.value);
                                                    setErrorMsg("")
                                                }
                                            }
                                            aria-describedby="text-target"
                                            className={errorMsg != '' && target == '' ? 'error' : ''}
                                            
                                        />
                                        <InputGroup.Text id="text-target">{currencies[currency].name}</InputGroup.Text>
                                    </InputGroup>
                                </Form.Group>
                            </Col>
                            <Col md="8" className="text-center">
                                <Form.Label className="text-dark">PARTICIPATION AMOUNT</Form.Label>
                                <Row>
                                    <Col md="6">
                                        <Form.Group className="mb-4">
                                            <Form.Label>MINIMUM</Form.Label>
                                            <InputGroup className="mb-3">
                                                <FormControl type="number" min="0.1" placeholder="0.1"
                                                    id="minInvestment"
                                                    value={minInvestment}
                                                    onChange={
                                                        (e) => {
                                                            setMinInvestment(e.target.value);
                                                            setErrorMsg("")
                                                        }
                                                    }
                                                    aria-describedby="text-minInvestment"
                                                    className={(errorMsg != '' && minInvestment == '') || errorMsg == 'Minimum investment amount should be less than maximum investment' ? 'error' : ''}
                                                />
                                                <InputGroup.Text id="text-minInvestment">{currencies[currency].name}</InputGroup.Text>
                                            </InputGroup>
                                        </Form.Group>
                                    </Col>
                                    <Col md="6">
                                        <Form.Group className="mb-4">
                                            <Form.Label>MAXIMUM</Form.Label>
                                            <InputGroup className="mb-3">
                                                <FormControl type="number" min="0.1" placeholder="5"
                                                    id="maxInvestment"
                                                    value={maxInvestment}
                                                    onChange={
                                                        (e) => {
                                                            setMaxInvestment(e.target.value);
                                                            setErrorMsg("")
                                                        }
                                                    }
                                                    aria-describedby="text-maxInvestment"
                                                    className={(errorMsg != '' && maxInvestment == '') || errorMsg == 'Maximum investment amount should be less than SPAD size' ? 'error' : ''}
                                                />
                                                <InputGroup.Text id="text-maxInvestment">{currencies[currency].name}</InputGroup.Text>
                                            </InputGroup>
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </Col>
                            
                        </Row>
                        {/* <Row className="justify-content-md-center">
                            <Col md="6">
                                <Form.Group className="mb-4 text-center">
                                    <Form.Label>TOTAL SUPPLY OF {tokenSymbol ? tokenSymbol : 'TOKEN'}</Form.Label>
                                    <Form.Control type="number" min="1" placeholder="100" 
                                        id="totalSupply"
                                        value={totalSupply}
                                        onChange={
                                            (e) => {
                                                setTotalSupply(e.target.value);
                                                setErrorMsg("")
                                            }
                                        }
                                        className={errorMsg != '' && totalSupply == '' ? 'error' : ''}
                                    />
                                </Form.Group>
                            </Col>
                        </Row> */}
                        {/* <Row>
                            <Col md="6">
                            <Form.Check 
                                type="switch"
                                id="isPrivate"
                                label="Private SPAD"
                                className="mt-2"
                                onChange={
                                    () => {
                                        setIsPrivate(!isPrivate);
                                        setErrorMsg("")
                                    }
                                }
                                defaultChecked={isPrivate}
                            />
                            </Col>
                            <Fade in={isPrivate}>
                                <Col md="6">
                                    <InputGroup className="mb-4">
                                        <InputGroup.Text id="basic-passkey">Passkey: </InputGroup.Text>
                                        <FormControl
                                            placeholder="Enter Passkey"
                                            aria-label="PassKey"
                                            aria-describedby="basic-passkey"
                                            id="passKey"
                                            value={passKey}
                                            onChange={
                                                (e) => {
                                                    setPassKey(e.target.value);
                                                    setErrorMsg("")
                                                }
                                            }
                                            className={errorMsg == 'Pass key is required for private SPADs' ? 'error': ''}
                                        />
                                    </InputGroup>
                                </Col>
                            </Fade>
                        </Row> */}
                        <Form.Group className="mb-4 text-center">
                            <Form.Label>CONTRIBUTION BY CREATOR TO ACTIVATE SPAD</Form.Label>
                            <p>
                                10% of SPAD SIZE = {" "}
                                {
                                    target !== "" ? (target / 10) : "10"
                                } {" "}
                                {currencies[currency].name}
                            </p>
                        </Form.Group>
                        <Form.Group className="mb-2">
                            <Form.Check
                                type="checkbox"
                                label="I understand, I will need to contribute 10% to activate SPAD"
                                id="tnc"
                                onChange={
                                    () => {
                                        setTnc(!tnc);
                                        setErrorMsg("")
                                    }
                                }
                                defaultChecked={tnc}
                                className={errorMsg == 'Please accept terms and diclaimer' && !tnc ? 'error' : ''}
                            />
                        </Form.Group>
                        <Form.Group className="mb-4">
                            <Form.Check
                                type="checkbox"
                                label="I declare, I am not a resident of Afgahnistan, Cuba, Crimea, Congo, Iran, Iraq, Russia, Venezuela and United States"
                                id="disclaimer"
                                onChange={
                                    () => {
                                        setDisclaimer(!disclaimer);
                                        setErrorMsg("")
                                    }
                                }
                                defaultChecked={disclaimer}
                                className={errorMsg == 'Please accept terms and diclaimer' && !disclaimer ? 'error' : ''}
                            />
                        </Form.Group>
                        
                        <div className="start-spad-actions text-center">
                            <p className="text-danger1">{errorMsg}</p>
                            {
                                startSpadLoading ?
                                <Button variant="color" disabled>Starting a SPAD <Spinner animation="border" size="sm" /></Button> :
                                <Button variant="color" onClick={handleStartSpad}>Start a SPAD</Button>
                            }
                        </div>
                    </Form>
                </Card.Body>
            </Card>
        </div>
    )
}

export default Start;