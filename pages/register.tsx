import { NextPage } from "next";
import React, { useState } from "react";
import { Container } from "react-bootstrap";
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "../util/firebase-client";

const Register: NextPage = (_props: any) => {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');

  const signUp = async (e: any) => {
    e.preventDefault();
    await createUserWithEmailAndPassword(Auth, email, pass);
    window.location.href = '/';
  }

  return (
    <Container>
      <div className="row">
        <div className="col-8 offset-2">
          <form>
            <div className="form-group mt-5">
              <label>Email address</label>
              <input type="email" className="form-control" value={email}
                onChange={(e) => setEmail(e.target.value)} aria-describedby="emailHelp" placeholder="Enter email" />
            </div>
            <div className="form-group mt-4">
              <label>Password</label>
              <input type="password" className="form-control" value={pass}
                onChange={(e) => setPass(e.target.value)} placeholder="Password" />
            </div>
            <div className="form-group mt-4">
              <label>Retype Password</label>
              <input type="password" className="form-control" placeholder="Retype Password" />
            </div>
            <button type="submit" onClick={signUp} className="mt-5 btn btn-lg btn-dark">Register</button>
          </form>
        </div>
      </div>
    </Container>
  );
};

export default Register;