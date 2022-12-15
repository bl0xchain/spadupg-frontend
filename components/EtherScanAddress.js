import Link from "next/link";
import { FaExternalLinkAlt } from "react-icons/fa";
import { getShortAddress } from "../redux/utils";

const EtherScanAddress = ({ address, showIcon }) => {
    return (
        <Link href={`https://goerli.etherscan.io/address/${address}`} target="_blank">
            { getShortAddress(address) } {" "}
            { showIcon && <FaExternalLinkAlt /> }
        </Link>
    )
}

export default EtherScanAddress;