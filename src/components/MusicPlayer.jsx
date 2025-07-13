import React from 'react';

const MusicPlayer = ({ track }) => {
  return (
    <div className="music-player">
      <h2>Music Player</h2>
      {track ? (
        <>
          <div style={{ marginBottom: 8 }}>
            <b>{track.title}</b> <span style={{ color: '#aaa' }}>by {track.artist}</span>
            <div style={{ fontSize: '0.9em', color: '#bbb' }}>{track.album}</div>
          </div>
          {/* 실제 API 연동 시 track.previewUrl 등으로 미리듣기 */}
          <audio controls src={track.previewUrl || ''} style={{ width: '100%' }}>
            Your browser does not support the audio element.
          </audio>
        </>
      ) : (
        <div style={{ color: '#aaa' }}>트랙을 선택하면 미리 듣기가 여기에 표시됩니다.</div>
      )}
    </div>
  );
};

export default MusicPlayer;
