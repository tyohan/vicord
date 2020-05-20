export default class CameraVideo {
    constructor(){
        this.mediaRecorder = null;
        this.recordedChunks = [];
        this.stream = null;
        this.onRecordingStop = null;
    }

    get state(){
        if(this.mediaRecorder)
            return this.mediaRecorder.state;
        return 'stop';
    }

    resume(){
        this.mediaRecorder.resume();
    }

    pause(){
        this.mediaRecorder.pause();
    }

    stop(){
        this.mediaRecorder.stop();
    }

    stopCapture(){
        this.stream.getTracks().forEach(track => track.stop());
        this.stream = null;
      }
      
    static getMimeType(){
        const types = [
                    "video/webm;codecs=vp9", 
                    "video/webm;codecs=vp8", 
                    "video/webm;codecs=daala", 
                    "video/webm;codecs=h264", 
                    "audio/webm;codecs=opus", 
                    "video/mpeg"];
        
        Object.values(types).forEach( mimetype => { 
            // @ts-ignore
            if(MediaRecorder.isTypeSupported(mimetype))
                return mimetype;
        });
    }
    
    record(stream){
        this.stream = stream;
        const options = { mimeType: CameraVideo.getMimeType() };
        // @ts-ignore
        this.mediaRecorder = new MediaRecorder(stream, options);
        this.mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
            //data streaming is not available means screen recording stopped.
            this.recordedChunks.push(e.data);
    
        } 
        };
    
        this.mediaRecorder.onstop = (e) =>{
            const blob = new Blob(this.recordedChunks, {
            type: "video/webm"
            });
    
            if(stream) this.stopCapture();
            this.onRecordingStop(blob);
        };
    
        this.mediaRecorder.start();
    
    }
}