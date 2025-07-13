import React from 'react';

const AlbumDetailModal = ({ album, onClose }) => {
  if (!album) return null;
  return (
    <div className="modal-overlay fancy-modal" onClick={onClose}>
      <div className="modal-content fancy-modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>&times;</button>
        <img src={album.cover} alt={album.name} className="modal-main-cover" />
        <div className="modal-info">
          <div className="modal-title gradient-text">{album.name}</div>
          <div className="modal-album-detail-row">
            <span className="modal-label">아티스트</span> {album.artist}
          </div>
          <div className="modal-album-detail-row">
            <span className="modal-label">발매일</span> {album.releaseDate ?? '-'}
            <span className="modal-label" style={{marginLeft:18}}>트랙 수</span> {album.totalTracks ?? '-'}
          </div>
          <a href={`https://open.spotify.com/album/${album.id}`} className="modal-spotify-link big-spotify-link" target="_blank" rel="noopener noreferrer">
            Spotify에서 앨범 보기
          </a>
        </div>
      </div>
    </div>
  );
};

export default AlbumDetailModal;
