import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { Container, Nav, Navbar } from "react-bootstrap";
import Wallet from "../Wallet";
// import Wallet from "../Wallet";

const Header = () => {
    const router = useRouter();
    return (
        <Navbar expand="lg">
            <Container>
                <Link className="navbar-brand" href="/">
                    <Image src="/spad-logo.png" alt="SPAD Logo" width={42} height={42} />
                    <span className="logo-text text-color">PAD</span>
                </Link>
                <Nav id="main-menu" className="justify-content-center fw-bolder">
                    <Link href="/spad/start" className={router.pathname == "/spad/start" ? "nav-link text-color" : "nav-link"}>
                        Start SPAD
                    </Link>
                    <Link href="/view-spads" className={router.pathname == "/view-spads" ? "nav-link text-color" : "nav-link"}>
                        View SPADs
                    </Link>
                    <Link href="/portfolio" className={router.pathname == "/portfolio" ? "nav-link text-color" : "nav-link"}>
                        Portfolio
                    </Link>
                </Nav>
                <Nav id="nav-wallet">
                    <Wallet />
                </Nav>
            </Container>
        </Navbar>
    )
}

export default Header;