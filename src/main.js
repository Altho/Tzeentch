import './style.css';
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';
import 'firebaseui';
import 'firebaseui/dist/firebaseui.css';
import phone from './phone.svg';
import 'masonry-layout';
import { format, compareAsc } from 'date-fns'


import profile from './profile.svg';
import tzeentch from './tzeentch.svg';
import {nanoid} from 'nanoid';

import administrative from './categories/city-hall.svg';
import social from './categories/user.svg';
import groceries from './categories/groceries.svg';
import financial from './categories/money.svg';
import fun from './categories/party.svg';
import personnal from './categories/personnal.svg';
import Work from './categories/work.svg';
import edit from './categories/edit.svg';


let tags = [];
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


const spawn = (name, description, priority, category, tag, task, sDate, dDate, link) => {
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

    return {cDate, getName, getDescription, getPriority, getCategory, getTag, getTask, getSDate, getDDate, getLink}
}

firebase.auth().onAuthStateChanged(async function (user) {
    if (user) {
        user.providerData.forEach((profile) => {
            userId = profile.uid;
            userName = profile.displayName;
            console.log(userName);
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
        await domElements.addSpawn()
        await domElements.showAllSpawn();
        // document.body.appendChild(await domElements.spawnUiGen());


        loggedIn = true;

        const logoout = document.createElement('button');
        logoout.innerHTML = "Log out";
        document.body.appendChild(logoout);
        logoout.addEventListener('click', function () {
            firebase.auth().signOut().then(function () {
                console.log('Signed Out');
                document.location.reload();

            }, function (error) {
                console.error('Sign Out Error', error);
            });
        })
    } else {


        const uiConfig = {
            callbacks: {
                signInSuccessWithAuthResult: function (authResult, redirectUrl) {


                    bigAuthDiv.remove();
                },
                uiShown: function () {
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
        const bigAuthDiv = document.body.appendChild(createElem('div', '#big-auth-cont'));
        const logo = bigAuthDiv.appendChild(createElem('div', '#logo'));
        logo.innerText = "Tzeentch";
        const authDiv = document.createElement('div');
        authDiv.id = "auth-div";


        const authContainer = document.createElement('div');
        authContainer.id = "firebaseui-auth-container";
        authDiv.appendChild(authContainer);

        const loader = document.createElement('div');
        loader.id = "loader";
        authDiv.appendChild(loader);
        bigAuthDiv.appendChild(authDiv);
        document.body.appendChild(bigAuthDiv)

        ui.start('#firebaseui-auth-container', uiConfig);

    }
});

const domElements = (() => {
        const showAllSpawn = async () => {
            let storeCard;
            containerCheck();
            const spawnContainer = addSpawnContainer();
            document.body.appendChild(spawnContainer);

            console.log('Fetching spawns')
            const spawns = await fetchSpawns();
            for (let spawn in spawns) {
                const expSpawn = spawns[spawn];
                let spawnCard = createElem('div', '.spawn-card');
                spawnCard.addEventListener('click', await function () {
                    expandSpawn(expSpawn, spawnCard);
                });
                const spawnName = createElem('div', '.spawn-name');
                if (spawns[spawn].spawn_priority == "low") {
                    spawnCard.classList.add('low');
                } else if (spawns[spawn].spawn_priority == "medium") {
                    spawnCard.classList.add('medium');
                } else if (spawns[spawn].spawn_priority == "important") {
                    spawnCard.classList.add('important');
                } else if (spawns[spawn].spawn_priority == "critical") {
                    spawnCard.classList.add('critical');
                }
                spawnContainer.appendChild(spawnCard);
                const spawnMenu = createElem('div', '.spawn-menu');
                spawnCard.appendChild(spawnMenu);
                spawnMenu.appendChild(showCategories(spawns[spawn].spawn_category));
                spawnMenu.appendChild(showEdit());

                spawnCard.appendChild(spawnName);
                spawnName.innerHTML = spawns[spawn].spawn_name;
                const spawnDescSample = createElem('div', '.spawn-des-sample');
                if (spawns[spawn].spawn_description.length > 50) {
                    const shortenedDes = spawns[spawn].spawn_description.substring(0, 49)
                    spawnDescSample.innerHTML = shortenedDes + ' . . .';
                    spawnCard.appendChild(spawnDescSample);
                } else {
                    spawnDescSample.innerHTML = spawns[spawn].spawn_description;
                    spawnCard.appendChild(spawnDescSample);

                }


                if (spawns[spawn].end_date) {
                    const timeRemaining = createElem('div', '.time-remaining-bundle');
                    const timeLeftText = createElem('div', '.time-text');
                    timeLeftText.innerHTML = "Ends :"
                    const time = createElem('div', '.time');
                    time.innerHTML = spawns[spawn].end_date;
                    timeRemaining.appendChild(timeLeftText);
                    timeRemaining.appendChild(time);
                    spawnCard.appendChild(timeRemaining);


                }
                const arrowWrapper = createElem('div', '.arrow-wrapper', '.hidden');
                const arrowContainer = createElem('div', '.arrow-container');
                const chevron1 = createElem('div', '.chevron');
                const chevron2 = createElem('div', '.chevron');
                const chevron3 = createElem('div', '.chevron');
                arrowContainer.appendChild(chevron1)
                arrowContainer.appendChild(chevron2)
                arrowContainer.appendChild(chevron3)
                arrowWrapper.appendChild(arrowContainer);
                spawnCard.appendChild(arrowWrapper);
                spawnCard.addEventListener('mouseover', function () {
                    arrowWrapper.classList.remove('hidden');


                })
                spawnCard.addEventListener('mouseout', function () {
                    arrowWrapper.classList.add('hidden');
                })

                spawnCard.addEventListener('mouseleave', function () {
                    console.log(storeCard)
                });
            }
        }
        const containerCheck = () => {
            const checkContainer = document.querySelector('#show-span-container');
            if (checkContainer) {
                checkContainer.remove()
            }
        }
        const addSpawnContainer = () => {
            const showSpawnContainer = createElem('div', '#show-span-container');
            return showSpawnContainer;
        }
        const navGen = () => {
            const navbar = createElem('nav', '#navbar');
            const appName = createElem('h1', '#appName');
            appName.innerText = "Tzeentch";
            const menu = createElem('ul', '#menu');
            const menuImg = new Image();
            menuImg.src = tzeentch;
            menuImg.id = "user-profile";
            menuImg.addEventListener('click', function () {
                spawnUiGen();
            })
            // const userProfile = createElem('li', '#user-profile', 'menu-element');
            // userProfile.innerText=userName
            menu.appendChild(menuImg);
            navbar.appendChild(appName);
            navbar.appendChild(menu);


            return navbar;

        }

        const spawnUiGen = async () => {
            containerCheck();
            //spawn name
            const infosName = createElem('div', '.section-name');
            infosName.innerText = "Spawn's infos";
            const spawnContainer = createElem('div', '#spawn-container');
            const spawnFrame = createElem('div', '#spawn-frame');
            const spawnLeft = createElem('div', '#spawn-left');
            spawnLeft.appendChild(infosName);
            const spawnRight = createElem('div', '#spawn-right');
            spawnFrame.appendChild(spawnLeft);
            spawnFrame.appendChild(spawnRight);
            spawnContainer.appendChild(spawnFrame);

            const spawnNameBundle = createElem('div', '.bundle');
            const spawnNameLabel = createElem('label');
            const spawnName = createElem('input', '#spawn-name');
            const closeSpawns = createElem('div', '#close-spawns');
            closeSpawns.innerHTML = "Close";
            closeSpawns.addEventListener('click', async () => {
                spawnContainer.remove();
                await showAllSpawn();
            })
            spawnRight.appendChild(closeSpawns);

            spawnName.type = "text";
            spawnNameLabel.setAttribute("for", spawnName.id);
            spawnNameLabel.innerText = "Spawn name";
            spawnNameBundle.appendChild(spawnNameLabel);
            spawnNameBundle.appendChild(spawnName);
            spawnLeft.appendChild(spawnNameBundle);
            //spawn description
            const spawnDescBundle = createElem('div', '.bundle');
            const spawnDescLabel = createElem('label');
            spawnDescLabel.innerText = "Describe your spawn (optional)."
            const spawnDesc = createElem('textarea', '#spawn-desc');
            spawnDescLabel.setAttribute("for", spawnDesc.id);
            spawnDescBundle.appendChild(spawnDescLabel);
            spawnDescBundle.appendChild(spawnDesc);
            spawnLeft.appendChild(spawnDescBundle);
            //spawn priority
            const spawnPriorityBundle = createElem('div', '.bundle');
            const spawnPriorityLabel = createElem('label');
            spawnPriorityLabel.innerText = "Priority."
            const spawnPriority = createElem('select', '#spawn-priority');
            spawnPriorityLabel.setAttribute("for", spawnPriority.id);
            spawnPriorityBundle.appendChild(spawnPriorityLabel);
            const low = document.createElement('option');
            low.value = "low";
            low.innerText = "Low";
            const medium = document.createElement('option');
            medium.value = "medium";
            medium.innerText = "Medium";
            const important = document.createElement('option');
            important.value = "important";
            important.innerText = "Important";
            const critical = document.createElement('option');
            critical.value = "critical";
            critical.innerText = "critical";
            spawnPriority.appendChild(low);
            spawnPriority.appendChild(medium);
            spawnPriority.appendChild(important);
            spawnPriority.appendChild(critical);
            // Load categories
            const catBundle = createElem('div', '.bundle');
            const catLabel = createElem('label');
            const categories = createElem('select', '#categories');
            catLabel.setAttribute("for", catLabel.id);
            catLabel.innerText = "Categories";
            catBundle.appendChild(catLabel);
            catBundle.appendChild(categories);
            const catArray = await fetchCategories();
            for (let cat of catArray) {
                const option = document.createElement('option');
                option.value = cat;
                option.innerText = cat;
                categories.appendChild(option);
            }
            spawnLeft.appendChild(catBundle);
            spawnPriorityBundle.appendChild(spawnPriority);
            spawnLeft.appendChild(spawnPriorityBundle);
            // create tag container and systems
            const tagName = createElem('div', '.section-name');
            tagName.innerText = "Tags";
            const tagContainer = createElem('div', '#tags');
            tagContainer.appendChild(tagName)
            const tagsInputContainer = createElem('div', '#tags-input-container', '.hidden');
            const tagsInput = createElem('input', '#tags-input')
            tagsInput.type = "text";
            tagsInputContainer.appendChild(tagsInput);

            tagContainer.appendChild(tagsInputContainer)
            const addTagButton = createElem('button', '#add-tag');
            addTagButton.addEventListener('click', await tagsToContainer);
            addTagButton.innerText = "Add";
            tagsInputContainer.appendChild(addTagButton);
            const tagsDisplay = createElem('div', '#tags-display');
            spawnRight.appendChild(tagContainer);
            tagContainer.appendChild(tagsDisplay);
            // phone
            const phoneContainer = createElem('div', '#phone-container');
            const phoneName = createElem('div', '.section-name')
            phoneName.innerHTML = "Contact";
            phoneContainer.appendChild(phoneName);
            spawnRight.appendChild(phoneContainer);
            const phoneBundle = createElem('div', '#phone-bundle');
            phoneContainer.appendChild(phoneBundle);
            const phoneLabel = createElem('label');
            const phoneInput = createElem('input', '#phone-input');
            phoneInput.type = "text";
            phoneLabel.setAttribute("for", phoneInput.id);
            phoneLabel.innerHTML = "Phone number";
            phoneBundle.appendChild(phoneLabel);
            phoneBundle.appendChild(phoneInput);


            // tasks
            const tasksContainer = createElem('div', '#tasks-container');
            const taskName = createElem('div', '.section-name');
            taskName.innerText = "Tasks";
            tasksContainer.appendChild(taskName);
            spawnRight.appendChild(tasksContainer);
            const addTasks = createElem('div', '.add-task');
            tasksContainer.appendChild(addTasks);
            addTasks.innerHTML = "+";
            addTasks.addEventListener('click', function () {
                addTasks.remove();
                const taskBundle = createElem('div', '.task-bundle');
                tasksContainer.appendChild(taskBundle);
                const taskName = createElem('input', '.task-name');
                taskName.placeholder = "My Task"
                taskName.type = "text";
                const boxDiv = createElem('div', '.box-div');
                const taskBox = createElem('input', '.task-box');
                taskBox.addEventListener('click', function () {
                    console.log('clicked');
                    taskName.classList.toggle('box-checked');
                })
                taskBox.type = "checkbox";
                taskBundle.appendChild(taskName);
                taskBundle.appendChild(boxDiv);
                taskBundle.appendChild(addTasks);
                boxDiv.appendChild(taskBox);
            })
            // date
            const dateContainer = createElem('div', '#date-container');
            const dateTitle = createElem('div', '#date-title', '.section-name');
            const dateSections = createElem('div', '#date-sections');
            dateContainer.appendChild(dateTitle);
            const startDateContainer = createElem('div', '#start-date-container');
            const startDateTitle = createElem('div', '#start-date-title');
            const endDateTitle = createElem('div', '#end-date-title');
            startDateTitle.innerText = "Start date";
            endDateTitle.innerText = "Start date";
            const endDateContainer = createElem('div', '#end-date-container');
            startDateContainer.appendChild(startDateTitle);
            endDateContainer.appendChild(endDateTitle)
            ;dateSections.appendChild(startDateContainer);
            dateSections.appendChild(endDateContainer);
            dateContainer.appendChild(dateSections);
            const switchLabelSd = createElem('label', '.switch');
            startDateContainer.appendChild(switchLabelSd);
            const switchCheckBoxSd = createElem('input', 'start-date-checkbox');
            switchCheckBoxSd.type = "checkbox";
            switchLabelSd.appendChild(switchCheckBoxSd);
            const switchSpanSd = createElem('span', '.slider', '.round');
            switchLabelSd.appendChild(switchSpanSd)

            const switchLabelEd = createElem('label', '.switch');
            endDateContainer.appendChild(switchLabelEd);
            const switchCheckBoxEd = createElem('input', 'end-date-checkbox');
            switchCheckBoxEd.type = "checkbox";
            switchCheckBoxEd.addEventListener('click', function () {
                endDateSelect.toggleAttribute('disabled');
                endDateSelect.value = "";
            })
            switchCheckBoxSd.addEventListener('click', function () {
                startDateSelect.toggleAttribute('disabled');
                startDateSelect.value = "";

            })

            const switchSpanEd = createElem('span', '.slider', '.round');

            const startDateSelect = createElem('input', '#start-date-select');
            startDateSelect.type = "datetime-local";
            startDateSelect.setAttribute('disabled', true);


            const now = new Date();
            startDateContainer.appendChild(startDateSelect);
            startDateSelect.value = now.value;
            startDateSelect.min = now.value;

            const endDateSelect = createElem('input', '#end-date-select');
            endDateSelect.type = "datetime-local";
            endDateSelect.setAttribute('disabled', true);

            endDateContainer.appendChild(endDateSelect);
            switchLabelEd.appendChild(switchCheckBoxEd);
            switchLabelEd.appendChild(switchSpanEd);


            spawnContainer.appendChild(dateContainer)

            dateTitle.innerText = "Date & Time";

            //address
            const addressContainer = createElem('div', '#address-container');
            const addressName = createElem('div', '.section-name');
            addressName.innerHTML = "Location";
            addressContainer.appendChild(addressName);
            const addressInput = createElem('textarea', '#address-input');
            addressContainer.appendChild(addressInput);
            spawnContainer.appendChild(addressContainer);


            //send button
            const sendButton = createElem('button', '#send-button');
            sendButton.innerText = "Create spawn";
            sendButton.addEventListener('click', async function () {
                const spawnCards = document.querySelector('#show-span-container');
                if (spawnCards) {
                    spawnCards.remove();

                }
                getSpawnData();
                spawnContainer.remove();
                await showAllSpawn();
            });
            spawnContainer.appendChild(sendButton);


            return spawnContainer

        }

        async function addSpawn() {
            const addButton = createElem('div', '#add-spawn');

            document.body.appendChild(addButton);
            addButton.addEventListener('click', async function () {
                document.body.appendChild(await spawnUiGen())
            });
            return addButton;
        }


        return {navGen, spawnUiGen, addSpawn, showAllSpawn, addSpawnContainer, expandSpawn};

    }

)();

async function expandSpawn(spawn, card) {

    while (card.firstChild) {
        card.removeChild(card.firstChild);
    }
    const spawnMenu = createElem('div', '.spawn-menu');
    card.appendChild(spawnMenu);
    spawnMenu.appendChild(showCategories(spawn.spawn_category));

    spawnMenu.appendChild(showEdit());

    // spawnMenu.innerText=spawn.spawn_category;
    const spawnName = createElem('div', '.spawn-name');
    spawnName.innerHTML = spawn.spawn_name;
    card.classList.add('expanded');
    card.appendChild(spawnName);
    const expandedContainer = createElem('div', '.expanded-container');


    //time
    if (spawn.start_date || spawn.end_date) {
        const timeDiv = createElem('div', '.ex-time-dive');
        expandedContainer.appendChild(timeDiv);
        const startTimeDiv = createElem('div', '.ex-start-div');
        const endTimeDiv = createElem('div', '.ex-end-div');
        const startNameDiv = createElem('div', '.start-name-div');
        startNameDiv.innerHTML = "START TIME"
        const endNameDiv = createElem('div', '.end-name-div');
        ;
        endNameDiv.innerHTML = "END TIME";
        startTimeDiv.appendChild(startNameDiv);
        endTimeDiv.appendChild(endNameDiv);
        const startDisplay = createElem('div', '.start-display');
        const endDisplay = createElem('div', '.end-display');
        startDisplay.innerHTML = spawn.start_date;
        endDisplay.innerHTML = spawn.end_date;
        startTimeDiv.appendChild(startDisplay);
        endTimeDiv.appendChild(endDisplay);


        timeDiv.appendChild(startTimeDiv);
        timeDiv.appendChild(endTimeDiv);
        expandedContainer.appendChild(timeDiv);
        createElem('span', '.time-display');
        createElem('span', '.time-display');


    }

    //phone
    if (spawn.phone_number) {
        const phoneBundle = createElem('div', '.phone-bundle');
        expandedContainer.appendChild(phoneBundle);
        const phoneArea = createElem('div', '.phone-area');
        const phoneIcon = createElem('div', '.phone-logo');
        const phoneLogo = new Image();
        phoneLogo.src = phone;
        phoneBundle.appendChild(phoneIcon);
        phoneBundle.appendChild(phoneArea);
        phoneArea.innerText = spawn.phone_number;
        phoneIcon.appendChild(phoneLogo);
        phoneBundle.addEventListener('click', function () {
            window.location = `tel:${spawn.phone_number}`
        })
        console.log(phone)
    }

    //tags
    if (spawn.spawn_tags) {
        const exTagContainer = createElem('div', '.ex-tag-container');
        expandedContainer.appendChild(exTagContainer);
        for (let tag in spawn.spawn_tags) {
            const newTag = createElem('div', '.ex-tag');
            newTag.innerText = spawn.spawn_tags[tag];
            exTagContainer.appendChild(newTag);

        }
    }
    //tasks

    if (spawn.spawn_description) {
        const descContainer = createElem('div', '.desc-container');
        const description = createElem('p', 'full-description');
        descContainer.appendChild(description)
        description.innerText = spawn.spawn_description;
        expandedContainer.appendChild(descContainer);


    }


    card.appendChild(expandedContainer);
    if (spawn.spawn_tasks) {
        const exTaskContainer = createElem('div', '.ex-task-container');
        expandedContainer.appendChild(exTaskContainer);
        for (let task in spawn.spawn_tasks) {
            const taskBundle = createElem('div', '.ex-task-bundle');
            exTaskContainer.appendChild(taskBundle);
            const taskContent = createElem('div', '.ex-task-div');
            const taskCheck = createElem('input', '.ex-task-check');
            taskCheck.type = "checkbox";
            taskBundle.appendChild(taskContent);
            taskBundle.appendChild(taskCheck);
            taskContent.innerText = spawn.spawn_tasks[task].task;
            if (spawn.spawn_tasks[task].isDone === true) {
                taskCheck.checked = "true";
            }
        }
    }

    //address
    if(spawn.address){
        const addressDiv = createElem('div', '.address-div');
        const addressLink = createElem('a', 'address-link');
        addressLink.innerText = spawn.address;
        addressLink.href=`https://www.google.com/maps/search/${spawn.address}`;
        addressDiv.appendChild(addressLink);
        expandedContainer.appendChild(addressDiv);
    }


}

function showEdit(){
    const editImg = new Image();
    editImg.src=edit;
    const editDiv = createElem('div', '.edit-div');
    editDiv.appendChild(editImg);
    return editDiv;
}

//TODO : Keep working on fetching spawns.
async function fetchSpawns() {
    let spawns;
    await dbRef.child("users").child(userId).child("spawns").get().then((snapshot) => {
        if (snapshot.exists()) {
            spawns = snapshot.val();
            console.log(spawns);
            // console.log(spawns);
            // for(const object in spawns){
            //     allSpawns.push(spawns[object]);
            //     return(allSpawns);
            // }

        } else {
            console.log("No data available");
        }
    }).catch((error) => {
        console.error(error);
    });
    return spawns;

}

async function fetchCategories() {
    let categ;
    await dbRef.child("/").get().then((snapshot) => {
        if (snapshot.exists()) {
            categ = snapshot.val().categories;
            console.log(categ);

        } else {
            console.log("No data available");
        }


    })
    return categ;
}


function createElem(type, ...idandclass) {
    const element = document.createElement(type);
    for (let d of idandclass) {
        try {
            if (d[0] === "#") {
                d = d.substring(1);
                element.id = d;
            } else if (d[0] === ".") {
                d = d.substring(1);
                element.classList.add(d)
            }
        } catch (e) {
            console.log(e)
        }
        ;
    }
    return element
}


function tagsToContainer() {
    const input = document.querySelector('#tags-input');
    const newTag = input.value;
    tags.push(newTag);
    console.log(tags);
    addTag(newTag);
}

function addTag(tag) {
    const tagDisplay = document.querySelector('#tags-display')
    const tagToFind = document.querySelector('#tags');
    tagToFind.appendChild(tagDisplay)
    const tagBundle = createElem('div', '.tag-bundle');
    const tagToAdd = createElem('div', '.tag');
    tagToAdd.innerText = tag;
    const close = createElem('div', '.close-button');
    close.innerText = "X";
    close.addEventListener('click', function () {
        const isTag = tags.indexOf(tag);
        if (isTag > -1) {
            tags.splice(isTag, 1);
        }
        tagBundle.remove();

        console.log(tags);
    })
    tagBundle.appendChild(tagToAdd)
    tagBundle.appendChild(close)
    tagDisplay.appendChild(tagBundle);
}

function removeTag() {
    const tag = this.innerText;
}

function getSpawnData() {
    const startDate = document.querySelector('#start-date-select');
    const endDate = document.querySelector('#end-date-select');
    const spawnName = document.querySelector('#spawn-name');
    const spawnDesc = document.querySelector('#spawn-desc');
    const spawnPriority = document.querySelector('#spawn-priority');
    const category = document.querySelector('#categories');
    const phoneNumber = document.querySelector('#phone-input');
    const address = document.querySelector('#address-input')
    const getTasks = () => {
        const allTasks = document.querySelectorAll('.task-name');
        const allTaskBoxes = document.querySelectorAll('.task-box');
        for (let i = 0; i < allTasks.length; i++) {
            const taskValue = allTasks[i].value;
            console.log(taskValue)
            const checkedCheck = allTaskBoxes[i].checked;
            console.log(checkedCheck)
            tasks.push({task: taskValue, isDone: checkedCheck});
        }

    }
    const spawnId = nanoid();
    getTasks();
    writeSpawn(spawnName.value, spawnDesc.value, spawnPriority.value, spawnId, category.value, tags, tasks, startDate.value, endDate.value, phoneNumber.value, address.value);


};

function showCategories(category) {
    const image = new Image();
    const categBundle = createElem('div', '.category-card-bundle');
    const categImgDiv = createElem('div', '.category-image-div');
    const categNameDiv = createElem('div', '.category-name-div');
    image.src = getCategoryImage(category);
    categNameDiv.innerText = category;
    categImgDiv.appendChild(image);
    categBundle.appendChild(categImgDiv);
    categBundle.appendChild(categNameDiv);
    return categBundle;
}

function getCategoryImage(category) {
    switch (category){
        case "Work" :
            return Work;
            break;
        case "Fun" :
            return fun;
            break;
        case "Administrative" :
            return administrative;
            break;
        case "Finance" :
            return financial;
            break;
        case "Groceries" :
            return groceries;
            break;
        case "Social" :
            return social;
            break;
        case "Personal" :
            return personnal;
            break;

    }}

function writeSpawn(name, desc, priority, id, category, tags, tasks, startDate, endDate, phone, address) {
    console.log(tasks);

    firebase.database().ref('users/' + userId + '/spawns/' + id).set({
        spawn_name: name,
        spawn_description: desc,
        spawn_priority: priority,
        spawn_category: category,
        spawn_tags: tags,
        spawn_tasks: tasks,
        start_date: startDate,
        end_date: endDate,
        phone_number: phone,
        address: address
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


const elem = document.querySelector('#show-span-container');
const msnry = new Masonry( elem, {
    // options
    itemSelector: '.spawn-card',
    columnWidth: 200
});











