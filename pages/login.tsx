import { NextPage } from "next";
import React, { useState } from "react";
import { Container } from "react-bootstrap";
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "../util/firebase-client";

const Login: NextPage = (_props: any) => {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');

  const signUp = async () => {
    await createUserWithEmailAndPassword(Auth, email, pass);
    window.location.href = '/';
  }
  const signIn = async (e:any) => {
    e.preventDefault();
    await signInWithEmailAndPassword(Auth, email, pass);
    window.location.href = '/';
  }

  return (
    <Container>
      <div className="row">
        <div className="col-8 offset-2">
          <form>
            <div className="form-group mt-5">
              <label htmlFor="exampleInputEmail1">Email address</label>
              <input type="email" className="form-control" id="exampleInputEmail1" value={email}
                onChange={(e) => setEmail(e.target.value)} aria-describedby="emailHelp" placeholder="Enter email" />
            </div>
            <div className="form-group mt-4">
              <label htmlFor="exampleInputPassword1">Password</label>
              <input type="password" className="form-control" id="exampleInputPassword1" value={pass}
                onChange={(e) => setPass(e.target.value)} placeholder="Password" />
            </div>
            <button type="submit" onClick={signIn} className="mt-5 btn btn-lg btn-dark">Submit</button>
          </form>
        </div>
      </div>
    </Container>
  );
};

export default Login;