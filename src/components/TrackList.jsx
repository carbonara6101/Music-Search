import React from 'react';

const TrackList = ({ tracks = [], onTrackSelect, playingTrackId, favorites = [], onToggleFavorite, loading }) => {
  return (
    <div className="track-list">
      <h2>검색 결과</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {tracks.length === 0 && !loading && <li style={{ color: '#aaa' }}>검색 결과가 없습니다.</li>}
        {loading
          ? Array.from({ length: 8 }).map((_, i) => (
              <li key={i} className="skeleton-track">
                <div className="skeleton-cover" />
                <div className="skeleton-texts">
                  <div className="skeleton-line skeleton-title" />
                  <div className="skeleton-line skeleton-artist" />
                </div>
              </li>
            ))
          : tracks.map(track => (
              <li
                key={track.id}
                className="track-item"
                onClick={() => onTrackSelect(track)}
              >
                <button
                  className={favorites.includes(track.id) ? 'fav-btn fav-on' : 'fav-btn'}
                  onClick={e => { e.stopPropagation(); onToggleFavorite && onToggleFavorite(track); }}
                  aria-label="즐겨찾기 토글"
                >
                  {favorites.includes(track.id) ? '♥' : '♡'}
                </button>
                {track.albumCover ? (
                  <img
                    src={track.albumCover}
                    alt="cover"
                    className="track-cover"
                  />
                ) : (
                  <div className="track-cover" />
                )}
                <div className="track-info">
                  <div className="track-title">{track.title}</div>
                  <div className="track-artist">{track.artist}</div>
                  <div className="track-album">{track.album}</div>
                </div>
              </li>
            ))}
      </ul>
    </div>
  );
};

export default TrackList;
