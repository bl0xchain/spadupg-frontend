import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Forbidden from "../../../components/Forbidden";
import SpadCardPlaceholder from "../../../components/spad/SpadCardPlaceholder";
import SpadDetailsCard from "../../../components/spad/SpadDetailsCard";
import ViewPitches from "../../../components/spad/ViewPitches";
import spadService from "../../../redux/services/spad.service";
import spadsService from "../../../redux/services/spads.service";

const SpadPitches = () => {
    const router = useRouter()
    const { spadAddress } = router.query

    const [spad, setSpad] = useState(null);

    const address = useSelector((state) => state.wallet.address);

    const loadSpad = async() => {
        const spadDetails = await spadsService.getSpadDetails(spadAddress, true);
        setSpad(spadDetails);
    }

    useEffect(() => {
        if(spadAddress) {
            loadSpad();
        }
    }, [spadAddress]);

    return (
        <div className="main-content">
        {
            spad ?
            <>
            {
                spad.creator === address ?
                <>
                    <SpadDetailsCard spadAddress={spadAddress} spad={spad} loadSpad={loadSpad} />
                    <hr className='mb-4' />
                    <div className='compact'>
                        <h2 className="fw-bold mb-4">PITCHES</h2>
                        <ViewPitches spadAddress={spadAddress} />
                    </div>
                </> :
                <Forbidden />
            }
            </> :
            <SpadCardPlaceholder compact={true} />
        }
        </div>
    )
}

export default SpadPitches;