import React from 'react';
import { signOutUser } from '../firebaseFolder/authentification';
import { useNavigate } from 'react-router-dom';

const SignOutButton = () => {
  const navigate = useNavigate();
  const handleSignOut = async () => {
    try {
      await signOutUser();
      navigate('/SignIn');
      console.log('User signed out successfully');
    } catch (err) {
      console.error('Error signing out:', err.message);
    }
  };

  return (
    <button onClick={handleSignOut} className='btn-input logOut-btn'>
      Sign Out
    </button>
  );
};

export default SignOutButton;
