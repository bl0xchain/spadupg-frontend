import { useEffect, useState } from "react";
import { Card, Container, Table } from "react-bootstrap";
import { FaExclamationTriangle } from "react-icons/fa";
import { useSelector } from "react-redux";
import spadService from "../redux/services/spad.service";
import Wallet from "../components/Wallet";
import PortfolioSpad from "../components/spad/PortfolioSpad";
import styles from '../styles/Portfolio.module.css'
import factoryService from "../redux/services/factory.service";
import actionsService from "../redux/services/actions.service";

const Portfolio = () => {
    const [createdSpads, setCreatedSpads] = useState([])
    const [investedSpads, setInvestedSpads] = useState([])
    const [pitchedSpads, setPitchedSpads] = useState([])
    const [privateSpads, setPrivateSpads] = useState([])

    const address = useSelector((state) => state.wallet.address);

    useEffect(()=> {
        async function fetchData() {
            const spadAddresses = await factoryService.getCreatedSpads(address);
            setCreatedSpads(spadAddresses);
            const spadAddresses1 = await actionsService.getContributedSpads(address);
            setInvestedSpads(spadAddresses1);
            const spadAddresses2 = await actionsService.getPitchedSpads(address);
            setPitchedSpads(spadAddresses2);
            const spadAddresses3 = await factoryService.getCreatedPrivateSpads(address);
            setPrivateSpads(spadAddresses3);
        }

        if(address !== '') {
            fetchData();
        }

    }, [address])

    return (
        <>
            {
                address === '' ?
                <Container className="main-content align-items-center d-flex">
                    <div className="text-center" style={{width: '100%', marginBottom: '100px;'}}>
                        <h2 className="mb-3">Please connect wallet</h2>
                        <Wallet />
                    </div> 
                </Container>: 
                <Container className="main-content">
                    {
                        (investedSpads.length > 0) &&
                        <Card className="rounded color fw-bold p-4 mb-4 shadow compact">
                            <h2 className={styles.Title}>PORTFOLIO</h2>
                            <Table borderless className='align-middle mb-4'>
                                <thead>
                                    <tr className="text-secondary1">
                                        <th>SPAD NAME</th>
                                        <th>TOKEN SYMBOL</th>
                                        <th>ADDRESS</th>
                                        <th>STATUS</th>
                                        <th>CLAIM</th>
                                    </tr>
                                </thead>
                                <tbody>
                                { investedSpads.map(function(spadAddress, i) {
                                    return <PortfolioSpad spadAddress={spadAddress} key={i} isInitiator={false} />
                                })
                                }
                                </tbody>
                            </Table>
                        </Card>
                    }
                    {
                        (createdSpads.length > 0) &&
                        <Card className="rounded color fw-bold p-4 mb-4 shadow compact">
                            <h2 className="fw-bold text-center">CREATED SPADs</h2>
                            <Table borderless className='align-middle mb-4'>
                                <thead>
                                    <tr className="text-secondary1">
                                        <th>SPAD NAME</th>
                                        <th>SPAD SYMBOL</th>
                                        <th>ADDRESS</th>
                                        <th>STATUS</th>
                                        <th>ACTIONS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                { createdSpads.map(function(spadAddress, i) {
                                    return <PortfolioSpad spadAddress={spadAddress} key={i} isInitiator={true} />
                                })
                                }
                                </tbody>
                            </Table>
                        </Card>
                    }
                    {
                        (privateSpads.length > 0) &&
                        <Card className="rounded color fw-bold p-4 mb-4 shadow compact">
                            <h2 className="fw-bold text-center">Your Private SPADs</h2>
                            <Table borderless className='align-middle mb-4'>
                                <thead>
                                    <tr className="text-secondary1">
                                        <th>SPAD NAME</th>
                                        <th>SPAD SYMBOL</th>
                                        <th>ADDRESS</th>
                                        <th>STATUS</th>
                                        <th>ACTIONS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                { privateSpads.map(function(spadAddress, i) {
                                    return <PortfolioSpad spadAddress={spadAddress} key={i} isInitiator={true} />
                                })
                                }
                                </tbody>
                            </Table>
                        </Card>
                    }
                    {
                        (pitchedSpads.length > 0) &&
                        <Card className="rounded color fw-bold p-4 mb-4 shadow compact">
                            <h2 className="fw-bold text-center">PITCHED SPADs</h2>
                            <Table borderless className='align-middle mb-4'>
                                <thead>
                                    <tr className="text-secondary1">
                                        <th>SPAD NAME</th>
                                        <th>SPAD SYMBOL</th>
                                        <th>ADDRESS</th>
                                        <th>STATUS</th>
                                        <th>PITCHES</th>
                                    </tr>
                                </thead>
                                <tbody>
                                { pitchedSpads.map(function(spadAddress, i) {
                                    return <PortfolioSpad spadAddress={spadAddress} key={i} isPitcher={true} />
                                })
                                }
                                </tbody>
                            </Table>
                        </Card>
                    }
                    {
                        (investedSpads.length === 0 && createdSpads.length === 0 && pitchedSpads.length === 0 && privateSpads.length == 0) &&
                        <div className="text-center mt-0">
                            <FaExclamationTriangle className="fs-1 text-warning mb-3 mt-5" />
                            <h2>
                                You do not have SPAD in your portfolio
                            </h2>
                        </div>
                    }
                </Container> 
            }
        </>
    )
}

export default Portfolio;