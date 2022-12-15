import Link from "next/link";
import { useEffect, useState } from "react";
import { Button, Spinner } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import spadService from "../../redux/services/spad.service";
import tokensService from "../../redux/services/tokens.service";
import { showConnectionPopUp } from "../../redux/slices/walletSlice";
import { getShortAddress } from "../../redux/utils";
import ActivateSpad from "./ActivateSpad";
import Contribute from "./Contribute";

const SpadActions = ({ spadAddress, spad, loadSpad }) => {
    const dispatch = useDispatch()
    const address = useSelector((state) => state.wallet.address);
    const connectionStatus = useSelector((state) => state.wallet.status);

    const [contribution, setContribution] = useState("");

    const [isClaimed, setIsClaimed] = useState(false);
    const [claimProcessing, setClaimProcessing] = useState(false);
    const [claimedTokens, setClaimedTokens] = useState(0);

    const fetchData = async() => {
        const contrib = await spadService.getContribution(address, spad.currencyAddress, spadAddress);
        setContribution(contrib);
        if(spad.status == 5 && contrib > 0) {
            const isClaimed = await spadService.isInvestmentClaimed(address, spadAddress);
            setIsClaimed(isClaimed);
            if(isClaimed) {
                const tokenBalance = await tokensService.getTokenBalance(address, spad.tokenAddress, spad.currencyAddress);
                setClaimedTokens(tokenBalance);
            }
        }
    }

    const handleClaim = async () => {
        if(connectionStatus !== 'CONNECTED') {
            dispatch(showConnectionPopUp())
            return;
        }
        setClaimProcessing(true);
        const response = await spadService.claimInvestment(address, spadAddress);
        if(response.code == 200) {
            toast.success("Claimed investment for SPAD")
            loadSpad();
        } else {
            toast.error("Problem with claiming investment for SPAD")
        }
        setClaimProcessing(false);
    }

    useEffect(() => {
        if(address !== '') {
            fetchData();
        }
    }, [address]);

    return (
        <div className="spad-actions text-center">
        {
            spad.status === "1" ?
            <>
            {
                spad.spadInitiator === address ?
                <ActivateSpad spadAddress={spadAddress} spad={spad} loadSpad={loadSpad} /> :
                <p className="mb-0 text-warning">SPAD is not yet activated</p>
            }
            </> :
            <>
            {
                spad.status === "2" ?
                <Contribute spadAddress={spadAddress} spad={spad} loadSpad={loadSpad} /> :
                <>
                {
                    spad.status === "4" ?
                    <>
                    {
                        contribution === 0 ?
                        <Link href={"/pitch/"+spadAddress} className="btn btn-color">PITCH</Link> :
                        <>
                            <div className="fw-bold text-secondary1">YOUR CONTRIBUTION</div>
                            <p className="fw-bold fs-5">{contribution} {" "} {spad.investmentCurrency}</p>
                        </>
                    }
                    </> :
                    <>
                    {
                        spad.status === "5" &&
                        <>
                            <div className="text-secondary1 fw-bold">ACQUIRED BY</div>
                            <p className="fw-bold fs-5">
                                <Link href={"https://goerli.etherscan.io/address/"+spad.acquiredBy} target="_blank">
                                {
                                    spad.acquiredBy === address ?
                                    <>YOU</> :
                                    <> { getShortAddress(spad.acquiredBy) } </>
                                }
                                </Link>
                            </p>
                        </>
                    }
                    {
                        contribution > 0 &&
                        <>
                        {
                            isClaimed ?
                            <p className="text-success1 mb-0">You have claimed your <b>{claimedTokens} {" "} {spad.symbol}</b> tokens </p> :
                            <div>
                            {
                                claimProcessing ?
                                <Button variant="color" disabled>
                                    Claiming Tokens { ' ' } <Spinner animation="border" size="sm" />
                                </Button> :
                                <Button variant="color" onClick={handleClaim}>
                                    Claim Tokens
                                </Button>   
                            }
                            </div>
                        }
                        </>
                    }
                    </>
                }
                </>
            }
            </>
        }
        </div>
    )
}

export default SpadActions;