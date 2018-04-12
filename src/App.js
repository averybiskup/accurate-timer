import React, { Component } from 'react';
import './App.css';
import ArrowUp from 'react-icons/lib/fa/caret-up'
import ArrowRight from 'react-icons/lib/fa/caret-right'
import ArrowDown from 'react-icons/lib/fa/caret-down'
import ArrowLeft from 'react-icons/lib/fa/caret-left'

class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      time: 0,
      hour: 0,
      min: 0,
      sec: 0,
      startTime: 1500,
      running: false,
      chosen: 1,
      now: 0,
      paused: false,
      saveTime: 0,
      sound: new AudioContext()
    }
  }

  componentDidMount() {
    this.timeString(this.state.startTime)

    // Key press actions
    let keyDownTextField = (e) => {
      var keyCode = e.keyCode;
      if (this.state.running === false) {
        if (window.innerWidth > 540) {
          switch(keyCode) {
            case 37: this.moveLeft(); break
            case 39: this.moveRight(); break
            case 38: this.upOrDown(1); break
            case 40: this.upOrDown(-1); break
            default: break
          }
        } else {
          switch(keyCode) {
            case 37: this.upOrDown(-1); break
            case 39: this.upOrDown(1); break
            case 38: this.moveLeft(); break
            case 40: this.moveRight(); break
            default: break
          }
        }
      }
      if (keyCode === 32) { this.startTime() }
     }

    document.addEventListener('keydown', keyDownTextField, false);

    this.setColors()
    this.getSound()
  }


  // For setting the correct colors of the numbers
  setColors = (n) => {

    let arr = ['hour', 'min', 'sec'], id = arr[this.state.chosen]
    arr.map((i) => {
      document.getElementById(i).className = (i === id && n !== 'clear') ? 'chosen' : ''
      document.getElementsByClassName('up-' + i)[0].style.visibility = (i === id) ? 'visible' : 'hidden'
      document.getElementsByClassName('down-' + i)[0].style.visibility = (i === id) ? 'visible' : 'hidden'
    })
  }

  // Adding or subtracting from the current time
  upOrDown = (sign) => {
    let arr = [3600, 60, 1], t = arr[this.state.chosen] * sign

    if (this.state.startTime > 0 && (this.state.startTime >= t / sign || sign > 0) && this.state.startTime < 219599) {
      this.setState({ startTime: this.state.startTime + t, saveTime: this.state.startTime + t }, () => { this.timeString() })
    } else if (this.state.startTime < 219599) {
      this.setState({ startTime: this.state.startTime + t / sign, saveTime: this.state.startTime + t / sign }, () => { this.timeString() })
    } else {
      this.setState({ startTime: this.state.startTime + (t / sign) * -1, saveTime: this.state.startTime + (t / sign) * -1 }, () => { this.timeString() })
    }
  }

  moveLeft = () => { if (this.state.chosen > 0) { this.setState({ chosen: this.state.chosen -= 1}, () => { this.setColors(this.state.chosen) }) } }

  moveRight = () => { if (this.state.chosen < 2) { this.setState({ chosen: this.state.chosen += 1}, () => { this.setColors(this.state.chosen) }) } }

  set = () => { this.setState({ time: Date.now(), total: this.state.startTime, running: true }) }

  doubleString = (str) => { return (String(str).length < 2) ? '0' + String(str) : str }

  // Displaying the time
  display = (hour, min, sec) => {
    let h1 = document.getElementById('hour1'), h2 = document.getElementById('hour2'), m1 = document.getElementById('min1'), m2 = document.getElementById('min2'), s1 = document.getElementById('sec1'), s2 = document.getElementById('sec2')
    hour = String(hour), min = String(min), sec = String(sec)

    h1.innerHTML = hour.split('')[0]; h2.innerHTML = hour.split('')[1]
    m1.innerHTML = min.split('')[0]; m2.innerHTML = min.split('')[1]
    s1.innerHTML = sec.split('')[0]; s2.innerHTML = sec.split('')[1]
  }

  // Doing math on the total seconds to create the correct time in terms of hours, mins, and seconds
  timeString = (n) => {
    let num = n || this.state.startTime - this.state.time
    this.setState({ hour: parseInt(((num) / 60 / 60) * 1, 10) / 1 }, () => {
      this.setState({ min: parseInt(((num) / 60) * 1, 10) / 1 - this.state.hour * 60}, () => {
        this.setState({ sec: parseInt(((num)) * 1, 10) / 1 - (this.state.min + (this.state.hour * 60)) * 60}, () => {
          this.display(this.doubleString(this.state.hour), this.doubleString(this.state.min), this.doubleString(this.state.sec))
        })
      })
    })
  }

  // Pause timer from counting down
  pause = () => {
    // Saving the startTime in order to reset it once the timer hits 0
    if ((this.state.saveTime < this.state.startTime)) { this.setState({ saveTime: this.state.startTime }) }

    this.setState({ paused: true, running: false, startTime: this.state.now, time: 0, hour: 0, min: 0, sec: 0 }, () => {
      this.setColors(this.state.chosen)
    })
  }

  // Main timing function
  timer = () => {
    let time = Math.round((Date.now() - this.state.time) / 1000), now = this.state.startTime - time

    this.timeString(now)
    this.setState({ now: this.state.startTime - time })

    if (now <= 0 || this.state.paused === true) {

      this.setState({ sec: 0, hour: 0, min: 0, running: false, time: 0 })
      this.timeString()
      this.setColors(this.state.chosen)

      if (now === 0) {
        if (this.state.saveTime > 0) { this.setState({ startTime: this.state.saveTime }, () => { this.timeString(this.state.saveTime) })}
        this.playSound('timer finished')
      }

    } else {
      setTimeout(this.timer, 950)
    }
  }

  startTime = () => {
    if (this.state.running === true && this.state.paused === false) {
      this.pause()
    } else if (this.state.startTime > 0) {
      this.playSound('timer starting')
      this.set()
      this.setColors('clear')

      this.setState({ running: true, paused: false })

      this.timer()

    }
  }

  getSound = () => {
    window.speechSynthesis.onvoiceschanged = () => {
      let voices = []
      let voice = window.speechSynthesis.getVoices()
      voice.map((i) => { voices.push(i) })
      this.setState({ voices: voices })
    }
  }

  beep = (num) => {
    let audioCtx = this.state.sound
    let oscillator = audioCtx.createOscillator();
    oscillator.frequency.value = num + 1;

    oscillator.frequency.value *= Math.pow(2, 1/12)

    oscillator.connect(audioCtx.destination);
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.1);
  }

  playSound = (str) => {

    this.beep(600)
    setTimeout(() => { this.beep(700) }, 200)

    let txt = str
    var msg = new SpeechSynthesisUtterance(txt);
    msg.voice = this.state.voices[49]
    setTimeout(() => {
      window.speechSynthesis.speak(msg)
    }, 300)
  }

  render() {

    return (
      <div className="App">
        <div id="hour">
          <ArrowUp className="up-hour"></ArrowUp>
          <div id="hour1"></div>
          <div id="hour2"></div>
          <ArrowDown className="down-hour"></ArrowDown>
        </div>
        <div id="min">
          <ArrowUp className="up-min"></ArrowUp>
          <div id="min1"></div>
          <div id="min2"></div>
          <ArrowDown className="down-min"></ArrowDown>
        </div>
        <div id="sec">
          <ArrowUp className="up-sec"></ArrowUp>
          <div id="sec1"></div>
          <div id="sec2"></div>
          <ArrowDown className="down-sec"></ArrowDown>
        </div>
          <div id="textBlock">
            <div className="text">"space" to start</div>
            <div className="text">
            <ArrowUp className="arrow"></ArrowUp>
            <ArrowDown className="arrow"></ArrowDown>
            <ArrowRight className="arrow"></ArrowRight>
            <ArrowLeft className="arrow"></ArrowLeft>
            set the time
            </div>
          </div>
      </div>
    );
  }
}

export default App;
