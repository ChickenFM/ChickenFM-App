const Vue = require("vue/dist/vue")
const axios = require("axios")
const { remote } = require('electron');

const dataVue = new Vue({
    el: '#app',
    data: {
        art: "./img/default.png",
        title: "",
        artist: "",
        playing: false
    },
    methods: {
        toggle() {
            stream = this.$refs.audio;
            if (stream.paused) {
                stream.src = "https://radio.chickenfm.com/radio/8000/radio.mp3"
                stream.play()
            } else {
                stream.src = "";
            }
            this.playing = !stream.paused
        },
        close() {
            var window = remote.getCurrentWindow();
            window.close();
        },
        changeVolume(volume) {
            stream = this.$refs.audio;
            stream.volume = volume.target.value / 100;
        },
    }
})

const getData = () => {
    axios.get("https://api.chickenfm.com/nowplaying")
        .then(({ data }) => {
            if (dataVue.art !== data.cover_medium) {
                dataVue.art = data.cover_medium;
                dataVue.title = data.title;
                dataVue.artist = data.artist;
            }
        })
}
getData()
setInterval(getData, 5000)

//update notification
const notification = document.getElementById('notification');
const message = document.getElementById('message');
const restartButton = document.getElementById('restart-button');
ipcRenderer.on('update_available', () => {
    ipcRenderer.removeAllListeners('update_available');
    message.innerText = 'A new update is available. Downloading now...';
    notification.classList.remove('hidden');
});
ipcRenderer.on('update_downloaded', () => {
    ipcRenderer.removeAllListeners('update_downloaded');
    message.innerText = 'Update Downloaded. It will be installed on restart. Restart now?';
    restartButton.classList.remove('hidden');
    notification.classList.remove('hidden');
});

function closeNotification() {
    notification.classList.add('hidden');
}

function restartApp() {
    ipcRenderer.send('restart_app');
}