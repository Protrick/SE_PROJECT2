import React, { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';
import axios from 'axios';

const Login = () => {
  const [state, setstate] = useState("signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const { backendUrl, setIsLoggedin, setUserdata , getUserData } = useContext(AppContext);

  const onSubmitHandler = async (e) => {
    try {
      e.preventDefault();
      if (state === "signup") {
        const { data } = await axios.post(`${backendUrl}/api/auth/register`, {
          name,
          email,
          password
        }, { withCredentials: true });
        if (data.success) {
          setIsLoggedin(true);
          await getUserData();
          navigate('/');
          toast(data.message || 'User created successfully');
        } else {
          toast.error(data.message);
        }
      }
      else {
        const { data } = await axios.post(`${backendUrl}/api/auth/login`, {
          email,
          password
        }, { withCredentials: true });
        if (data.success) {
          setIsLoggedin(true);
          await getUserData();
          navigate('/');
          toast(data.message || 'Logged in');
        } else {
          toast.error(data.message);
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "An error occurred")
      ;
    }
  }

  return (
    <div className="app-bg page">
      <div className="container">
        <div className="card" style={{ maxWidth: 520, margin: "0 auto" }}>
          <h2 className="h1">{state === "signup" ? "Create account" : "Welcome back"}</h2>
          <p className="text-muted mt-2">
            {state === "signup"
              ? "Fill in the details to create an account."
              : "Enter your credentials to continue."}
          </p>

          <form className="col mt-4" onSubmit={onSubmitHandler}>
            {state === "signup" ? (
              <>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Name"
                  required
                  onChange={(e) => setName(e.target.value)}
                  value={name}
                />
                <input
                  type="email"
                  className="form-input"
                  placeholder="Email"
                  required
                  onChange={(e) => setEmail(e.target.value)}
                  value={email}
                />
                <input
                  type="password"
                  className="form-input"
                  placeholder="Password"
                  required
                  onChange={(e) => setPassword(e.target.value)}
                  value={password}
                />
                <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
                  <button type="submit" className="btn btn-accent">Create Account</button>
                  <button type="button" className="btn btn-primary" onClick={() => setstate("signin")}>Sign in</button>
                </div>
              </>
            ) : (
              <>
                <input
                  type="email"
                  className="form-input"
                  placeholder="Email"
                  required
                  onChange={(e) => setEmail(e.target.value)}
                  value={email}
                />
                <input
                  type="password"
                  className="form-input"
                  placeholder="Password"
                  required
                  onChange={(e) => setPassword(e.target.value)}
                  value={password}
                />
                <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
                  <p className="text-muted" style={{ cursor: "pointer" }} onClick={() => navigate('/reset-password')}>Forgot password?</p>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button type="button" className="btn btn-primary" onClick={() => setstate("signup")}>Sign up</button>
                    <button type="submit" className="btn btn-accent">Login</button>
                  </div>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}

export default Login
