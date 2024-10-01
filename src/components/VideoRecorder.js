import React, { useRef, useState } from 'react';
import styles from './VideoRecorder.module.css';

function VideoRecorder({
  projectId,
  nodeId,
  onNewDevlog,
  videoDeviceId,
  audioDeviceId,
  setIsRecording,
}) {
  const videoRef = useRef(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [stream, setStream] = useState(null);
  const [isRecordingLocal, setIsRecordingLocal] = useState(false);

  const startRecording = async () => {
    try {
      const constraints = {
        video: videoDeviceId ? { deviceId: { exact: videoDeviceId } } : true,
        audio: audioDeviceId ? { deviceId: { exact: audioDeviceId } } : true,
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      videoRef.current.srcObject = mediaStream;

      const recorder = new MediaRecorder(mediaStream);
      const chunks = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = async () => {
        try {
          const blob = new Blob(chunks, { type: 'video/webm' });
          const arrayBuffer = await blob.arrayBuffer();
          const filePath = await window.electron.saveVideo(arrayBuffer, nodeId);
          console.log('Video saved:', filePath);

          await window.electron.updateNode({ projectId, node: { id: nodeId, videoLog: filePath } });

          if (onNewDevlog) {
            onNewDevlog();
          }

          alert('Recording saved successfully!');
        } catch (error) {
          console.error('Error saving recording:', error);
          alert('Failed to save recording.');
        }
      };

      setMediaRecorder(recorder);
      recorder.start();
      setIsRecordingLocal(true);
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Failed to start recording.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      stream.getTracks().forEach((track) => track.stop());
      setIsRecordingLocal(false);
      setIsRecording(false);
    }
  };

  return (
    <div>
      <video ref={videoRef} autoPlay muted />
      <div>
        {!isRecordingLocal ? (
          <button onClick={startRecording}>Start Recording</button>
        ) : (
          <button onClick={stopRecording}>Stop Recording</button>
        )}
      </div>
    </div>
  );
}

export default VideoRecorder;