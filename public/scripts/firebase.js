/** JavaScript Document for Google's Firebase's cloud authentication and database sync
 * Created by Jerome Robbins on 18-02-12. */

let songRef, tubeRef, userRef;
let userId = "Zdh2ZOt9AOMKih2cNv00XSwk3fh1";

/** UI for the user's profile: bt=Buttons; tx=Text inputs. */
let btCancel = document.getElementById('cancel');
let btSign = document.getElementById("sign");
let btSignIn = document.getElementById('signIn');
let btSignUp = document.getElementById('signUp');
let txEmail = document.getElementById("courriel");
let txPassword = document.getElementById("password");
let items1 = document.getElementById('items1');
let items2 = document.getElementById('items2');
let items3 = document.getElementById('items3');

/** Database's key name */
const key = {
    ID: 'id',
    AS: 'artist',
    BD: 'birthDate',
    CD: 'createdAt',
    DD: 'deletedAt',
    FS: 'featuring',
    IS: 'icon',
    KS: 'kind',
    MS: 'mixedBy',
    NS: 'name',
    PI: 'position',
    RD: 'releasedAt',
    UD: 'updatedAt',
    VI: 'version'
};

/** Database's table name */
const table = {
    SONG: 'song',
    TUBE: 'tube',
    USER: 'user'
};


function card(entity, path) {
    const article = document.createElement("article");
    article.setAttribute("class", "card-" + path);
    const aside = document.createElement("aside"); // Hashtags
    aside.setAttribute("class", "hashtags");
    if (entity[key.RD] !== undefined) {
        const year = new Date(entity[key.RD]).getFullYear();
        aside.textContent = "#" + year
    }

    const frame = document.createElement("div");
    frame.setAttribute("class", "card-main");

    const container = document.createElement("div");
    container.setAttribute("class", "frame " + path);

    const thumbnail = document.createElement("img");
    thumbnail.alt = entity[key.NS] + " thumbnail";
    thumbnail.setAttribute("class", "small");
    thumbnail.id = path + "-icon-" + entity[key.ID];
    switch (path) {
        case table.SONG:
            thumbnail.src = "https://img.youtube.com/vi/" + entity[key.ID] + "/0.jpg";
            break;
        case table.TUBE:
            thumbnail.src = "assets/ic_playlist.svg";
            break;
        case table.USER:
            thumbnail.src = "assets/" + entity[key.IS] + ".svg";
            console.log(path);
            break;
    }

    const content = document.createElement("div");
    content.setAttribute("class", "content");
    let link;
    switch (path) {
        case table.SONG:
            link = document.createElement("a");
            link.href = "javascript:mixing('" + entity[key.ID] + "');";
            break;
        case table.TUBE:
            link = document.createElement("div");
            break;
        case table.USER:
            link = document.createElement("div");
            break;
    }
    if (link != null) link.setAttribute("class", "card-link");

    const h3 = document.createElement("h3");
    if (path === table.TUBE) {
        let title = entity[key.NS];
        if (title !== undefined && title.startsWith("tx_")) switch (title) {
            case 'tx_tube_default':
                h3.textContent = "Default playlist";
                break;
            case 'tx_tube_apero':
                h3.textContent = "Playlist apero";
                break;
            case 'tx_tube_bistro':
                h3.textContent = "Playlist bistro";
                break;
            case 'tx_tube_club':
                h3.textContent = "Playlist club";
                break;
        } else h3.textContent = entity[key.NS];
    } else h3.textContent = entity[key.NS];

    const h4 = document.createElement("h4");
    let subtitle = "", version = "";
    switch (path) {
        case table.SONG:
            if (entity[key.AS] !== undefined) subtitle += entity[key.AS];
            if (entity[key.FS] !== undefined) subtitle += " ft " + entity[key.FS];
            if (entity[key.KS] !== undefined) version += entity[key.KS];
            break;
        case table.TUBE:
            break;
        case table.USER:
            break;
    }
    h4.textContent = subtitle;

    const menu = document.createElement("aside");
    menu.setAttribute("class", "options");
    const embed = document.createElement("embed");
    embed.alt = "Play next icon";
    embed.src = "assets/ic_queue.svg";
    switch (path) {
        case table.SONG:
            const play = document.createElement("embed");
            play.alt = "Play icon";
            play.src = "assets/ic_play.svg";
            play.type = "image/svg+xml";
            play.onload = function() {
                over(play).onclick = function() {
                    mixing(entity[key.ID]);
                };
            };

            // TODO if (!admin && !pro) { pen.themes.height = "0"; }
            // TODO if (wired) { bill(inserting, insert, data[_KEY], tab); }

            embed.onload = function() {
                over(embed,false).onclick = function() {
                    playlst[playlst.length] = entity[key.ID];
                    next();
                };
            };
            menu.appendChild(play);
            menu.appendChild(embed);
            break;
        case table.TUBE:
            break;
        case table.USER:
            break;
    }

    article.appendChild(frame);
    frame.appendChild(container);
    container.appendChild(thumbnail);
    frame.appendChild(content);
    if (link != null) {
        content.appendChild(link);
        link.appendChild(h3);
        link.appendChild(h4);
    }
    frame.appendChild(menu);
    article.appendChild(aside);
    return article
}

