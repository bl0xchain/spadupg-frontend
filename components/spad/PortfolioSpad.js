import { ethers } from "ethers";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button, Placeholder, Spinner } from "react-bootstrap";
import { FaDotCircle } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import actionsService from "../../redux/services/actions.service";
import fundService from "../../redux/services/fund.service";
import spadService from "../../redux/services/spad.service";
import spadsService from "../../redux/services/spads.service";
import { showConnectionPopUp } from "../../redux/slices/walletSlice";
import EtherScanAddress from "../EtherScanAddress";
import ActivateSpad from "../spad/ActivateSpad";

const PortfolioSpad = ({ spadAddress, isInitiator, isPitcher }) => {
    const [spad, setSpad] = useState(null);
    const [claimProcessing, setClaimProcessing] = useState(false);
    const [isClaimed, setIsClaimed] = useState(false);

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

    const handleClaim = async () => {
        if(connectionStatus !== 'CONNECTED') {
            dispatch(showConnectionPopUp())
            return;
        }
        setClaimProcessing(true);
        const response = await actionsService.claimTokens(address, spadAddress);
        if(response.code == 200) {
            toast.success("Claimed investment for SPAD")
            fetchData();
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
                <td>
                    {spad.symbol}
                </td>
                <td>
                    <EtherScanAddress address={spadAddress} showIcon={true} />
                </td>
                <td className="text-uppercase spad-feature-list">
                    <FaDotCircle  className={spadStatus[spad.status]} /> {" "}
                    {spadStatus[spad.status]}
                </td>
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
                        <Link className="btn btn-color" href={`pitch/${spadAddress}`}>View Pitch</Link> :
                        <>
                        {
                            (spad.status == 5) ?
                            <>
                            {
                                (isClaimed > 0) ?
                                <p className="mb-0">Investment Claimed</p> :
                                <>
                                {
                                    claimProcessing ?
                                    <Button variant="color" disabled>
                                        Claiming Tokens { ' ' } <Spinner animation="border" size="sm" />
                                    </Button> :
                                    <Button variant="color" onClick={handleClaim}>
                                        Claim Tokens
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