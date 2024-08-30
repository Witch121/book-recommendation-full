import React, { useState, useEffect } from 'react';
import { signIn } from '../firebaseFolder/authentification';
import { auth } from "../firebaseFolder/firebase";
import { useNavigate } from 'react-router-dom';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signIn(email, password);
      navigate('/')
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    return auth.onAuthStateChanged(async (user) => {
      if (user) {
        console.log(`user: ${user.uid}`)
      } else {
        console.log("user logoff")
      }
    });
  }, []);

  return (
    <div>
      <h2>Sign In</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit} className='sign-form'>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className='btn-input'>Sign In</button>
      </form>
      <p>Don't have an account? <button onClick={() => navigate('/SignUp')} className='btn-input additiona-btn'>Sign Up</button></p>
    </div>
  );
};

export default SignIn;
