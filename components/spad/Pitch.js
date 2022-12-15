import { useState } from "react";
import { Button, Spinner } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import spadService from "../../redux/services/spad.service";
import { showConnectionPopUp } from "../../redux/slices/walletSlice";

const Pitch = ({ spadAddress, pitcher }) => {
    const [pitch, setPitch] = useState(null);
    const [review, setReview] = useState("");
    const [pitchReviewProcessing, setPitchReviewProcessing] = useState(false);

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
        const response = await spadService.pitchApproval(address, spadAddress, pitcher, approval)
        if(response.code == 200) {
            toast.success("Pitch review completed")
            fetchPitch();
        } else {
            toast.error("Pitch review failed")
        }
        setPitchReviewProcessing(false);
    }

    const fetchPitch = async () => {
        const pitch = await spadService.getPitch(pitcher, spadAddress);
        setPitch(pitch);
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
                <small className="text-muted">{props.pitcher}</small>
                <p className="mb-0 mt-3">{pitch.description}</p>
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
                        <p className="text-danger1">Rejected</p>
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