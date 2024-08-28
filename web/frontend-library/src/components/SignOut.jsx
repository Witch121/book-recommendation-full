import React from 'react';
import { signOutUser } from '../firebaseFolder/authentification';

const SignOutButton = () => {
  const handleSignOut = async () => {
    try {
      await signOutUser();
      console.log('User signed out successfully');
      //redirect or update state here to reflect the signed-out user
    } catch (err) {
      console.error('Error signing out:', err.message);
    }
  };

  return (
    <button onClick={handleSignOut}>
      Sign Out
    </button>
  );
};

export default SignOutButton;
