/* eslint-disable @next/next/no-img-element */
import { useRouter } from 'next/router';
import React, { ReactNode, FunctionComponent } from 'react';
import { Breadcrumb, Container, Nav, Navbar, NavDropdown } from 'react-bootstrap';
import { Wallet } from '../types';
import { Auth } from '../util/firebase-client';

type Props = {
  children?: ReactNode
  breadcrumbItems?: { label: string, url: string }[]
  wallets?: Wallet[]
}

const FireDreamContainer: FunctionComponent<{ breadcrumbItems?: { label: string, url: string }[], wallets?: Wallet[] }> = ({ children, breadcrumbItems = [], wallets = [] }: Props) => {
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
              {wallets.length &&
                <NavDropdown title="Wallets" id="basic-nav-dropdown">
                  {wallets.map((wallet:Wallet) => <NavDropdown.Item key={wallet.id} href={'wallet/' + wallet.id}>{wallet.label}</NavDropdown.Item>)}
                </NavDropdown>
              }
              <Nav.Link href="/charts">Charts</Nav.Link>
              <Nav.Link href="/assets-values">Values</Nav.Link>
              <Nav.Link href="/config">Config</Nav.Link>
              <Nav.Link onClick={() => logout()}>Logout</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <div className="container-fluid p-lg-5">
        <div className="row">
          <div className="col-lg-10 offset-lg-1">
            <Breadcrumb>
              <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
              {breadcrumbItems.map((b, i) => (<Breadcrumb.Item key={i} href={b.url}>{b.label}</Breadcrumb.Item>))}
            </Breadcrumb>
          </div>
        </div>
        {children}
      </div>

    </>
  )

}

export default FireDreamContainer;
