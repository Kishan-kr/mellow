// object to maintain current time of music 
const playTime = {
    minute : 0,
    seconds : 0
}

// object to maintain duration of music 
const playDuration = {
    minute : 0,
    seconds : 0,
    totalSeconds : 0
}

let body = document.getElementsByTagName('BODY')[0];
miniPlayer = document.getElementsByClassName('miniplayer')[0];
songControls = document.getElementsByClassName('song-controls')[0];
let chevron = document.getElementById('chevron');


let libraryBtn = document.getElementById('lib');
let library = document.getElementsByClassName('library')[0];
let playerOn = false;
let currentPlayingMusic;
let playlistEnded = false;

// elements of MiniPlayer 
let thumbnail = document.querySelector('.miniplayer .detail-grp .thumbnail');
let title = document.querySelector('.miniplayer .detail-grp .song-detail .title');
let description = document.querySelector('.miniplayer .detail-grp .song-detail .desc');
let seekbar = document.getElementById('seekbar');
let currentDuration = document.getElementById('current-duration');
let totalDuration = document.getElementById('total-duration');

let expandCurrentDuration = document.getElementById('expand-current-duration');
let expandTotalDuration = document.getElementById('expand-total-duration');

let playBtn = document.getElementById('play-btn');
let previousButton = document.getElementById('prev-btn');
let nextButton = document.getElementById('next-btn');
let playedTrack = document.getElementById('played-track');

let volumeTrack = document.getElementById('volume-track');

let musicTracks = document.querySelectorAll('.library .song-track');

let cards = document.querySelectorAll('.card');

// crousel items 
let crousel = document.getElementsByClassName('song-crousel')[0];
let scrollprev = document.getElementById('scroll-prev');
let scrollNext = document.getElementById('scroll-next');

// adding listener to click event of music card 
for (const card of cards) {
    card.addEventListener('click', function() {
        playPause(card);
    })
}

// adding listener to click event of music track in library 
for(let track of musicTracks) {
    track.addEventListener('click', function() {
        let id = track.id.substring(1);
        playPause(document.getElementById(id));
    })
}
// add click event to library button 
libraryBtn.addEventListener('click', function() {
    console.log('library opened')
    library.classList.toggle('small-library')
})

nextButton.addEventListener('click', playNext);
previousButton.addEventListener('click', playPrevious);


// play next music 
function playNext() {
    let nextElement = currentPlayingMusic.parentElement.nextElementSibling;
    if(nextElement !== null)
        playPause(nextElement);
    else if(!playlistEnded) {
        currentPlayingMusic.currentTime = playDuration.totalSeconds;
        playlistEnded = true;
    }
}

// play previous music 
function playPrevious() {
    let prevElement = currentPlayingMusic.parentElement.previousElementSibling;
    if(prevElement !== null)
        playPause(prevElement);
    else 
        currentPlayingMusic.currentTime = 0;
}

// adding listener to input event of seekbar
seekbar.oninput = function() {
    currentPlayingMusic.currentTime = (seekbar.value /100) * playDuration.totalSeconds;
}

// adding listener to click event of play button inside player 
playBtn.addEventListener('click', function(){
    if(currentPlayingMusic.paused)
        currentPlayingMusic.play();
    else {
        currentPlayingMusic.pause();
    }
    toggleMusicbars(currentPlayingMusic.parentElement.id);
    togglePlayButton(playBtn);
    togglePlayButton(getPlayButton(currentPlayingMusic.parentNode));
})

// adding listener to input event of volume track 
volumeTrack.addEventListener('input', function() {
    currentPlayingMusic.volume = volumeTrack.value / 10 ;
})


// Play or pause a music 
function playPause(clickedCard) {
    let audio = getAudioElement(clickedCard);
    currentPlayingMusic = audio;
    if(audio.paused) {
        stopOther(clickedCard);
        audio.play();
        setMiniPlayer(clickedCard);
        setTrackTime(audio);
        showInLibrary(clickedCard.id);
        currentPlayingMusic.addEventListener('timeupdate', ()=> { updateTrackTime(currentPlayingMusic)});
    }
    else {
        audio.pause();
    }
    togglePlayButton(getPlayButton(clickedCard));
    togglePlayButton(playBtn);
    toggleMusicbars(clickedCard.id);
    playlistEnded = false;
}

