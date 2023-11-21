import React from "react";
import './About.css';

const About = () => {
    return (
        <div className="center">
        <article className="br3 ba b--black-10 mv4 w-100 w-50-m w-25-l shadow-5 mw6">
            <h1 className="f1 tc">Welcome to SmartBrain</h1>
            <p>This app can detect the highest concept of the image, list the colors that made up the image and detect all the faces in the image.</p>
            <hr />
            <p>Copyright &copy; 2023 Developed by <a href="https://www.linkedin.com/in/richard-kerr-198a6a290/" target="_blank" rel="noreferrer">Richard Kerr</a></p>
        </article>
        </div>
    );
}

export default About;