/** Login errors alerts */
function fail(error) {
    switch (error.code) {
        case 'auth/weak-password':
            alert('The password is too weak.');
            break;
        case 'auth/wrong-password':
            alert('Wrong password.');
            break;
        default:
            alert(error.message);
            break;
    }
    console.log(error);
}

/** Login inputs validation */
function good(courriel, password) {
    "use strict";
    if (courriel.length < 4) {
        alert('Please enter an email address.');
        return false;
    }
    if (password.length < 4) {
        alert('Please enter a password.');
        return false;
    }
    return true;
}

function head() {
    const head = document.createElement("header");
    const left = document.createElement("div");
    const main = document.createElement("div");
    const side = document.createElement("div");
    head.setAttribute("class","details");
    left.setAttribute("class","left");
    main.setAttribute("class","main");
    side.setAttribute("class","side");
    head.appendChild(left);
    head.appendChild(main);
    head.appendChild(side);
    return [head,left,main,side];
}

/** Firebase initialization and user authentication */
function init() {
    songRef = firebase.database().ref('song');
    tubeRef = firebase.database().ref('tube');
    userRef = firebase.database().ref('user');
    /** Animated logo */
    const storageRef = firebase.storage().ref(); // jshint ignore:line
    const file = "Miksing_Logo-Animated";
    const video = document.getElementsByTagName('video')[0];
    const source1 = document.createElement("source");
    source1.type = "video/mp4";
    const source2 = document.createElement("source");
    source2.type = "video/webm";
    storageRef.child("anim/" + file + ".mp4").getDownloadURL().then(function (url) {
        source1.src = url;
    }).then(function () {
        storageRef.child("anim/" + file + ".webm").getDownloadURL().then(function (url) {
            source2.src = url;
            video.appendChild(source1);
            video.appendChild(source2);
            video.load();
            video.muted = true;
            video.play();
        });
    });
    video.style.height = "auto";
    video.style.opacity = "1";
    /** Authentication */
    btSignIn.addEventListener('click', function () {
        if (firebase.auth().currentUser) firebase.auth().signOut();
        else {
            const email = txEmail.value;
            const password = txPassword.value;
            if (good(email, password)) {
                firebase.auth().signInWithEmailAndPassword(email, password)
                    .catch(function (error) {
                        fail(error);
                    });
            }
        }
    });
    btSignUp.addEventListener('click', function () {
        const email = txEmail.value;
        const password = txPassword.value;
        if (good(email, password)) {
            firebase.auth().createUserWithEmailAndPassword(email, password)
                .catch(function (error) {
                    fail(error);
                });
        }
    });
    btCancel.addEventListener('click', function () {
        btSign.checked = false;
    });
    items3.innerHTML = "";
    user(userId);

    /* Google Analytics */
    firebase.analytics();

    /* Google Performance */
    firebase.performance()
}

function next() {
    const prepare = document.getElementById("prepare");
    prepare.innerHTML = "";
    playlst.forEach(function(songId) {
        const header = head();
        songRef.child(songId).once('value').then(function (snapshot) {
            header[2].textContent = snapshot.val().name;
        });
        prepare.appendChild(header[0]);
    });
}

// Fill color of embedded svg
function over(embed, exit) {
    let enter = "#0c0";
    let leave = "#000";
    if (exit) {
        enter = "#c00";
        leave = "#00c";
    }
    const svg = embed.getSVGDocument().getElementsByTagName("svg")[0];
    svg.setAttribute("onmouseenter", "evt.target.themes.fill='" + enter + "';");
    svg.setAttribute("onmouseleave", "evt.target.themes.fill='" + leave + "';");
    return svg;
}

function song(id) {
    songRef.child(id).once('value').then(function (snapshot) {
        const entity = [];
        entity[key.ID] = snapshot.key;
        entity[key.AS] = snapshot.val().artist;
        entity[key.FS] = snapshot.val().featuring;
        //entity[key.KS] = snapshot.val().kind;
        entity[key.MS] = snapshot.val().mixedBy;
        entity[key.NS] = snapshot.val().name;
        entity[key.RD] = snapshot.val().releasedAt;
        items3.appendChild(card(entity, table.SONG));

    });
}

function tube(id) {
    tubeRef.child(id).once('value').then(function (snapshot) {
        const entity = [];
        entity[key.ID] = snapshot.key;
        entity[key.NS] = snapshot.val().name;
        console.log("Name: " + entity[key.NS]);
        items2.appendChild(card(entity, table.TUBE));

        snapshot.child('song').forEach(function (snapshot) {
            song(snapshot.key);

        });
    });
}

function user(id) {
    userRef.child(id).once('value').then(function (snapshot) {
        const entity = [];
        console.log("User: " + entity[key.NS]);

        entity[key.ID] = snapshot.key;

        entity[key.IS] = snapshot.child('data').val().icon;
        entity[key.NS] = snapshot.child('data').val().name;

        items1.appendChild(card(entity, table.USER));
        tube('-M0A1B6LQlpJpgdbkYyx');
        /* snapshot.child('tube').forEach(function (snapshot) {
            tube(snapshot.key)
        }) */
    });
}