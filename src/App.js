import React, { Component, useState, useEffect} from 'react';
import ParticlesBg from 'particles-bg';
import Navigation from './components/Navigation/Navigation';
import Logo from './components/Logo/Logo';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import Signin from './components/Signin/Signin';
import Register from './components/Register/Register';
import About from './components/About/About';
import Rank from './components/Rank/Rank';
import FaceDetails from './components/FaceDetails/FaceDetails';
import './App.css';

const MODEL_IDS = ['general-image-recognition', 'color-recognition', 'face-detection']; 

const initialState = {
  input: '',
  imageUrl: '',
  box: [],
  route: 'signin',
  isSignedIn: false,
  colors: '',
  imageType: '',
  user:  {
    id: '',
    name: '',
    email: '',
    entries: 0,
    joined: ''
  }
}

class App extends Component{
  constructor() {
    super();
    this.state = initialState;
  }

  loadUser = (data) => {
    this.setState({user: {
      id: data.id,
      name: data.name,
      email: data.email,
      entries: data.entries,
      joined: data.joined
  }})
  }
  
  // Calculate the dimension of four end points on a face
  calculateFaceLocation = (data) => {
    const clarifaiFaces = data.outputs[0].data.regions;
    const image = document.getElementById('inputimage');
    const width = Number(image.width);
    const height = Number(image.height);
    const facebox = [];
    clarifaiFaces.forEach((region, i) => {
      let regioninfo = region.region_info.bounding_box;
      facebox.push({
        leftCol: regioninfo.left_col * width,
        topRow: regioninfo.top_row * height,
        rightCol: width - (regioninfo.right_col * width),
        bottomRow: height - (regioninfo.bottom_row * height)
      });
    })
    return facebox;
  }
   
  // Get the type of photo
  typeOfImage = (data) => {
    const clarifaiType = data.outputs[0].data.concepts[0].name;
    const identification = `This photo highest concept is: ${clarifaiType}`;
    return identification;
  }
   
  // Get the colors that are in the photo
  colorsImageContain = (data) => {
    const colorsIdentified = [];
    const clarifaiColors = data.outputs[0].data.colors;
    clarifaiColors.forEach((color) => colorsIdentified.push(color.w3c.name));
    const colorsIdentifiedString = `This photo contains the colors: ${colorsIdentified.toString()}`;
    return colorsIdentifiedString;
  }

  displayImageType = (imageType) => {
    this.setState({imageType: imageType});
  }

  displayImageColors = (colors) => {
    this.setState({colors: colors});
  }

  displayFaceBox = (box) => {
    this.setState({box: box});
  }

  onInputChange = (event) => {
    this.setState({input: event.target.value});
  }
  
  // Get the data from the APIs and update entry count
  onPictureSubmit = () => {
    this.setState({imageUrl: this.state.input})
    MODEL_IDS.forEach((MODEL_ID) => {
      fetch('https://richard-smart-brain-005b2aa7daca.herokuapp.com/imageurl', {
        method: 'post',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            input: this.state.input,
            model: MODEL_ID
        })
      })
      .then(response => response.json())
      .then(response => {
        if(response) {
          fetch('https://richard-smart-brain-005b2aa7daca.herokuapp.com/image', {
            method: 'put',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                id: this.state.user.id,
            })
          })
          .then(response => response.json())
          .then(count => {
              this.setState(Object.assign(this.state.user, {entries: Math.ceil(count - 2/3)}));
          })
          .catch(console.log)
        }
        if(MODEL_ID === 'face-detection') {
          this.displayFaceBox(this.calculateFaceLocation(response));
        } else if(MODEL_ID === 'color-recognition') {
          this.displayImageColors(this.colorsImageContain(response));
        } else if(MODEL_ID === 'general-image-recognition') {
          this.displayImageType(this.typeOfImage(response));
        }
      })
      .catch(error => console.log('error', error));
    })
  }

  onRouteChange = (route) => {
    if(route === 'signout') {
      this.setState(initialState);
    } else if (route === 'home') {
      this.setState({isSignedIn: true});
    }
    this.setState({route: route});
  }

  render() {
    const { isSignedIn, box, imageUrl, route, colors, imageType, user } = this.state;
    return (
      <div className="App">
        <ParticlesBg type="cobweb" color='#ffffff' num={200} bg={true} />
        <Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange}/>
        {route === 'home' ?
          <div>
            <Logo />
            <Rank name={user.name} entries={user.entries} />
            <ImageLinkForm onInputChange={this.onInputChange} onPictureSubmit={this.onPictureSubmit}/>
            <FaceDetails imageType={imageType} colors={colors} />
            <FaceRecognition box={box} imageUrl={imageUrl}/>
          </div>
          :
          (
            route === 'signin' 
            ? <Signin loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
            : 
            (
              route === 'about'
              ? <About />
              :
              <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
            )

          )
          
        }
      </div>
    );
  }
}

export default App;
