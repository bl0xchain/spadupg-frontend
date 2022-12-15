import { useState } from "react";
import { Spinner } from "react-bootstrap";
import spadService from "../../redux/services/spad.service";
import Pitch from "./Pitch";

const ViewPitches = ({ spadAddress }) => {
    const [pitchers, setPitchers] = useState(null);

    useEffect( () => {
        const fetchData = async () => {
            if(spadAddress) {
                const pitchers = await spadService.getPitchers(spadAddress);
                setPitchers(pitchers);
            }
        }
        fetchData();
    }, [spadAddress]);
    return (
        <div>
        {
            pitchers == null ?
            <div>Loading... {" "} <Spinner animation="border" size="sm" /></div> :
            <>
            {
                pitchers.length == 0 ?
                <h4 className="text-warning mt-5">No Pitch Found</h4> :
                <div className="list-group rounded shadow mb-4">
                    { pitchers && pitchers.map(function(pitcher, i) {
                        return <div className="list-group-item p-4" key={i} >
                            <Pitch spadAddress={spadAddress} pitcher={pitcher}/>
                        </div>
                    }) }
                </div>
            }
            </>
        }
        </div>
    )
}

export default ViewPitches;