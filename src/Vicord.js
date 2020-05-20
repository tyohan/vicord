/* eslint-disable no-console */
import { LitElement, html, css } from 'lit-element';
import {render} from 'lit-html';
import CameraVideo from './CameraVideo.js';
import '@material/mwc-icon-button-toggle';
import '@material/mwc-icon-button';
import '@material/mwc-icon';
import '@material/mwc-button';
import '@material/mwc-dialog';

export class Vicord extends LitElement {
  
  constructor() {
    super();
    this.state = 'ready';
    this.stream = null;
    this.recorder = null;
    this.iconRecord = 'fiber_manual_record';
    this.needPermission = null;
  }

  static get properties() {
    return {
      title: { type: String },
      page: { type: String },
      state: { type: String },
      iconRecord: { type: String },
      needPermission:{type: Object}
    };
  }

  static get styles() {
    return css`
      :host {
        min-height: 100vh;
        font-size: calc(10px + 2vmin);
        color: #1a2b42;
        max-width: 960px;
        margin: 0 auto;
        text-align: center;
      }

      main {
        position:fixed;
        display: grid;
        grid-template-rows: auto 56px;
        height:100vh;
        width:100vw;
      }
      video{
        position:absolute;
        top: 50%;
        left: 50%;
        width: 100%;
        height: 100%;
        transform: translateX(-50%) translateY(-50%);
        object-fit:cover;
        background:#000;
        border:none;
      }

      aside{
        position:absolute;
        left:50%;
        transform: translateX(-50%);
        bottom:4rem;
        color:#FFF;
        display:grid;
        grid-template-columns:1fr 1fr 1fr;
        heigth:72px;
        column-gap: 24px;
        width:80%;
        padding:0 32px;
      }

      aside > * {
        width:84px;
        heigth:84px;
        justify-self:center;
        align-self:center;
      }

      aside mwc-icon, aside mwc-icon-button,aside a{
        color:#fff;
        text-decoration:none;
        --mdc-icon-size:48px;
        --mdc-icon-button-size:72px;
      }

      #btn-record{
        --mdc-icon-size:56px;
        --mdc-icon-button-size:84px;
      }

      #btn-stop{
        display:none;
      }
      main.recording #btn-stop, main.paused #btn-stop{
        display:inline-block;
      }

      mwc-dialog{
        position:absolute;
        left:50%;
        top:50%;
        transform: translateX(-50%) translateY(-50%);
        width:18rem;
        height:15rem;
      }
    `;
  }

  render() {
    return html`
      <main class="${this.state}">
        <video autoplay playsinline loop></video>
        ${this.needPermission}
        <aside>
        <span id="share-placeholder"></span>
        <mwc-icon-button id="btn-record" @click=${this.toggle} @tap-start=${this.record} @tap-end=${this.pause} icon="${this.iconRecord}"></mwc-icon-button>
        <span id="download-placeholder"><mwc-icon-button id="btn-stop" @click=${this.stop} icon="stop"></mwc-icon-button></span>
        </aside>
      </main>
    `;
  }

  firstUpdated() {
    this.hasCameraPermission();
  }

  async requestCameraPermission(){
    this.stream = await Vicord.openCameraStream();
    this.shadowRoot.querySelector('video').srcObject = this.stream;
  }

  async hasCameraPermission(){
    let dialog = html``;
    const result = await navigator.permissions.query({name:'camera'});
    if (result.state === 'granted') {
      this.requestCameraPermission();
    } else if (result.state === 'prompt') {
      dialog = html`
        <mwc-dialog open>
          <div>This app need permission to access your camera. Click request button below to grant permission.</div>
          <mwc-button
              slot="primaryAction"
              dialogAction="close" @click=${this.requestCameraPermission}>
            Grant
          </mwc-button>
        </mwc-dialog>
      `;
    } else if(result.state === 'denied'){
      dialog = html`
        <mwc-dialog open>
          <div>Your site setting is blocking the camera permission. Please change the setting to allow the camera access then reload this app.</div>
          <mwc-button
              slot="primaryAction"
              dialogAction="close">
            Ok
          </mwc-button>
        </mwc-dialog>
      `;
    }
    result.onchange = () => {
      this.requestCameraPermission();
    }
    this.needPermission = dialog;
  }

    static async openCameraStream(){
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 4096 },
        height: { ideal: 2160 } 
      },
      audio:true
    });
    return stream
  }

  stop(){
    this.recorder.stop();
    this.state = 'stopped';
    this.iconRecord = 'play_circle_filled';
  }

  pause(){
    if(this.recorder){
      console.log('Pausing...');
      this.recorder.pause();
      this.state = 'paused';
      this.iconRecord = 'fiber_manual_record';
      
    }
  }

  toggle(){
    if(!this.recorder)
      this.createRecorder();
    else if(this.recorder.state ==='paused'){
      console.log('Recording...');
      this.state = 'recording';
      this.recorder.resume();
      this.iconRecord = 'pause_circle_filled';
    } else if(this.recorder.state ==='recording')
      this.pause();
    else if(this.recorder.state ==='inactive'){
      console.log('video control');
      const player = this.shadowRoot.querySelector('video');
      if(this.state ==='video-playing'){
        player.pause();
        this.state = 'video-paused';
        this.iconRecord = 'play_circle_filled';
      } else {
        player.play();
        this.state = 'video-playing';
        this.iconRecord = 'pause_circle_filled';
      }
    }
  }

  async createRecorder(){
    const player = this.shadowRoot.querySelector('video');
    console.log('Recording...');
    this.state = 'recording';
    this.recorder = new CameraVideo();
    if(!this.stream)
      this.stream = await Vicord.openCameraStream();
    if(!player.srcObject)
      player.srcObject = this.stream;
    this.iconRecord = 'pause_circle_filled';
    this.recorder.onRecordingStop = (blob) => {
      console.log('recording stopped');
      const objectUrl= URL.createObjectURL(blob);
      player.srcObject = null;
      player.src = objectUrl;
      this.state = 'video-playing';
      if(navigator.canShare)
        this.setShareButton();
      this.setDownloadButton(objectUrl);
    };
    this.recorder.record(this.stream);
  }

  setShareButton(){
    const btnShare =html`<mwc-icon-button id="btn-share" @click=${this.share} icon="share"></mwc-icon-button>`;
    render(btnShare,this.shadowRoot.querySelector('#share-placeholder'));
  }

  setDownloadButton(objectUrl) {
    const btnDownload = html`<a href="${objectUrl}" download="video-${Date.now()}.webm"><mwc-icon>save_alt</mwc-icon></a>`;
    render(btnDownload,this.shadowRoot.querySelector('#download-placeholder'));
  }

  async share(){
      const filesArray = [await fetch(this.shadowRoot.querySelector('video').src).then(r => r.blob()).then(blobFile => new File([blobFile], `video-${Date.now()}.webm`, { type: "video/webm" }))];
      navigator.canShare({ files: filesArray })
      navigator.share({
        text: 'some_text',
        files: filesArray,
        title: 'some_title',
        url: 'some_url'
      });
  }
}
