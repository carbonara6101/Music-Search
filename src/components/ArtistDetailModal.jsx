import React from 'react';

const ArtistDetailModal = ({ artist, onClose }) => {
  if (!artist) return null;
  return (
    <div className="modal-overlay fancy-modal" onClick={onClose}>
      <div className="modal-content fancy-modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>&times;</button>
        <img src={artist.image} alt={artist.name} className="modal-main-cover" />
        <div className="modal-info">
          <div className="modal-title gradient-text">{artist.name}</div>
          <div className="modal-artist-detail-row">
            <span className="modal-label">팔로워</span> {artist.followers?.toLocaleString() ?? '-'}
            <span className="modal-label" style={{marginLeft:18}}>인기도</span> {artist.popularity ?? '-'}
          </div>
          <div className="modal-artist-detail-row">
            <span className="modal-label">장르</span> {artist.genres?.join(', ') ?? '-'}
          </div>
          <a href={`https://open.spotify.com/artist/${artist.id}`} className="modal-spotify-link big-spotify-link" target="_blank" rel="noopener noreferrer">
            Spotify에서 아티스트 보기
          </a>
        </div>
      </div>
    </div>
  );
};

export default ArtistDetailModal;
