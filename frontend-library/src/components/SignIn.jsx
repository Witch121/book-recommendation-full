import React, { useState} from 'react';
import { signIn } from '../firebaseFolder/authentification';
import { useNavigate } from 'react-router-dom';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); 
    setError('');
  
    try {
      const signInSuccess = await signIn(email, password);
  
      if (signInSuccess) {
        navigate('/');
      } else {
        setError('Email and/or password incorrect, please check the accuracy.');
      }
    }  catch (err) {
      console.error("Error signing in:", err);  // Log the error for debugging
      setError('An unexpected error occurred. Please try again later.');
    } finally {
      setLoading(false); 
    }
  };

  return (
    <div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit} className='pure-form pure-form-stacked'>
        <fieldset>
        <legend><h2>Sign In</h2></legend>
        <div className="pure-u-1 pure-u-md-1-3">
          <label for="signUp_email">Email</label>
          <input
            id='signUp_email'
            className='pure-u-23-24'
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="pure-u-1 pure-u-md-1-3">
          <label for="signUp_password">Password</label>
          <input
            id='signUp_password'
            className='signUp_input'
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div><br/>
          <button type="submit" className='btn-input' disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </fieldset>
      </form>
      <p>
        Don't have an account?{' '}
        <button
          onClick={() => navigate('/SignUp')}
          className="btn-input additional-btn"
        >
          Sign Up
        </button>
      </p>

      {error === 'No user found with this email. Would you like to sign up?' && (
        <button onClick={() => navigate('/SignUp')} className="btn-input additional-btn">
          Sign Up
        </button>
      )}
    </div>
  );
};

export default SignIn;
