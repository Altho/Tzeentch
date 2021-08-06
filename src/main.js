import './style.css';
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';
import 'firebaseui'
import 'firebaseui/dist/firebaseui.css'



const app = firebase.initializeApp({

    apiKey: "AIzaSyACajKLIx2cK4KYmUnLEAieEnRgZBg6rbA",
    authDomain: "tzeentch-dcab7.firebaseapp.com",
    projectId: "tzeentch-dcab7",
    storageBucket: "tzeentch-dcab7.appspot.com",
    messagingSenderId: "103001407921",
    appId: "1:103001407921:web:d90f77e3a6654e15623d90",
    measurementId: "G-7F3Q6DNNRV" });

const ui = new firebaseui.auth.AuthUI(firebase.auth());





const toDo =(name,description,priority,category,tag,task,sDate,dDate,link) => {
    const cDate = () => new Date();
    let getName = () => name;
    let getDescription = () => description;
    let getPriority = () => priority;
    let getCategory = () => category;
    let getTag = () => tag;
    let getTask = () => task;
    let getSDate = () => sDate;
    let getDDate = () => dDate;
    let getLink = () => link;

    return {cDate,getName,getDescription,getPriority,getCategory,getTag,getTask,getSDate,getDDate,getLink}
}

firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        console.log('signed in !')
        const logoout = document.createElement('button');
        logoout.innerHTML="Log out";
        document.body.appendChild(logoout);
        logoout.addEventListener('click',function(){
            firebase.auth().signOut().then(function() {
                console.log('Signed Out');
                document.location.reload();

            }, function(error) {
                console.error('Sign Out Error', error);
            });
        })
    } else {



        const uiConfig = {
            callbacks: {
                signInSuccessWithAuthResult: function(authResult, redirectUrl) {
                    console.log(authResult);
                    console.log(redirectUrl);
                    const profile = new Image();
                    console.log(firebase.auth.Auth.Persistence);
                    profile.src = authResult.additionalUserInfo.profile.picture;
                    document.body.appendChild(profile);
                },
                uiShown: function() {
                    // The widget is rendered.
                    // Hide the loader.
                    document.getElementById('loader').style.display = 'none';
                }
            },
            // Will use popup for IDP Providers sign-in flow instead of the default, redirect.
            signInFlow: 'popup',
            signInSuccessUrl: '/',
            signInOptions: [
                // Leave the lines as is for the providers you want to offer your users.
                firebase.auth.GoogleAuthProvider.PROVIDER_ID,
                firebase.auth.EmailAuthProvider.PROVIDER_ID,
                firebase.auth.PhoneAuthProvider.PROVIDER_ID
            ],
            // Terms of service url.
            tosUrl: '<your-tos-url>',
            // Privacy policy url.
            privacyPolicyUrl: '<your-privacy-policy-url>'
        };
        const authContainer = document.createElement('div');
        authContainer.id="firebaseui-auth-container";
        document.body.appendChild(authContainer);

        const loader= document.createElement('div');
        loader.id="loader";
        document.body.appendChild(loader);

        ui.start('#firebaseui-auth-container', uiConfig);

    }
});























