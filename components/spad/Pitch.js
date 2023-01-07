import { useEffect, useState } from "react";
import { Button, Spinner } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import actionsService from "../../redux/services/actions.service";
import pitchService from "../../redux/services/pitch.service";
import spadService from "../../redux/services/spad.service";
import spadsService from "../../redux/services/spads.service";
import { showConnectionPopUp } from "../../redux/slices/walletSlice";
import EtherScanAddress from "../EtherScanAddress";

const Pitch = ({ spadAddress, pitcher }) => {
    const [pitch, setPitch] = useState(null);
    const [review, setReview] = useState("");
    const [pitchReviewProcessing, setPitchReviewProcessing] = useState(false);
    const [spadDetails, setSpadDetails] = useState(null);

    const dispatch = useDispatch()
    const address = useSelector((state) => state.wallet.address);
    const connectionStatus = useSelector((state) => state.wallet.status);

    const handleApproval = async (approval) => {
        if(connectionStatus !== 'CONNECTED') {
            dispatch(showConnectionPopUp())
            return;
        }
        setPitchReviewProcessing(true);
        setReview(approval);
        const response = await actionsService.pitchReview(address, spadAddress, pitcher, approval)
        if(response.code == 200) {
            toast.success("Pitch review completed")
            fetchPitch();
        } else {
            toast.error("Pitch review failed")
        }
        setPitchReviewProcessing(false);
    }

    const fetchPitch = async () => {
        const pitchData = await pitchService.getPitch(pitcher, spadAddress);
        
        if(pitchData.tokenName == "") {
            const spadContract = spadsService.getSpadContract(spadAddress);
            pitchData.tokenName = await spadContract.methods.name().call(); 
            pitchData.tokenSymbol = await spadContract.methods.symbol().call();
            pitchData.tokenAddress = "";
        }
        setPitch(pitchData);
    }

    useEffect(() => {
        if(pitcher) {
            fetchPitch();
        }
    }, [pitcher]);

    return (
        <div>
        {
            pitch ?
            <>
                <h5 className="mb-0">{pitch.name}</h5>
                <small className="text-muted">{pitcher}</small>
                <p className="mt-3">{pitch.description}</p>
                <div>
                    <p>
                        <b>Token:</b> {pitch.amount} {pitch.tokenSymbol} {"  "} 
                        (
                            {
                                pitch.tokenAddress == "" ?
                                <>{pitch.tokenName}</> :
                                <EtherScanAddress address={pitch.tokenAddress} showIcon={true} text={pitch.tokenName} />
                            }
                        )
                    </p>
                </div>
                <div className="mt-3">
                {
                    pitch.status === '1' ?
                    <>
                        <p className="text-info">Pending</p>
                        {
                            pitchReviewProcessing ?
                            <>
                            {
                                review ? 
                                <Button variant="color" size="sm" disabled>
                                    Approving Pitch {' '} <Spinner animation="border" size="sm" />
                                </Button> :
                                <Button variant="secondary" size="sm" disabled>
                                    Rejecting Pitch {' '} <Spinner animation="border" size="sm" />
                                </Button>
                            }
                            </> :
                            <div>
                                <Button variant="color" size="sm" onClick={()=>handleApproval(true)}>
                                    Approve Pitch
                                </Button>{' '}
                                <Button variant="secondary" size="sm" onClick={()=>handleApproval(false)}>
                                    Reject Pitch
                                </Button> 
                            </div>
                        }
                    </> :
                    <>
                    {
                        (pitch.status === '2') ? 
                        <p className="text-success1">Approved</p> :
                        <>
                        {
                            (pitch.status === '3') ? 
                            <p className="text-danger1">Rejected</p> :
                            <p className="text-warning">Selected</p>
                        }
                        </>
                        
                    }
                    </>
                }
                </div>
            </> :
            <div>Loading... {" "} <Spinner animation="border" size="sm" /></div>
        }
        </div>
    )
}

export default Pitch;