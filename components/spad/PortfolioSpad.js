import { ethers } from "ethers";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button, Placeholder, Spinner } from "react-bootstrap";
import { FaDotCircle } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import actionsService from "../../redux/services/actions.service";
import fundService from "../../redux/services/fund.service";
import pitchService from "../../redux/services/pitch.service";
import spadService from "../../redux/services/spad.service";
import spadsService from "../../redux/services/spads.service";
import { showConnectionPopUp } from "../../redux/slices/walletSlice";
import EtherScanAddress from "../EtherScanAddress";
import ActivateSpad from "../spad/ActivateSpad";

const PortfolioSpad = ({ spadAddress, isInitiator, isPitcher }) => {
    const [spad, setSpad] = useState(null);
    const [claimProcessing, setClaimProcessing] = useState(false);
    const [isClaimed, setIsClaimed] = useState(false);
    const [pitch, setPitch] = useState(null);

    const dispatch = useDispatch()
    const address = useSelector((state) => state.wallet.address);
    const connectionStatus = useSelector((state) => state.wallet.status);

    const spadStatus = {
        1: 'pending',
        2: 'open',
        3: 'expired',
        4: 'closed',
        5: 'acquired'
    }

    const pitchStatus = {
        0: 'invalid',
        1: 'proposed',
        2: 'approved',
        3: 'rejected',
        4: 'selected',
    }

    const handleClaim = async () => {
        if(connectionStatus !== 'CONNECTED') {
            dispatch(showConnectionPopUp())
            return;
        }
        setClaimProcessing(true);
        const response = await actionsService.claimTokens(address, spadAddress);
        if(response.code == 200) {
            toast.success("Claimed investment for SPAD")
            const isClaimed = await fundService.isInvestmentClaimed(address, spadAddress);
            setIsClaimed(isClaimed);
        } else {
            toast.error("Problem with claiming investment for SPAD")
        }
        setClaimProcessing(false);
    }

    const loadSpad = async() => {
        const spadDetails = await spadsService.getSpadDetails(spadAddress, true);
        setSpad(spadDetails);
        
        if(spadDetails.status == 5) {
            const isClaimed = await fundService.isInvestmentClaimed(address, spadAddress);
            setIsClaimed(isClaimed);
        }
        
        if(isPitcher) {
            const pitch1 = await pitchService.getPitch(address, spadAddress);
            setPitch(pitch1);
        }
    }

    useEffect(() => {
        if(spadAddress && address) {
            loadSpad();
        }
    }, [spadAddress, address])

    return (
        <tr>
        {
            spad !== null ?
            <>
                <td>
                    <Link href={"/spad/"+spadAddress}>
                        {spad.name}
                    </Link>
                </td>
                {
                    ! isPitcher &&
                    <td>
                        {spad.symbol}
                    </td>
                }
                
                <td>
                    <EtherScanAddress address={spadAddress} showIcon={true} />
                </td>
                <td className="text-uppercase spad-feature-list">
                    <FaDotCircle  className={spadStatus[spad.status]} /> {" "}
                    {spadStatus[spad.status]}
                </td>
                {
                    (isPitcher && pitch) &&
                    <td className="text-uppercase">
                        {pitchStatus[pitch.status]}
                    </td>
                }
                <td>
                {
                    isInitiator ?
                    <>
                    {
                        (spad.status == 1) ? 
                        <ActivateSpad spadAddress={spadAddress} spad={spad} loadSpad={loadSpad} />
                        :
                        <Link href={"/spad/"+spadAddress+"/pitches"} className="btn btn-color">
                            View Pitches
                        </Link>
                    }
                    </> :
                    <>
                    {
                        isPitcher ?
                        <Link className="btn btn-color" href={`pitch/${spadAddress}`}>
                            {
                            (pitch && pitch.status == 4) ?
                                <>Transfer {pitch.tokenSymbol} & claim</> :
                                <>View Pitch</>
                            }
                            
                        </Link> :
                        <>
                        {
                            (spad.status == 5) ?
                            <>
                            {
                                (isClaimed > 0) ?
                                <p className="mb-0">{ spad.pitch.tokenSymbol } {" "} Tokens Claimed</p> :
                                <>
                                {
                                    claimProcessing ?
                                    <Button variant="color" disabled>
                                        Claiming { spad.pitch.tokenSymbol } {" "} Tokens { ' ' } <Spinner animation="border" size="sm" />
                                    </Button> :
                                    <Button variant="color" onClick={handleClaim}>
                                        Claim { spad.pitch.tokenSymbol } {" "} Tokens
                                    </Button>   
                                }
                                </>
                            }
                            </>
                            :
                            <p className="mb-0">Cannot Claim yet</p>
                        }
                        </>
                    }
                    
                    </>
                }
                </td>
            </> :
            <>
                { [1,2,3,4].map(function(spadAddress, i) {
                    return <td key={i}>
                        <Placeholder as="p" animation="glow">
                            <Placeholder xs={12} />
                        </Placeholder>
                    </td>
                }) } 
                <td>
                    <Placeholder as="p" animation="glow">
                        <Placeholder.Button variant="color" xs={12} />
                    </Placeholder>
                </td>
            </>
        }
        </tr>
    )
}

export default PortfolioSpad;