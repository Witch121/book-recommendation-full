import React, { useState } from 'react';
import { signUp } from '../firebaseFolder/authentification';
import { useNavigate } from 'react-router-dom';

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const signUpSuccess = await signUp(email, password, username);

      if (signUpSuccess) {
        navigate('/');
      } else {
        setError('User with this email already exists. Please sign in.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit} className='pure-form pure-form-stacked'>
        <fieldset>
          <legend><h2>Sign Up</h2></legend>
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
          </div>
          <div className="pure-u-1 pure-u-md-1-3">
            <label for="signUp_userName">User Name</label>
            <input 
              id='signUp_userName'
              className='signUp_input'
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>    
            <button type="submit" className='btn-input' disabled={loading}>
              {loading ? 'Signing Up...' : 'Sign Up'}
            </button>
        </fieldset>
      </form>
    </div>
  );
};

export default SignUp;
