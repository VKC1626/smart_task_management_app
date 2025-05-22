import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const sampleUser = {
    id: "user123@mail.com",
    password: "pass123",
  };

  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent normal form submission
    console.log("handel submit");

    if (userId === sampleUser.id && password === sampleUser.password) {
      setError("");
      navigate("/dashboard"); // React router navigation on success
    } else {
      setError("Invalid user ID or password");
    }
  };

  return (
    <div className="login_form">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-outline mb-4">
          <input
            type="email"
            id="form2Example1"
            className="form-control"
            value={userId} // Controlled input
            onChange={(e) => setUserId(e.target.value)}
            required
          />
          <label className="form-label" htmlFor="form2Example1">
            Email address
          </label>
        </div>

        <div className="form-outline mb-4">
          <input
            type="password"
            id="form2Example2"
            className="form-control"
            value={password} // Controlled input
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <label className="form-label" htmlFor="form2Example2">
            Password
          </label>
        </div>

        <div className="row mb-4">
          <div className="col d-flex justify-content-center">
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                value=""
                id="form2Example31"
                checked
                readOnly
              />
              <label className="form-check-label" htmlFor="form2Example31">
                Remember me
              </label>
            </div>
          </div>

          <div className="col">
            <a href="#!">Forgot password?</a>
          </div>
        </div>

        <button type="submit" className="btn btn-primary btn-block mb-4">
          Sign in
        </button>

        <div className="text-center">
          <p>
            Not a member? <Link to="/register">Register here</Link>
          </p>
          <p>or sign up with:</p>
          {/* Social buttons */}
        </div>

        {error && (
          <div className="alert alert-danger mt-2" role="alert">
            {error}
          </div>
        )}
      </form>
    </div>
  );
}

export default Login;
