import { Container } from "react-bootstrap"
import Link from "next/link";

const NotFound = () => {
    return (
        <Container className="main-content d-flex text-center" style={{alignItems: 'center'}}>
            <div style={{margin: "auto"}}>
                <h2 className="mb-4" style={{fontSize: '60px', fontWeight: 'bold'}}>
                    <span className=" text-color">404</span>
                </h2>
                <h3 className="mb-4">This page could not be found.</h3>
                <Link href="/" className="btn btn-color btn-lg mt-4 mb-4">
                    Go to Home Page
                </Link>
            </div>
        </Container>
    );
}

export default NotFound;