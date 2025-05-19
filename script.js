let currentSong = new Audio()

let songs

let isPlaying = false;

let m, p, s

let isFirstAttempt = true

let prevSong

let currVolume = 0.5

let currFolder = 'My%20Favourites'

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

function updatePrevSong(songName) {
    let lists = document.querySelector('.songList').getElementsByTagName('li')
    for (let list of lists) {
        if (list.querySelector('.info').getElementsByTagName('div')[0].textContent == songName) {
            p = list.querySelector('.playNow').getElementsByTagName('img')[0]
        }
    }
}


async function getSongs(folder) {
    let response = await fetch(`http://127.0.0.1:5500/Songs/${folder}`)
    let data = await response.text()

    let div = document.createElement('div')
    div.innerHTML = data

    let as = div.getElementsByTagName('a')
    songs = []

    for (let a of as) {
        if (a.href.endsWith('.mp3')) {
            songs.push(a.href.split(`/Songs/${folder}/`)[1].replaceAll('%20', ' '))
        }
    }

    let songsUL = document.querySelector('.songList').getElementsByTagName('ul')[0]
    songsUL.innerHTML = ""

    // Create List of songs 
    for (let song of songs) {
        songsUL.innerHTML = songsUL.innerHTML + ` <li>
                <img src="./Images/music.svg" alt="music" class="invert">
                <div class="info">
                  <div>${song.split('-')[0]}</div>
                  <div>${song.split('-')[1].replace('.mp3', '')}</div>
                </div>
                <div class="playNow">
                  <span>Play Now</span>
                  <img src="./Images/play.svg" alt="play" class="invert">
                </div>
              </li>`
    }

    // Loading first song
    s = document.querySelector('.songList').querySelector('li').querySelector('.info')
    m = s.getElementsByTagName('div')[0].innerHTML + '-' + s.getElementsByTagName('div')[1].innerHTML + '.mp3'
    p = document.querySelector('.songList').querySelector('li').querySelector('.playNow').querySelector('img')

    // Handling the list of songs
    Array.from(document.querySelector('.songList').getElementsByTagName('li')).forEach((e) => {
        e.addEventListener("click", () => {
            m = e.querySelector('.info').getElementsByTagName('div')[0].innerHTML + '-' + e.querySelector('.info').getElementsByTagName('div')[1].innerHTML + '.mp3'
            p = e.querySelector('.playNow').querySelector('img')
            if (isFirstAttempt) {
                prevSong = p
                isFirstAttempt = false
            }
            playMusic(m.trim())
        })
    })
}

async function getAlbums() {
    let response = await fetch('http://127.0.0.1:5500/Songs/')
    let data = await response.text()
    let div = document.createElement('div')
    div.innerHTML = data

    let anchors = div.getElementsByTagName('a')
    let folders = []
    for (let a of anchors) {
        if (a.href.includes('/Songs/')) {
            folders.push(a.href.split('/Songs/')[1])
        }
    }

    let cardContainer = document.querySelector('.cardContainer')

    for (let folder of folders) {
        let response = await fetch(`http://127.0.0.1:5500/Songs/${folder}/info.json`)
        let data = await response.json()
        cardContainer.innerHTML = cardContainer.innerHTML + `
         <div data-folder=${folder} class="card">
            <div class="playbtn">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="12" fill="#1fdf64" />
                <path d="M8 6V18L18 12L8 6Z" fill="#000000" />
              </svg>
            </div>
            <img src="./Songs/${folder}/cover.jpeg" alt="Fav" />
            <h2>${data.title}</h2>
            <p>${data.description}</p>
          </div>`

    }
}



const playMusic = (track) => {
    const trackUrl = new URL(`./Songs/${currFolder}/` + track, window.location.origin).href;

    document.querySelector('.songInfo').innerHTML = track.replace('.mp3', '')
    document.querySelector('.songTime').innerHTML = '00:00 / 00:00'

    // Check if the current song is different
    if (currentSong.src !== trackUrl) {
        currentSong.src = trackUrl; // Update the source for a new track
        isPlaying = false; // Reset the state for the new track
        prevSong.src = './Images/play.svg'
        prevSong = p
    }
    if (isPlaying) {
        currentSong.pause()
        isPlaying = false
        p.src = './Images/play.svg'
        play.src = './Images/play.svg'
    }
    else {
        currentSong.play()
        isPlaying = true
        p.src = './Images/pause.svg'
        play.src = './Images/pause.svg'
    }
}

async function main() {

    //Load the Albums
    await getAlbums()

    //Load the Initial Playlist
    await getSongs(currFolder)

    //Set the volume of current song
    currentSong.volume = currVolume

    // Handling Play Button
    play.addEventListener('click', () => {
        if (isFirstAttempt) {
            prevSong = p
            isFirstAttempt = false
            playMusic(m.trim())
        }
        else {
            if (currentSong.paused) {
                currentSong.play()
                play.src = './Images/pause.svg'
                p.src = './Images/pause.svg'
            }
            else {
                currentSong.pause()
                play.src = './Images/play.svg'
                p.src = './Images/play.svg'

            }
        }

    })

    // Add an event listener to update the current time of song
    currentSong.addEventListener('timeupdate', () => {
        document.querySelector('.songTime').innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`
        document.querySelector('.circle').style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%"
    })

    // Add an event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100
    })

    // Add an event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })

    // Add an event listener for close button
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%"
    })

    //Add an event listener to Prev button
    previous.addEventListener('click', () => {
        let idx = songs.indexOf(currentSong.src.split(`/Songs/${currFolder}/`)[1].replaceAll('%20', ' '))
        if (idx - 1 >= 0) {
            updatePrevSong(songs[idx - 1].split('-')[0])
            playMusic(songs[idx - 1])
        }
    })

    //Add an event listener to Next button
    next.addEventListener('click', () => {
        let idx = songs.indexOf(currentSong.src.split(`/Songs/${currFolder}/`)[1].replaceAll('%20', ' '))
        if (idx + 1 < songs.length) {
            updatePrevSong(songs[idx + 1].split('-')[0])
            playMusic(songs[idx + 1])
        }
    })

    //Add an event listener to Volume bar
    document.querySelector('.range').getElementsByTagName('input')[0].addEventListener('change', (e) => {
        currentSong.volume = parseInt(e.target.value) / 100
        currVolume = currentSong.volume
    })

    //Add an event listener to Volume image
    document.querySelector('.volume').getElementsByTagName('img')[0].addEventListener('click', (e) => {
        if (e.target.src.split('/').slice(-1) == 'volume.svg') {
            e.target.src = './Images/mute.svg'
            currentSong.volume = 0
            slider.value = 0
        }
        else {
            e.target.src = './Images/volume.svg'
            currentSong.volume = currVolume
            slider.value = currVolume * 100
        }
    })

    //Add an event listener to every Playlist
    Array.from(document.querySelector('.cardContainer').getElementsByClassName('card')).forEach((e) => {
        e.addEventListener('click', async () => {
            currFolder = e.dataset.folder
            await getSongs(currFolder)
        })
    })

}

main()
