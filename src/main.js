import './style.css';
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';
import 'firebaseui'
import 'firebaseui/dist/firebaseui.css'
import profile from './profile.svg';

let userName;
let loggedIn = false;
let userID;


const firebaseConfig = {
    apiKey: "AIzaSyACajKLIx2cK4KYmUnLEAieEnRgZBg6rbA",
    authDomain: "tzeentch-dcab7.firebaseapp.com",
    databaseURL: "https://tzeentch-dcab7-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "tzeentch-dcab7",
    storageBucket: "tzeentch-dcab7.appspot.com",
    messagingSenderId: "103001407921",
    appId: "1:103001407921:web:d90f77e3a6654e15623d90",
    measurementId: "G-7F3Q6DNNRV"
};
firebase.initializeApp(firebaseConfig);

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
        user.providerData.forEach((profile) => {
            userID = profile.uid;
            userName = profile.displayName;
            console.log (userName);
            writeUserData(userID,profile.displayName,profile.email,profile.photoURL);


        });
        document.body.appendChild(domElements.navGen());




        loggedIn=true;

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

                    const profile = new Image();

                    bigAuthDiv.remove();
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
        const bigAuthDiv = document.body.appendChild(createElem('div','#big-auth-cont'));
        const logo = bigAuthDiv.appendChild(createElem('div','#logo'));
        logo.innerText = "Tzeentch";
        const authDiv = document.createElement('div');
        authDiv.id="auth-div";



        const authContainer = document.createElement('div');
        authContainer.id="firebaseui-auth-container";
        authDiv.appendChild(authContainer);

        const loader= document.createElement('div');
        loader.id="loader";
        authDiv.appendChild(loader);
        bigAuthDiv.appendChild(authDiv);
        document.body.appendChild(bigAuthDiv)

        ui.start('#firebaseui-auth-container', uiConfig);

    }
});

const domElements = (() =>{
    const navGen = () => {
        const navbar = createElem('nav', '#navbar');
        const appName = createElem('h1', '#appName');
        appName.innerText = "Tzeentch";
        const menu = createElem('ul', '#menu');
        const profileImg = new Image();
        profileImg.src = profile;
        profileImg.id="user-profile";
        // const userProfile = createElem('li', '#user-profile', 'menu-element');
        // userProfile.innerText=userName
        menu.appendChild(profileImg);
        navbar.appendChild(appName);
        navbar.appendChild(menu);


        return navbar;

    }
    return {navGen};

})();


if(loggedIn === true){
    console.log('your are logged in')

}
else {
    console.log('please log in');
};




function createElem(type,...idandclass){
    const element = document.createElement(type);
    for (let d of idandclass){
        try{
        if(d[0] ==="#"){
            d=d.substring(1);
            element.id=d;
        }
        else if(d[0] ==="."){
            d=d.substring(1);
            element.classList.add(d)
        }}
        catch(e){console.log(e)};
    }
    return element
}


function writeUserData(userId, name, email, imageUrl) {
    firebase.database().ref('users/' + userId).set({
        username: name,
        email: email,
        profile_picture : imageUrl
    });
}