// function to stop other Playing songs 
function stopOther(card) {
    let currentMusic = getAudioElement(card);
    for(let music of document.getElementsByTagName('audio')) {
          if(!music.paused && music != currentMusic) {
                music.load();
                togglePlayButton(getPlayButton(music.parentNode));
                togglePlayButton(playBtn);
                break;
          }  
          else if(music != currentMusic && music.currentTime > 0.0) {
                music.load();       
          }
    }
}

function getAudioElement(card) {
    for(child of card.children) {
        if(child.tagName === 'AUDIO')
            return child;
    }
}

function getPlayButton(card) {
    for(child of card.children) {
        if(child.classList.contains('card-play-btn'))
            return child;
    }
}

function togglePlayButton(button) {
    let icon;
    for(child of button.children) {
        if(child.tagName === "I")
            icon = child;
    }

    if(icon.classList.contains('fa-circle-play')) {
        icon.classList.remove('fa-circle-play');
        icon.classList.add('fa-circle-pause');
    }
    else {
        icon.classList.remove('fa-circle-pause');
        icon.classList.add('fa-circle-play');
    }
}


// setting MiniPlayer 
function setMiniPlayer(card) {
    if(!playerOn)
        miniPlayer.style.visibility = 'visible';

    for(let child of card.children) {
        if(child.tagName === 'IMG') {
            let src = child.getAttribute('src');
            thumbnail.setAttribute('src', src);
        }

        if(child.classList.contains('title'))
            title.innerHTML = child.innerHTML;
        if(child.classList.contains('detail'))
            description.innerHTML = child.innerHTML;
    }
}

// maximize the player panel 
chevron.addEventListener('click', function () {
    miniPlayer.classList.toggle('expand');
    songControls.classList.toggle('fa-2x');
    body.classList.toggle('overflow-hidden');
    libraryBtn.classList.toggle('disabled');
})

// setting time track 
function setTrackTime(music){
    var currentTimeInSec = music.currentTime;
    playTime.minute = parseInt(currentTimeInSec / 60);
    playTime.seconds = pad(parseInt(currentTimeInSec % 60));
    let duration = music.duration;
    playDuration.totalSeconds = duration;
    playDuration.minute = parseInt(duration / 60);
    playDuration.seconds = pad(parseInt(duration % 60));
    currentDuration.innerText = `${playTime.minute}:${playTime.seconds}`;
    totalDuration.innerText = `${playDuration.minute}:${playDuration.seconds}`;

    expandCurrentDuration.innerText = `${playTime.minute}:${playTime.seconds}`;
    expandTotalDuration.innerText = `${playDuration.minute}:${playDuration.seconds}`;

    seekbar.value = currentTimeInSec;
    music.onended = () => {
        togglePlayButton(playBtn);
        togglePlayButton(getPlayButton(music.parentNode))
        if(music.parentElement.nextElementSibling !== null) {
            setTimeout(playPause, 2000, music.parentElement.nextElementSibling)
        }
    }
    music.onseeking = () => {music.pause();}
    music.onseeked = () => {music.play();}
}

function updateTrackTime(music) {
    var currentTimeInSec = music.currentTime;
    let position = (currentTimeInSec / playDuration.totalSeconds) * 100;
    playedTrack.style.width = `${position}%`;
    seekbar.value = position;
    playTime.minute = parseInt(currentTimeInSec / 60);
    playTime.seconds = pad(parseInt(currentTimeInSec % 60));
    currentDuration.innerText = `${playTime.minute}:${playTime.seconds}`;
    expandCurrentDuration.innerText = `${playTime.minute}:${playTime.seconds}`;
}

// show the same music playing on library 
function showInLibrary(id) {
    // removing playing class from previous track 
    for(child  of library.children) {
        if(child.classList.contains('playing')) {
            child.classList.remove('playing'); 
        }
    }

    // adding playing class to current playing track 
    let playingTrack = library.children[id];
    playingTrack.classList.add('playing');
    for(child of playingTrack.children[1].children) {
        // child.classList.remove('pause');
        child.classList.add('animate');
    }
}

function toggleMusicbars(id) {
    if(currentPlayingMusic.paused) {
        for(child of library.children[id].children[1].children) {
            child.classList.remove('animate');
            child.classList.add('pause');
        }
    }
    else {
        for(child of library.children[id].children[1].children) {
            child.classList.add('animate');
            child.classList.remove('pause');
        }
    }
}

// function to scroll previous 
scrollprev.addEventListener('click', function() {
    crousel.scrollLeft -= 640;
})

// function to scroll next 
scrollNext.addEventListener('click', function() {
    crousel.scrollLeft += 640;
})

// padding function 
function pad(val) {
    val = val < 10 ? "0" + val : val;
    return val;
}
