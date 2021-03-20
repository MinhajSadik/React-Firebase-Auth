import './App.css';
import "firebase/auth";
import firebase from "firebase/app";
import { firebaseConfig } from './firebase.config';
import { useState } from 'react';
// firebase.initializeApp(firebaseConfig)
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}


function App() {
  const [newUser, setNewUser] = useState(false);
  const [user, setUser] = useState({
    newUser: false,
    isSignedIn: false,
    name: '',
    email: '',
    photo: '',
    error: '',
    success: false
  })
  var googleProvider = new firebase.auth.GoogleAuthProvider();
  var fbProvider = new firebase.auth.FacebookAuthProvider();
  const handleSignIn = () => {
    firebase.auth().signInWithPopup(googleProvider)
      .then(res => {
        const { displayName, photoURL, email } = res.user;
        const signedInUser = {
          isSignedIn: true,
          name: displayName,
          email: email,
          photo: photoURL
        }
        setUser(signedInUser)
      })
      .catch(err => {
        // console.log(err);
        // console.log(err.message);
      })
  }
  //signOut Codeing
  const handleSignOut = () => {
    firebase.auth().signOut()
      .then(res => {
        const SignOutUser = {
          isSignedIn: false,
          name: '',
          photo: '',
          email: '',
          password: ''
        }
        setUser(SignOutUser)
      })
      .catch(err => {

      })
  }

  const handleBlur = (event) => {
    let isFieldValid;
    if (event.target.name === 'email') {
      isFieldValid = /\S+@\S+\.\S+/.test(event.target.value)
    }
    if (event.target.name === 'password') {
      const isPasswordValid = event.target.value.length > 6;
      const passwordHasNumber = /\d{3}/.test(event.target.value);
      isFieldValid = isPasswordValid && passwordHasNumber  // javascript regexp code chack out
    }
    if (isFieldValid) {
      const newUserInfo = { ...user };
      newUserInfo[event.target.name] = event.target.value;
      setUser(newUserInfo)
    }
  }
  const handleSubmit = (e) => {
    // console.log(user.email, user.password);
    if (newUser && user.email && user.password) {
      firebase.auth().createUserWithEmailAndPassword(user.email, user.password)
        .then(res => {
          const newUserInfo = { ...user };
          newUserInfo.error = '';
          newUserInfo.success = true;
          setUser(newUserInfo);
        })
        .catch((error) => {
        
          const newUserInfo = { ...user };
          newUserInfo.error = error.message;
          newUserInfo.success = false;
          setUser(newUserInfo)
          updateUserName(user.name)
        });
    }
    if (!newUser && user.email && user.password) {
      firebase.auth().signInWithEmailAndPassword(user.email, user.password)
        .then(res => {
          const newUserInfo = { ...user };
          newUserInfo.error = '';
          newUserInfo.success = true;
          setUser(newUserInfo);
        })
        .catch((error) => {
          const newUserInfo = { ...user };
          newUserInfo.error = error.message;
          newUserInfo.success = false;
          setUser(newUserInfo)
          console.log('sign in user info', user.res);
        });
      
    }
    e.preventDefault();
  }

  const updateUserName = name => {
    const  user = firebase.auth().currentUser;

    user.updateProfile({
      displayName:{name}
    })
      .then(function () {
      console.log('user name updated successfully');
    })
      .catch(function (error) {
      console.log(error);
    });
  }
  const handleFbSignIn = () => {
    firebase
      .auth()
      .signInWithPopup(fbProvider)
      .then((result) => {
        /** @type {firebase.auth.OAuthCredential} */
        var credential = result.credential;

        // The signed-in user info.
        var user = result.user;

        // This gives you a Facebook Access Token. You can use it to access the Facebook API.
        var accessToken = credential.accessToken;
      })
      .catch((error) => {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // The email of the user's account used.
        var email = error.email;
        // The firebase.auth.AuthCredential type that was used.
        var credential = error.credential;

        // ...
      });
  }

  return (
    <div className="App">
      {
        user.isSignedIn ?
          <button onClick={handleSignOut}>Sign Out</button>
          :
          <button onClick={handleSignIn}>Sign In</button>
      }
      <br />
      <button onClick={handleFbSignIn}>Sign In With Facebook</button>

      {
        user.isSignedIn &&
        <div>
          <p>Welcome! {user.name}</p>
          <p>Your Email: {user.email}</p>
          <img src={user.photo} alt="" />
        </div>
      }

      <h1>Our Own Authentication</h1>
      <input type="checkbox" onChange={() => setNewUser(!newUser)} name="newUser" id="" />
      <label htmlFor="newUser">New User Sign Up</label>

      {/* <p>Name: {user.name}</p>
      <p>Email: {user.email}</p>
      <p>Password: {user.password}</p> */}

      <form onSubmit={handleSubmit}>
        {newUser && <input onBlur={handleBlur} placeholder="Enter Your Name:" name="name" type="text" required />}
        <br />
        <input onBlur={handleBlur} type="text" name="email" placeholder="Enter Your Email" required />
        <br />
        <input onBlur={handleBlur} type="password" name="password" placeholder="Enter Your Password" id="" required />
        <br />
        <input type="submit" value={newUser ? 'Sign up' : 'Sign in'} />
      </form>
      <p style={{ color: 'red' }}> {user.error} </p>

      {user.success && <p style={{ color: 'green' }}>{newUser ? 'Created' : 'Logged In'} Successfully</p>}
    </div>
  );
}

export default App;
