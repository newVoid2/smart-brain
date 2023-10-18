import React from "react";
import { Tilt } from 'react-tilt';
import brain from './brain.png';
import './Logo.css';

const Logo = () => {
    return (
        <div className="ma4 mt0">
            <Tilt className="Tilt" options={{max: 55}}>
                <div className="Tilt-inner pa3">
                    <img alt="logo" src={brain}/>
                    <p><a target="_blank" href="https://icons8.com/icon/99625/brain" rel="noreferrer">Brain</a> icon by <a target="_blank" href="https://icons8.com" rel="noreferrer">Icons8</a></p>
                </div>
            </Tilt>
        </div>
    );
}

export default Logo;