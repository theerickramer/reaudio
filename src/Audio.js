import React, { Component } from 'react';
import MultiSlider from 'multi-slider';

class Audio extends Component {
  constructor(props) {
    super(props);
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    this.audioContext = new AudioContext();
    this.state = {
      detuneValue: 0,
      isPlaying: false,
      playbackRate: 1,
      loopDuration: 0,
      loopStart: 0,
      loopEnd: 0,
      src: 'robotic02_1.wav'
    };
    // this.audioContext.addEventListener('statechange', () => console.log(this.audioContext.currentTime))
  }
  
  getAudio() {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', this.state.src);
      xhr.responseType = 'arraybuffer';
      xhr.onload = () => {
        this.audioContext.decodeAudioData(xhr.response, decoded => {
          this.buffer = decoded;
          this.audio.buffer = this.buffer;
          this.startOffset = 0;
          this.loaded = true;
          this.setState({ loopDuration: this.buffer.duration });
          resolve(this.buffer);
        });
      };
      xhr.send();
    });
  }

  isPlaying(bool) {
    if (bool) {
      this.play();
    } else {
      this.pause();
    }
    this.setState({ isPlaying: bool });
  }

  play() {
    this.audio = this.audioContext.createBufferSource();
    this.volume = this.audioContext.createGain();
    this.audio.connect(this.volume);
    this.volume.connect(this.audioContext.destination);

    if (!this.loaded) {
      this.getAudio().then(() => this.startLoop());
    } else {
      this.audio.buffer = this.buffer;
      this.startLoop();
    }
  }

  stop() {
    this.audio.stop();
    this.startOffset = 0;
  }

  pause() {
    this.audio.stop();
    this.startOffset = this.audioContext.currentTime;
  }

  volumeChange() {
    this.volume.gain.value = this.refs.volume.value / 100;
  }

  setDetune(e) {
    const detuneValue = e.target.value;
    this.setState({ detuneValue }, () => this.detune());
  }

  detune() {
    this.audio.detune.value = this.state.detuneValue;
  }

  setPlaybackRate(e) {
    const playbackRate = e.target.value;
    this.setState({ playbackRate }, () => this.playbackRate());
  }

  playbackRate() {
    this.audio.playbackRate.value = this.state.playbackRate;
  }

  startLoop() {
    this.audio.loop = true;
    this.audio.loopStart = this.state.loopStart;
    this.audio.loopEnd = this.state.loopStart + this.state.loopDuration;
    this.detune();
    this.playbackRate();
    this.audio.start(0, this.startOffset);
  }

  setLoop([loopStart, loopDuration, loopEnd]) {
    this.audio.stop();
    this.startOffset = loopStart;
    this.setState({ loopStart, loopDuration, loopEnd }, () =>
      this.play()
    );
  }

  render() {
    return (
      <div>
        {this.state.isPlaying ? (
          <button onClick={() => this.isPlaying(false)}>Pause</button>
        ) : (
          <button onClick={() => this.isPlaying(true)}>Play</button>
        )}
        <label htmlFor="detune">detune</label>
        <input
          id="detune"
          type="range"
          value={this.state.detuneValue}
          min="-4800"
          max="4800"
          step="1"
          onChange={e => this.setDetune(e)}
        />
        <label htmlFor="playbackRate">playbackRate</label>
        <input
          id="playbackRate"
          type="range"
          value={this.state.playbackRate}
          min="-2"
          max="2"
          step=".1"
          onChange={e => this.setPlaybackRate(e)}
        />
        <MultiSlider
          id="loop"
          values={[
            this.state.loopStart,
            this.state.loopDuration,
            this.state.loopEnd
          ]}
          onChange={e => this.setLoop(e)}
          handleSize={0.5}
          handleStrokeSize={0.25}
          trackSize={0.5}
        />
      </div>
    );
  }
}

export default Audio;
