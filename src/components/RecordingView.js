// src/components/RecordingView.js
import React from 'react';
import VideoRecorder from './VideoRecorder';
import styles from './RecordingView.module.css';

function RecordingView({ projectId, node, onBack, onNewDevlog, videoDeviceId, audioDeviceId, setIsRecording }) {
  return (
    <div className={styles.recordingView}>
      <h2>Recording Dev Log for Node: {node.title}</h2>
      <VideoRecorder
        projectId={projectId}
        nodeId={node.id}
        onNewDevlog={onNewDevlog}
        videoDeviceId={videoDeviceId}
        audioDeviceId={audioDeviceId}
        setIsRecording={setIsRecording}
      />
      <button onClick={onBack} className="button">Back to Nodes</button>
    </div>
  );
}

export default RecordingView;