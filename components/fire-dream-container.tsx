/* eslint-disable @next/next/no-img-element */
import { useRouter } from 'next/router';
import React, { ReactNode, FunctionComponent } from 'react';
import { Container, Nav, Navbar } from 'react-bootstrap';
import { Auth } from '../util/firebase-client';

type Props = {
  children?: ReactNode
}

const FireDreamContainer: FunctionComponent = ({ children }: Props) => {
  const router = useRouter();

  const logout = async () => {
    await Auth
      .signOut()
      .then(() => {
        router.push("/");
      });
  };

  return (
    <>
      <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
        <Container>
          <Navbar.Brand href="/">
            <img
              alt="logo"
              src="/firedream-logo.svg"
              width="30"
              height="30"
              className="d-inline-block align-top"
            />{' '}
            Fire Dream
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="responsive-navbar-nav" />
          <Navbar.Collapse id="responsive-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link href="/">Home</Nav.Link>
              <Nav.Link href="/charts">Charts</Nav.Link>
              <Nav.Link href="/config">Config</Nav.Link>
              <Nav.Link onClick={() => logout()}>Logout</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <div className="container-fluid p-lg-5">{children}</div>

    </>
  )

}

export default FireDreamContainer;
