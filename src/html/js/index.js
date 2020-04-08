const Vue = require("vue/dist/vue")
const axios = require("axios")
const { remote, ipcRenderer } = require('electron');

if (!localStorage.getItem("station") || localStorage.getItem("station") == null) {
    localStorage.setItem("station", "1")
    localStorage.setItem("url", "https://radio.chickenfm.com/radio/8000/radio.mp3")
}


//audio player functions
const pauseRadio = () => {
    var stream = document.getElementById("audio");
    stream.pause()
    dataVue.playing = false
}
const playRadio = () => {
    var stream = document.getElementById("audio");
    stream.src = ''
    dataVue.loading = true
    stream.src = localStorage.getItem("url")
    stream
        .play()
        .then(() => {
            dataVue.loading = false
            dataVue.playing = true
        })
}
const stopRadio = () => {
    var stream = document.getElementById("audio");
    stream.pause()
    stream.src = ''
    dataVue.playing = false
}

//API
const dataVue = new Vue({
    el: '#app',
    data: {
        art: "./img/default.png",
        title: "",
        artist: "",
        playing: false,
        loading: true
    },
    methods: {
        toggle() {
            stream = this.$refs.audio;
            if (stream.paused) {
                playRadio()
            } else {
                pauseRadio()
            }
        },
        close() {
            var window = remote.getCurrentWindow();
            window.close();
        },
        changeVolume(volume) {
            stream = this.$refs.audio;
            stream.volume = volume.target.value / 100;
        },
        requestsong() {
            ipcRenderer.send('requestsong', localStorage.getItem("station"));
        },
        stationchanger() {
            ipcRenderer.send('stationChanger')
        }
    }
})
var offline = false
const getData = () => {
    axios.get(`https://api.chickenfm.com/nowplaying/${localStorage.getItem("station")}`)
        .then(({ data }) => {
            offline = false
            if (dataVue.art !== data.cover_medium) {
                dataVue.art = data.cover_medium;
                dataVue.title = data.title;
                dataVue.artist = data.artist;
                setMetaData(data)
            }
        }).catch(e => {
            if (e.response.status == 400) {
                localStorage.setItem('station', 1)
                localStorage.setItem('url', "https://radio.chickenfm.com/radio/8000/radio.mp3")
                let errorNotification = new Notification(`There was an error connecting!`, {
                    body: 'An error occurred while connecting to ChickenFM so the default station is put back to ChickenFM'
                })
            }
            if (!offline) {
                offline = true
                    // No internet notification
                axios.get("https://radio.chickenfm.com/api/status")
                    .then(() => offline = false)
                    .catch(() => {
                        let OfflineNotification = new Notification(`You're offline!`, {
                            body: 'ChickenFM could not connect to the internet!'
                        })
                        dataVue.title = "Offline";
                        dataVue.artist = "Connect to the internet to use ChickenFM";
                        dataVue.art = "./img/default.png";
                    })
            }
        }).then(() => dataVue.loading = false)
}
getData()
setInterval(getData, 5000)

ipcRenderer.on("updateStation", () => {
    getData()
    var stream = document.getElementById("audio");
    if (!stream.paused) {
        pauseRadio()
        playRadio()
    }
})

// Show metadata of songs on windows and use media keys
const setMetaData = (data) => {
        if ('mediaSession' in navigator) {
            navigator.mediaSession.metadata = new MediaMetadata({
                title: data.title,
                artist: data.artist,
                artwork: [
                    { src: data.cover_medium, sizes: '250x250', type: 'image/jpg' },
                    { src: data.cover_xl, sizes: '1000x1000', type: 'image/jpg' },
                ]
            });
            navigator.mediaSession.setActionHandler('play', function() {
                playRadio();
            });
            navigator.mediaSession.setActionHandler('pause', function() {
                pauseRadio()
            });
            navigator.mediaSession.setActionHandler('stop', function() {
                stopRadio()
            });
        }
    }
    /*ipcRenderer.send('app_version');
    ipcRenderer.on('app_version', (event, arg) => {
      ipcRenderer.removeAllListeners('app_version');
      version.innerText = 'Version ' + arg.version;
    });*/