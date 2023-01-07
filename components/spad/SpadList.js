import { useEffect, useState } from "react";
import { Col, Row } from "react-bootstrap";
import { actionsContract } from "../../redux/services/actions.service";
import factoryService from "../../redux/services/factory.service";
import spadsService from "../../redux/services/spads.service";
// import spadService from "../../redux/services/spad.service";
import SpadCard from "./SpadCard";
import SpadCardPlaceholder from "./SpadCardPlaceholder";

const SpadList = () => {
    const [spadAddresses, setSpadAddresses] = useState(null)
    const [loading, setLoading] = useState(true)

    const loadSpadAddresses = async() => {
        setLoading(true);
        const addresses = await factoryService.getAllSpads();
        setSpadAddresses(addresses);
        setLoading(false);
    }

    useEffect(() => {
        loadSpadAddresses();
    }, [])

    return (
        <Row className="mt-5 view-spads">
        {
            loading ? 
            <>
                { [1,2,3].map(function(i) {
                    return <Col xl="4" lg="6" md="6" key={i}>
                        <SpadCardPlaceholder />
                    </Col>
                }) }
            </> :
            <>
                { spadAddresses.map(function(spadAddress, i) {
                    return <Col xl="4" lg="6" md="6" key={i}>
                        <SpadCard spadAddress={spadAddress} />
                    </Col>
                }) }
            </>
        }
        </Row>
    )
}

export default SpadList;