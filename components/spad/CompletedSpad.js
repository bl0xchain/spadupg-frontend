import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import fundService from "../../redux/services/fund.service";
import { getFromDecimals } from "../../redux/services/tokens.service";
import EtherScanAddress from "../EtherScanAddress";
import ViewPitches from "./ViewPitches";

const CompletedSpad = ({ spadAddress, spad }) => {
    const [contribution, setContribution] = useState(0);

    const address = useSelector((state) => state.wallet.address);

    const loadContribution = async () => {
        const amount = await fundService.getContribution(address, spadAddress);
        setContribution(parseFloat(getFromDecimals(spad.currencyAddress, amount)));
    }

    useEffect(() => {
        loadContribution();
    }, [address])

    return (
        <div className='compact'>
        {
            spad &&
            <>
            {
                spad.creator == address ?
                <ViewPitches spadAddress={spadAddress} /> :
                <>
                {
                    contribution > 0 &&
                    <p className="fw-bold py-4 text-center">SPAD Creator <span className="text-color"><EtherScanAddress address={spad.creator} showIcon={true} /></span> is reviewing the PITCHES for your SPAD</p>
                 }
                </>
                
            }
            </>
        }    
        </div>
    );
}

export default CompletedSpad;