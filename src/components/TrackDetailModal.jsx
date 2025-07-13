import React from 'react';

const TrackDetailModal = ({ track, onClose, onArtistClick, onAlbumClick }) => {
  if (!track) return null;
  return (
    <div className="modal-overlay fancy-modal" onClick={onClose}>
      <div className="modal-content fancy-modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>&times;</button>
        <img src={track.albumCover} alt={track.title} className="modal-main-cover" />
        <div className="modal-info">
          <div className="modal-title gradient-text">{track.title}</div>
          <div className="modal-detail-row">
            <span className="modal-label">아티스트</span> <button className="modal-link-btn" onClick={() => onArtistClick && onArtistClick(track)}>{track.artist}</button>
            <span className="modal-label" style={{marginLeft:18}}>앨범</span> <button className="modal-link-btn" onClick={() => onAlbumClick && onAlbumClick(track)}>{track.album}</button>
          </div>
          <div className="modal-detail-row">
            <span className="modal-label">발매일</span> {track.releaseDate || '-'}
            <span className="modal-label" style={{marginLeft:18}}>길이</span> {track.durationMs ? `${Math.floor(track.durationMs/60000)}:${String(Math.floor((track.durationMs%60000)/1000)).padStart(2,'0')}` : '-'}
          </div>
          <div className="modal-detail-row">
            <span className="modal-label">Explicit</span> {track.explicit ? 'Yes' : 'No'}
            <span className="modal-label" style={{marginLeft:18}}>인기도</span> {track.popularity ?? '-'}
          </div>
          <a href={`https://open.spotify.com/track/${track.id}`} className="modal-spotify-link big-spotify-link" target="_blank" rel="noopener noreferrer">
            Spotify에서 바로 듣기
          </a>
        </div>
      </div>
    </div>
  );
};

export default TrackDetailModal;
