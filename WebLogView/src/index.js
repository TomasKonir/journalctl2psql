import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'

var realDisplayVh = window.innerHeight + 'px'

ReactDOM.render(<App />, document.getElementById("root"))

window.isMobile = false;

function init() {
    ReactDOM.render(<App />, document.getElementById("root"))

    function resizeListener() {
        realDisplayVh = window.innerHeight * 0.01
        document.documentElement.style.setProperty("--vh", `${realDisplayVh}px`)
        document.getElementById("root").style.height = (realDisplayVh * 100) + "px"
        if (window.matchMedia("(any-hover: none)").matches) {
            console.info('mobile')
            window.isMobile = true
        }
    }

    resizeListener()
    window.addEventListener("resize", resizeListener)
}


window.onload = () => {
    init()
    if (window.navigator && navigator.serviceWorker) {
        if (window.location.hostname !== 'localhost') {
            navigator.serviceWorker.register('worker.js').then(
                function (registration) {
                    console.info("worker registered")
                }
            )
        }
    }
}
