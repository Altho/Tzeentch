import './style.css';
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';
import 'firebaseui'
import 'firebaseui/dist/firebaseui.css'

import profile from './profile.svg';
import tzeentch from './tzeentch.svg';
import { nanoid } from 'nanoid';
let tags= [];
let tasks = [];

import close from './close.svg';
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

let userName;
let loggedIn = false;
const dbRef = firebase.database().ref();
let userId;




const ui = new firebaseui.auth.AuthUI(firebase.auth());


const spawn =(name,description,priority,category,tag,task,sDate,dDate,link) => {
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

 firebase.auth().onAuthStateChanged(async function(user) {
    if (user) {
        user.providerData.forEach((profile) => {
            userId = profile.uid;
            userName = profile.displayName;
            console.log (userName);
            console.log(profile.email)

            dbRef.child("users").child(userId).get().then((snapshot) => {
                if (snapshot.exists()) {
                    console.log(snapshot.val().username + snapshot.val().email);
                } else {
                    console.log("No data available");
                }
            }).catch((error) => {
                console.error(error);
            });
        });

        document.body.appendChild(domElements.navGen());
        document.body.appendChild(await domElements.spawnUiGen());




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
        const menuImg = new Image();
        menuImg.src = tzeentch;
        menuImg.id="user-profile";
        menuImg.addEventListener('click', function (){
            spawnUiGen();
        })
        // const userProfile = createElem('li', '#user-profile', 'menu-element');
        // userProfile.innerText=userName
        menu.appendChild(menuImg);
        navbar.appendChild(appName);
        navbar.appendChild(menu);


        return navbar;

    }
    const spawnUiGen = async() => {
        //spawn name
        const infosName = createElem('div','.section-name');
        infosName.innerText="Spawn's infos";
        const spawnContainer = createElem('div','#spawn-container');
        const spawnFrame = createElem('div', '#spawn-frame');
        const spawnLeft = createElem('div', '#spawn-left');
        spawnLeft.appendChild(infosName);
        const spawnRight = createElem('div', '#spawn-right');
        spawnFrame.appendChild(spawnLeft);
        spawnFrame.appendChild(spawnRight);
        spawnContainer.appendChild(spawnFrame);

        const spawnNameBundle = createElem('div','.bundle');
        const spawnNameLabel = createElem('label');
        const spawnName = createElem('input','#spawn-name');
        const closeSpawns = createElem('div', '#close-spawns');
        closeSpawns.innerHTML = "Close";
        closeSpawns.addEventListener('click', ()=>{
            spawnContainer.remove();
        })
        spawnRight.appendChild(closeSpawns);

        spawnName.type="text";
        spawnNameLabel.setAttribute("for",spawnName.id);
        spawnNameLabel.innerText="Spawn name";
        spawnNameBundle.appendChild(spawnNameLabel);
        spawnNameBundle.appendChild(spawnName);
        spawnLeft.appendChild(spawnNameBundle);
        //spawn description
        const spawnDescBundle = createElem('div','.bundle');
        const spawnDescLabel = createElem('label');
        spawnDescLabel.innerText="Describe your spawn (optional)."
        const spawnDesc = createElem('textarea','#spawn-desc');
        spawnDescLabel.setAttribute("for",spawnDesc.id);
        spawnDescBundle.appendChild(spawnDescLabel);
        spawnDescBundle.appendChild(spawnDesc);
        spawnLeft.appendChild(spawnDescBundle);
        //spawn priority
        const spawnPriorityBundle = createElem('div','.bundle');
        const spawnPriorityLabel = createElem('label');
        spawnPriorityLabel.innerText="Priority."
        const spawnPriority = createElem('select','#spawn-priority');
        spawnPriorityLabel.setAttribute("for",spawnPriority.id);
        spawnPriorityBundle.appendChild(spawnPriorityLabel);
        const low = document.createElement('option');
        low.value="low";
        low.innerText="Low";
        const medium = document.createElement('option');
        medium.value="medium";
        medium.innerText="Medium";
        const important = document.createElement('option');
        important.value="important";
        important.innerText="Important";
        const critical = document.createElement('option');
        critical.value="critical";
        critical.innerText="critical";
        spawnPriority.appendChild(low);
        spawnPriority.appendChild(medium);
        spawnPriority.appendChild(important);
        spawnPriority.appendChild(critical);
        // Load categories
        const catBundle = createElem('div', '.bundle');
        const catLabel = createElem('label');
        const categories = createElem('select', '#categories');
        catLabel.setAttribute("for",catLabel.id);
        catLabel.innerText="Categories";
        catBundle.appendChild(catLabel);
        catBundle.appendChild(categories);
        const catArray = await fetchCategories();
        for(let cat of catArray){
            const option = document.createElement('option');
            option.value= cat;
            option.innerText= cat;
            categories.appendChild(option);
        }
        spawnLeft.appendChild(catBundle);
        spawnPriorityBundle.appendChild(spawnPriority);
        spawnLeft.appendChild(spawnPriorityBundle);
        // create tag container and systems
        const tagName = createElem('div','.section-name');
        tagName.innerText="Tags";
        const tagContainer = createElem('div','#tags');
        tagContainer.appendChild(tagName)
        const tagsInputContainer = createElem('div','#tags-input-container','.hidden');
        const tagsInput = createElem('input', '#tags-input')
        tagsInput.type="text";
        tagsInputContainer.appendChild(tagsInput);

        tagContainer.appendChild(tagsInputContainer)
        const addTagButton = createElem('button', '#add-tag');
        addTagButton.addEventListener('click',await tagsToContainer);
        addTagButton.innerText="Add";
        tagsInputContainer.appendChild(addTagButton);
        const tagsDisplay = createElem('div', '#tags-display');
        spawnRight.appendChild(tagContainer);
        tagContainer.appendChild(tagsDisplay);
        // tasks
        const tasksContainer = createElem('div', '#tasks-container');
        const taskName = createElem('div','.section-name');
        taskName.innerText="Tasks";
        tasksContainer.appendChild(taskName);
        spawnRight.appendChild(tasksContainer);
        const addTasks = createElem('div', '.add-task');
        tasksContainer.appendChild(addTasks);
        addTasks.innerHTML="+";
        addTasks.addEventListener('click',function(){
            addTasks.remove();
            const taskBundle = createElem('div', '.task-bundle');
            tasksContainer.appendChild(taskBundle);
            const taskName = createElem('input', '.task-name');
            taskName.placeholder="My Task"
            taskName.type="text";
            const boxDiv = createElem('div', '.box-div');
            const taskBox = createElem('input', '.task-box');
            taskBox.addEventListener('click', function(){
                console.log('clicked');
                taskName.classList.toggle('box-checked');
            })
            taskBox.type="checkbox";
            taskBundle.appendChild(taskName);
            taskBundle.appendChild(boxDiv);
            taskBundle.appendChild(addTasks);
            boxDiv.appendChild(taskBox);
        })


        //send button
        const sendButton = createElem('button','#send-button');
        sendButton.innerText = "Create spawn";
        sendButton.addEventListener('click', getSpawnData);
        spawnContainer.appendChild(sendButton);





        return spawnContainer

    }
    return {navGen, spawnUiGen};

})();



async function fetchCategories(){
let categ;
   await dbRef.child("/").get().then((snapshot) => {
        if (snapshot.exists()) {
             categ = snapshot.val().categories ;
            console.log(categ);

        } else {
            console.log("No data available");
        }


})
    return  categ;
}






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


function tagsToContainer(){
    const input = document.querySelector('#tags-input');
    const newTag= input.value;
    tags.push(newTag);
    console.log(tags);
    addTag(newTag);
}

function addTag(tag){
    const tagDisplay = document.querySelector('#tags-display')
    const tagToFind = document.querySelector('#tags');
    tagToFind.appendChild(tagDisplay)
    const tagBundle = createElem('div','.tag-bundle');
    const tagToAdd = createElem('div','.tag');
    tagToAdd.innerText=tag;
    const close = createElem('div', '.close-button');
    close.innerText="X";
    close.addEventListener('click', function(){
        const isTag = tags.indexOf(tag);
        if(isTag>-1){
            tags.splice(isTag, 1);
        }
        tagBundle.remove();

        console.log(tags);
    })
    tagBundle.appendChild(tagToAdd)
    tagBundle.appendChild(close)
    tagDisplay.appendChild(tagBundle);
}

function removeTag(){
    const tag = this.innerText;
}

function getSpawnData(){
    const spawnName = document.querySelector('#spawn-name');
    const spawnDesc = document.querySelector('#spawn-desc');
    const spawnPriority = document.querySelector('#spawn-priority');
    const category = document.querySelector('#categories')
    const getTasks =  () => {
        const allTasks = document.querySelectorAll('.task-name');
        const allTaskBoxes = document.querySelectorAll('.task-box');
        for(let i = 0; i<allTasks.length; i++){
            const taskValue = allTasks[i].value;
            console.log(taskValue)
            const checkedCheck = allTaskBoxes[i].checked;
            console.log(checkedCheck)
            tasks.push({task:taskValue,isDone:checkedCheck});
        }

    }
    const spawnId = nanoid();
    getTasks();
    writeSpawn(spawnName.value,spawnDesc.value,spawnPriority.value,spawnId,category.value,tags,tasks);



};

function writeSpawn(name,desc,priority,id,category,tags,tasks) {
console.log(tasks);

    firebase.database().ref('users/' + userId+'/spawns/'+id).set({
        spawn_name: name,
        spawn_description: desc,
        spawn_priority : priority,
        spawn_category: category,
        spawn_tags :tags,
        spawn_tasks : tasks
    });
}


// function writeUserData() {
//     firebase.database().ref('categories/').set({
//         1: "Administrative",
//         2: "Finance",
//         3:"Groceries",
//         4:"events",
//         5:"Social"
//     });
// }
//
// writeUserData();














