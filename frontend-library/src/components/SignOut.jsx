import React from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebaseFolder/firebase';
import { useNavigate } from 'react-router-dom';
import signOutImg from '../img/signOut_img.jpg';

const SignOut = () => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut(auth); // Firebase sign-out
      navigate('/SignIn');
    } catch (error) {
      console.error('Error signing out:', error.message);
    }
  };

  const handleCancel = () => {
    navigate('/'); // Redirect to home if the user cancels sign-out
  };

  return (
    <div className=' custom-container signOut_page'>
      <div className="custom-row reverse-flex align-items-center g-5 py-5">
        <div className="custom-col img-container">
          <img src={signOutImg} className="about_img" loading="lazy" alt="How about no Icon"/>
        </div>
        <div className="custom-col about text">
          <h2>Are you sure you want to sign out?</h2>
          <div className='btn_signOut_row'>
            <button onClick={handleSignOut} className='btn-input'>Yes</button>
            <button onClick={handleCancel} className='btn-input'>No</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignOut;
