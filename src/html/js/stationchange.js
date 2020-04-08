const Vue = require("vue/dist/vue")
const axios = require("axios")
const { remote, ipcRenderer } = require('electron');

const stationVue = new Vue({
    el: "#app",
    data: {
        stations: [],
        loading: true,
        current: localStorage.getItem('station'),
        errored: false
    },
    methods: {
        stationchange(e) {
            const id = e.toElement.getAttribute("value")
            const station = this.stations.find(st => st.id == id)
            localStorage.setItem("station", id)
            localStorage.setItem("url", station.listen_url)
            ipcRenderer.send("changeStation")
            window.close()
        }
    }
})
axios.get("https://radio.chickenfm.com/api/stations")
    .then(stations => {
        stationVue.stations = stations.data;
        stationVue.loading = false;
    })
    .catch(e => stationVue.errored = true)