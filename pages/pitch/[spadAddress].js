import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Button, Card, Form, Spinner } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import SpadCardPlaceholder from "../../components/spad/SpadCardPlaceholder";
import SpadDetailsCard from "../../components/spad/SpadDetailsCard";
import spadService from "../../redux/services/spad.service";
import { showConnectionPopUp } from "../../redux/slices/walletSlice";

const PitchSpad = () => {
    const router = useRouter()
    const { spadAddress } = router.query

    const [spad, setSpad] = useState(null);
    const [contribution, setContribution] = useState(0);
    const [pitch, setPitch] = useState(null);

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [errorMsg, setErrorMsg] = useState("");
    const [pitchProcessing, setPitchProcessing] = useState(false);

    const dispatch = useDispatch()
    const address = useSelector((state) => state.wallet.address);
    const connectionStatus = useSelector((state) => state.wallet.status);

    const loadSpad = async() => {
        const spadDetails = await spadService.getSpadDetails(spadAddress);
        setSpad(spadDetails);
        const contrib = await spadService.getContribution(address, spadDetails.currencyAddress, spadAddress);
        setContribution(contrib);
        if(contrib === 0) {
            const pitch = await spadService.getPitch(address, spadAddress);
            setPitch(pitch);
        }
    }

    const handlePitch = async () => {
        setErrorMsg("");
        if(connectionStatus !== 'CONNECTED') {
            dispatch(showConnectionPopUp())
            return;
        }
        setPitchProcessing(true);
        if(name === '' || description === '') {
            setErrorMsg("All fields are compulsory");
            setPitchProcessing(false);
            return;
        }

        const response = spadService.pitchForSPAD(address, spadAddress, name, description);
        if(response.code == 200) {
            const pitch = await spadService.getPitch(address, spadAddress);
            setPitch(pitch);
            toast.success("Pitch Proposed successfully")
        } else {
            toast.error("Pitch Propsal failed")
        }
        setPitchProcessing(false);
    }

    useEffect(() => {
        if(spadAddress !== undefined) {
            loadSpad()
        }
    }, [spadAddress])

    return (
        <div className="main-content">
            <h1 className="fw-bold text-center"><span className="text-color">PITCH FOR A SPAD</span></h1>
            {
                spad ?
                <>
                    <SpadDetailsCard spadAddress={spadAddress} spad={spad} loadSpad={loadSpad} />
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
                </> :
                <SpadCardPlaceholder compact={true} />
            }
        </div>
    )
}

export default PitchSpad;