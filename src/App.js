import React, { Component } from 'react';
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

const clarifaiRequestOptions = (imageUrl) => {
  // Your PAT (Personal Access Token) can be found in the portal under Authentification
  const PAT = '1a7136361a2044b389eefd4de996e50b';
  // Specify the correct user_id/app_id pairings
  // Since you're making inferences outside your app's scope
  const USER_ID = 'richardd_kerr';       
  const APP_ID = 'smartbrain';
  // Change these to whatever model and image URL you want to use
  // const MODEL_ID = 'face-detection'; 
  const IMAGE_URL = imageUrl;

  const raw = JSON.stringify({
      "user_app_id": {
          "user_id": USER_ID,
          "app_id": APP_ID
      },
      "inputs": [
          {
              "data": {
                  "image": {
                      "url": IMAGE_URL
                  }
              }
          }
      ]
  });

  const requestOptions = {
      method: 'POST',
      headers: {
          'Accept': 'application/json',
          'Authorization': 'Key ' + PAT
      },
      body: raw
  };

  return requestOptions;
}

class App extends Component{
  constructor() {
    super();
    this.state = {
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
  
  calculateFaceLocation = (data) => {
    console.log(data.outputs[0].data.regions);
    const clarifaiFaces = data.outputs[0].data.regions;
    if(clarifaiFaces === undefined) {
      return 
    }
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

  typeOfImage = (data) => {
    const clarifaiType = data.outputs[0].data.concepts[0].name;
    const identification = `This photo is of a ${clarifaiType}`;
    return identification;
  }

  colorsImageContain = (data) => {
    const colorsIdentified = []
    const clarifaiColors = data.outputs[0].data.colors
    clarifaiColors.forEach((color) => {
      colorsIdentified.push(color.w3c.name)
    })
    const colorsIdentifiedString = `This photo contains the colors: ${colorsIdentified.toString()}`
    return colorsIdentifiedString;
  }

  displayImageType = (imageType) => {
    this.setState({imageType: imageType});
  }

  displayImageColors = (colors) => {
    this.setState({colors: colors});
  }

  displayFaceBox = (box) => {
    console.log(box);
    if(box === undefined) {
      return 
    }
    this.setState({box: box});
  }

  onInputChange = (event) => {
    this.setState({input: event.target.value});
  }

  onPictureSubmit = () => {
    this.setState({imageUrl: this.state.input})
    console.log('click');
    //fetchModelId = MODEL_IDS[1];
    MODEL_IDS.forEach((MODEL_ID) => {
      fetch("https://api.clarifai.com/v2/models/" + MODEL_ID + "/outputs", clarifaiRequestOptions(this.state.input))
      .then(response => response.json())
      .then(result => {
        if(result) {
          fetch('http://localhost:3000/image', {
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
        }
        if(MODEL_ID === 'face-detection') {
          this.displayFaceBox(this.calculateFaceLocation(result));
        } else if(MODEL_ID === 'color-recognition') {
          this.displayImageColors(this.colorsImageContain(result));
        } else if(MODEL_ID === 'general-image-recognition') {
          this.displayImageType(this.typeOfImage(result));
        }
      })
      .catch(error => console.log('error', error));
    })
  }

  onRouteChange = (route) => {
    if(route === 'signout') {
      this.setState({isSignedIn: false});
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
              ? <About onRouteChange={this.onRouteChange} />
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
