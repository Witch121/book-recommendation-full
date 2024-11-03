import React from "react";
import { useNavigate } from "react-router-dom";
import aboutImg from "../img/about_img.jpg";

const About: React.FC = () => {
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    navigate("/randomBook");
  };

  return (
    <div className="home-container">
      <div className="custom-container">
        <div className="custom-row reverse-flex align-items-center g-5 py-5">
          <div className="custom-col img-container">
            <img src={aboutImg} className="about_img" loading="lazy" alt="Book Dragon Icon" />
          </div>
          <div className="custom-col about text">
            <h1 className="title">The Story of a Little Bookworm</h1>
            <p className="lead">
              In a cozy nook of a busy city, there was a little bookworm who adored getting lost in stories. From the moment she could read, 
              she was captivated by the magic of books and the worlds they opened up. She devoured tales of adventure, mystery, and wonder at 
              every chance she got.
            </p>
            <p className="lead">
              But with so many books to choose from, she often found herself asking, "What should I read next?" That's why this site was 
              created—to help fellow bookworms easily find their next perfect read. Just share a favorite title, and we'll handpick a list 
              of great recommendations just for you. Happy reading!
            </p>
            <div className="button-container">
              <form onSubmit={handleSubmit}>
                <input type="submit" value="Find The Book" className="btn-input" />
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
