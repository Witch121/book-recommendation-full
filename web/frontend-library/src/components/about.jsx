import React from 'react';
import { useNavigate } from 'react-router-dom';
import aboutImg from '../img/about_img.jpg';

const About = () => {
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/recommendation');
  };
  return (
    <div className="custom-container">
      <div className="custom-row reverse-flex align-items-center g-5 py-5">
        <div className="custom-col img-container">
          <img src={aboutImg} className="about_img" loading="lazy" alt="Book Dragon Icon" />
        </div>
        <div className="custom-col about text">
          <h1 className="title">Story about little bookworm</h1>
          <p className="lead">
            Once upon a time, in a quiet little village, there lived a girl. She had always been a bookworm, 
            with her nose buried in a book at every opportunity. She couldn't resist the allure of stories and the worlds they created. 
            From the time she could read, she devoured books like a ravenous reader.
          </p>
          <div className="button-container">
            <form onSubmit={handleSubmit}>
              <input type="submit" value="find adventure" className="btn-input" />
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
