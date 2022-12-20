import Link from "next/link";
import { FaExternalLinkAlt } from "react-icons/fa";
import { getShortAddress } from "../redux/utils";

const EtherScanAddress = ({ address, showIcon, text }) => {
    return (
        <Link href={`https://goerli.etherscan.io/address/${address}`} target="_blank">
            {
                text ?
                <>{text}</> :
                <>{ getShortAddress(address) }</>
            }
            {" "}
            { showIcon && <FaExternalLinkAlt /> }
        </Link>
    )
}

export default EtherScanAddress;