import React, { useEffect, useState } from 'react';
import styles from './Settings.module.css';

function Settings({ setVideoDeviceId, setAudioDeviceId, closeSettings }) {
  const [videoDevices, setVideoDevices] = useState([]);
  const [audioDevices, setAudioDevices] = useState([]);
  const [selectedVideoDeviceId, setSelectedVideoDeviceId] = useState('');
  const [selectedAudioDeviceId, setSelectedAudioDeviceId] = useState('');
  const [statusColors, setStatusColors] = useState({
    'not-started': '#6c757d',
    'in-progress': '#ffc107',
    'completed': '#28a745',
  });

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then(() => {
        navigator.mediaDevices.enumerateDevices().then((devices) => {
          const videoDevices = devices.filter(
            (device) => device.kind === 'videoinput'
          );
          const audioDevices = devices.filter(
            (device) => device.kind === 'audioinput'
          );
          setVideoDevices(videoDevices);
          setAudioDevices(audioDevices);

          // Set default selections
          if (videoDevices.length > 0) {
            setSelectedVideoDeviceId(videoDevices[0].deviceId);
          }
          if (audioDevices.length > 0) {
            setSelectedAudioDeviceId(audioDevices[0].deviceId);
          }
        });
      })
      .catch((error) => {
        console.error('Error accessing media devices.', error);
      });
  }, []);

  const handleSaveSettings = () => {
    setVideoDeviceId(selectedVideoDeviceId);
    setAudioDeviceId(selectedAudioDeviceId);
    closeSettings();
  };

  const handleColorChange = (status, color) => {
    setStatusColors(prev => ({ ...prev, [status]: color }));
    // Save to store or context
  };

  return (
    <div className={styles.settings}>
      <h2 className={styles.title}>Settings</h2>
      <div className={styles.setting}>
        <label htmlFor="videoDevice">Select Video Device:</label>
        <select
          id="videoDevice"
          value={selectedVideoDeviceId}
          onChange={(e) => setSelectedVideoDeviceId(e.target.value)}
        >
          {videoDevices.map((device) => (
            <option key={device.deviceId} value={device.deviceId}>
              {device.label || `Camera ${device.deviceId}`}
            </option>
          ))}
        </select>
      </div>
      <div className={styles.setting}>
        <label htmlFor="audioDevice">Select Audio Device:</label>
        <select
          id="audioDevice"
          value={selectedAudioDeviceId}
          onChange={(e) => setSelectedAudioDeviceId(e.target.value)}
        >
          {audioDevices.map((device) => (
            <option key={device.deviceId} value={device.deviceId}>
              {device.label || `Microphone ${device.deviceId}`}
            </option>
          ))}
        </select>
      </div>
      <div className={styles.setting}>
        <h3>Node Colors</h3>
        {Object.keys(statusColors).map(status => (
          <div key={status} className={styles.colorPicker}>
            <label>{status.replace('-', ' ').toUpperCase()}</label>
            <input
              type="color"
              value={statusColors[status]}
              onChange={(e) => handleColorChange(status, e.target.value)}
            />
          </div>
        ))}
      </div>
      <div className={styles.buttons}>
        <button className="button" onClick={handleSaveSettings}>
          Save
        </button>
        <button className="button danger-button" onClick={closeSettings}>
          Cancel
        </button>
      </div>
    </div>
  );
}

export default Settings;
