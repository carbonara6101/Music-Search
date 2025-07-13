import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TrackList from './TrackList';
import TrackDetailModal from './TrackDetailModal';
import ArtistDetailModal from './ArtistDetailModal';
import AlbumDetailModal from './AlbumDetailModal';

const MusicSearch = ({ onTracksChange }) => {
  const [query, setQuery] = useState('');
  const [autocomplete, setAutocomplete] = useState([]); // 자동완성/추천어 리스트
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [recent, setRecent] = useState([]);
  const popular = ['NewJeans', 'aespa', '아이유', 'BTS', 'IVE', '세븐틴', 'LE SSERAFIM', 'BLACKPINK']; // 임시 인기 검색어
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedTrack, setSelectedTrack] = useState(null); // 선택된 트랙 정보
  const [artistModal, setArtistModal] = useState(null); // 아티스트 상세
  const [albumModal, setAlbumModal] = useState(null); // 앨범 상세
  const [favorites, setFavorites] = useState(() => JSON.parse(localStorage.getItem('favorites') || '[]'));
  const [showFavOnly, setShowFavOnly] = useState(false);
  const [page, setPage] = useState(1); // 페이지네이션
  const [limit] = useState(10); // 한 페이지당 곡 수
  const [totalCount, setTotalCount] = useState(0); // 전체 곡 개수

  // 최근 검색어 로드
  useEffect(() => {
    const rec = JSON.parse(localStorage.getItem('recentSearches') || '[]');
    setRecent(rec);
  }, []);

  // 한글→영문 변환 테이블(간단 예시, 실제로는 더 정교하게 확장 가능)
  const romanize = (korean) => {
  if (korean === '에스파') return 'aespa';
  if (korean === '뉴진스') return 'newjeans';
  if (korean === '아이유') return 'iu';
  if (korean === '방탄소년단') return 'bts';
  if (korean === '블랙핑크') return 'blackpink';
  if (korean === '르세라핌') return 'le sserafim';
  if (korean === '세븐틴') return 'seventeen';
  if (korean === '아이브') return 'ive';
  if (korean === '트와이스') return 'twice';
  if (korean === '레드벨벳') return 'red velvet';
  if (korean === '스트레이키즈') return 'stray kids';
  if (korean === '엔시티') return 'nct';
  if (korean === '엔믹스') return 'nmixx';
  if (korean === '투모로우바이투게더') return 'txt';
  if (korean === '몬스타엑스') return 'monsta x';
  if (korean === '여자아이들' || korean === '여자 아이들') return '(g)i-dle';
  if (korean === '있지') return 'itzy';
  if (korean === '오마이걸') return 'oh my girl';
  if (korean === '에이티즈') return 'ateez';
  if (korean === '더보이즈') return 'the boyz';
  if (korean === '위너') return 'winner';
  if (korean === '에이핑크') return 'apink';
  if (korean === '샤이니') return 'shinee';
  if (korean === '빅뱅') return 'bigbang';
  if (korean === '슈퍼주니어') return 'super junior';
  if (korean === '소녀시대') return "girls' generation";
  if (korean === '마마무') return 'mamamoo';
  if (korean === '에픽하이') return 'epik high';
  if (korean === '지코') return 'zico';
  if (korean === '크러쉬') return 'crush';
  if (korean === '백예린') return 'baek yerin';
  if (korean === '태연') return 'taeyeon';
  if (korean === '이하이') return 'lee hi';
  if (korean === '선미') return 'sunmi';
  if (korean === '청하') return 'chungha';
  return '';
};

  const handleSearch = async (e, pageOverride) => {
    // 최근 검색어 저장
    if (query.trim()) {
      let rec = JSON.parse(localStorage.getItem('recentSearches') || '[]');
      rec = [query.trim(), ...rec.filter(x => x !== query.trim())].slice(0, 7);
      localStorage.setItem('recentSearches', JSON.stringify(rec));
      setRecent(rec);
    }
    if (e) e.preventDefault();
    const nextPage = pageOverride || page;
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    try {
      // 1. 백엔드에서 Spotify 토큰 요청
      const tokenResp = await axios.post('http://localhost:5000/spotify-token');
      const token = tokenResp.data.access_token;
      if (!token) throw new Error('Spotify 토큰 발급 실패');

      // 2. 한글/영문 쿼리 준비
      const kor = query.trim();
      const eng = romanize(kor);
      const queries = [kor, eng].filter(Boolean);
      let tracks = [];
      // 3. 각 쿼리로 Spotify 검색 (병렬) - 백엔드 프록시 사용
      // Spotify API는 offset=0, limit=50(최대)로 받아와서 프론트에서 페이징
      const fetchLimit = 50;
      const results = await Promise.all(
        queries.map(q =>
          axios.post('http://localhost:5000/spotify-search', {
            query: q,
            token,
            offset: 0,
            limit: fetchLimit
          })
        )
      );
      // 응답 구조 콘솔 출력 (디버깅용)
      results.forEach((res, idx) => {
        console.log(`[DEBUG] spotify-search 응답[${idx}]:`, res.data);
      });
      // 4. 결과 합치기 및 매핑 (방어적 파싱)
      // totalCount는 첫 번째 응답의 tracks.total에서 가져옴
      // 전체 곡 개수는 첫 번째 쿼리의 total을 사용
      setTotalCount(results[0]?.data?.tracks?.total || 0);
      tracks = results.flatMap(res =>
        (res.data?.tracks?.items || []).map(item => ({
          id: item?.id ?? '',
          title: item?.name ?? '',
          artist: (item?.artists || []).map(a => a.name).join(', '),
          album: item?.album?.name ?? '',
          previewUrl: item?.preview_url ?? '',
          albumCover: item?.album?.images?.[2]?.url || item?.album?.images?.[0]?.url || '',
          releaseDate: item?.album?.release_date ?? '',
          durationMs: item?.duration_ms ?? null,
          explicit: item?.explicit ?? false,
          popularity: item?.popularity ?? null,
        }))
      );
      // id로 중복 제거
      const unique = {};
      tracks.forEach(t => { if (!unique[t.id]) unique[t.id] = t; });
      tracks = Object.values(unique);
      // 검색어(한글/영문)가 곡명/아티스트명에 실제로 포함된 곡만 남김
      const lowerKor = kor.toLowerCase();
      const lowerEng = eng.toLowerCase();
      tracks = tracks.filter(
        t =>
          t.artist.toLowerCase().includes(lowerKor) ||
          t.title.toLowerCase().includes(lowerKor) ||
          (eng && (
            t.artist.toLowerCase().includes(lowerEng) ||
            t.title.toLowerCase().includes(lowerEng)
          ))
      );
      // 프론트에서 페이징
      const offset = (nextPage - 1) * limit;
      const pagedTracks = tracks.slice(offset, offset + limit);
      setTracks(pagedTracks);
      setPage(nextPage); // 항상 최신화
      if (onTracksChange) onTracksChange(pagedTracks);
    } catch (err) {
      setError('Spotify 검색 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 트랙 클릭 시 정보만 표시
  const handleTrackSelect = (track) => {
    setSelectedTrack(track);
  }

  // 페이지 변경될 때마다 자동 검색
  useEffect(() => {
    if (query.trim()) {
      handleSearch(null, page);
    }
    // eslint-disable-next-line
  }, [page]);

  return (
    <div className="music-search">
      <h2>음악 검색</h2>
      <form onSubmit={e => handleSearch(e, 1)} style={{ display: 'flex', gap: 8, marginBottom: 16, position: 'relative' }}>
        <input
          type="text"
          placeholder="아티스트 또는 곡명 입력"
          value={query}
          autoComplete="off"
          onFocus={() => setShowAutocomplete(true)}
          onBlur={() => setTimeout(() => setShowAutocomplete(false), 120)}
          onChange={e => {
            setQuery(e.target.value);
            // 간단 자동완성: 인기+최근 중 입력값 포함
            const val = e.target.value.trim().toLowerCase();
            if (!val) {
              setAutocomplete([...recent, ...popular.filter(p => !recent.includes(p))]);
            } else {
              setAutocomplete([
                ...recent.filter(x => x.toLowerCase().includes(val)),
                ...popular.filter(x => x.toLowerCase().includes(val) && !recent.some(r => r.toLowerCase() === x.toLowerCase()))
              ]);
            }
            setShowAutocomplete(true);
          }}
          style={{ flex: 1, padding: 8, borderRadius: 4, border: '1px solid #333', fontSize: 16 }}
        />
        {showAutocomplete && (autocomplete.length > 0 || recent.length > 0 || popular.length > 0) && (
          <div className="autocomplete-dropdown">
            {(query.trim() ? autocomplete : [...recent, ...popular.filter(p => !recent.includes(p))]).slice(0, 8).map((word, i) => (
              <div
                key={word + i}
                className="autocomplete-item"
                onMouseDown={() => {
                  setQuery(word);
                  setShowAutocomplete(false);
                  setTimeout(() => handleSearch(null, 1), 100);
                }}
              >
                {word}
              </div>
            ))}
          </div>
        )}
        <button type="submit" style={{ padding: '8px 16px', borderRadius: 4, border: 'none', background: '#1db954', color: '#fff', fontWeight: 'bold', fontSize: 16 }}>
          검색
        </button>
      </form>
      <div style={{ minHeight: 32, marginBottom: 16 }}>
        {loading && <span style={{ color: '#1db954' }}>Spotify에서 검색 중...</span>}
        {error && <span style={{ color: '#e74c3c' }}>{error}</span>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        <button
          onClick={() => setShowFavOnly(f => !f)}
          style={{
            background: showFavOnly ? '#1db954' : '#232526',
            color: showFavOnly ? '#fff' : '#b3b3b3',
            border: 'none',
            borderRadius: 8,
            padding: '7px 18px',
            fontWeight: 600,
            fontSize: 16,
            cursor: 'pointer',
            boxShadow: showFavOnly ? '0 2px 8px #1db95433' : 'none',
            transition: 'background 0.18s, color 0.18s',
          }}
        >
          {showFavOnly ? '♥ 즐겨찾기만 보기' : '♡ 전체 곡 보기'}
        </button>
      </div>
      <TrackList
        tracks={showFavOnly ? tracks.filter(t => favorites.includes(t.id)) : tracks}
        onTrackSelect={handleTrackSelect}
        favorites={favorites}
        onToggleFavorite={track => {
          let fav = [...favorites];
          if (fav.includes(track.id)) {
            fav = fav.filter(id => id !== track.id);
          } else {
            fav = [track.id, ...fav];
          }
          setFavorites(fav);
          localStorage.setItem('favorites', JSON.stringify(fav));
        }}
        loading={loading}
      />

      {/* 페이지네이션 UI */}
      {totalCount > limit && (() => {
        const totalPages = Math.ceil(totalCount / limit);
        const maxPageBtns = 5;
        let start = Math.max(1, page - Math.floor(maxPageBtns/2));
        let end = start + maxPageBtns - 1;
        if (end > totalPages) {
          end = totalPages;
          start = Math.max(1, end - maxPageBtns + 1);
        }
        const pageBtns = [];
        for (let p = start; p <= end; p++) {
          pageBtns.push(
            <button
              key={p}
              onClick={() => setPage(p)}
              disabled={loading || p === page}
              style={{
                padding: '6px 16px',
                borderRadius: 8,
                border: p === page ? '2.5px solid #1db954' : 'none',
                background: p === page ? '#181818' : (loading ? '#444' : '#232526'),
                color: p === page ? '#1db954' : '#fff',
                fontWeight: p === page ? 'bold' : 'normal',
                cursor: (loading || p === page) ? 'not-allowed' : 'pointer',
                margin: '0 2px',
                boxShadow: p === page ? '0 0 0 2px #1db95433' : 'none',
                outline: 'none',
                minWidth: 36,
              }}
            >{p}</button>
          );
        }
        return (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, margin: '24px 0', flexWrap: 'wrap' }}>
            <button
              onClick={() => setPage(1)}
              disabled={page === 1 || loading}
              style={{ padding: '6px 14px', borderRadius: 8, background: (page === 1 || loading) ? '#444' : '#1db954', color: '#fff', fontWeight: 'bold', cursor: (page === 1 || loading) ? 'not-allowed' : 'pointer' }}
            >맨앞</button>
            <button
              onClick={() => { if (page > 1) setPage(page - 1); }}
              disabled={page === 1 || loading}
              style={{ padding: '6px 14px', borderRadius: 8, background: (page === 1 || loading) ? '#444' : '#1db954', color: '#fff', fontWeight: 'bold', cursor: (page === 1 || loading) ? 'not-allowed' : 'pointer' }}
            >이전</button>
            {pageBtns}
            <button
              onClick={() => { if (page < totalPages) setPage(page + 1); }}
              disabled={page === totalPages || loading}
              style={{ padding: '6px 14px', borderRadius: 8, background: (page === totalPages || loading) ? '#444' : '#1db954', color: '#fff', fontWeight: 'bold', cursor: (page === totalPages || loading) ? 'not-allowed' : 'pointer' }}
            >다음</button>
            <button
              onClick={() => setPage(totalPages)}
              disabled={page === totalPages || loading}
              style={{ padding: '6px 14px', borderRadius: 8, background: (page === totalPages || loading) ? '#444' : '#1db954', color: '#fff', fontWeight: 'bold', cursor: (page === totalPages || loading) ? 'not-allowed' : 'pointer' }}
            >맨뒤</button>
          </div>
        );
      })()}


      {/* 트랙 상세 모달 */}
      <TrackDetailModal
        track={selectedTrack}
        onClose={() => setSelectedTrack(null)}
        onArtistClick={track => {
          // 실제 구현 시 track.artist, track.id 등으로 API 호출
          setArtistModal({
            name: track.artist,
            image: track.albumCover, // 임시
            followers: 123456,
            genres: ['K-pop', 'Dance'],
            popularity: 87,
            id: track.id // 실제로는 artist id 필요
          });
        }}
        onAlbumClick={track => {
          setAlbumModal({
            name: track.album,
            artist: track.artist,
            cover: track.albumCover,
            releaseDate: track.releaseDate,
            totalTracks: 12,
            id: track.id // 실제로는 album id 필요
          });
        }}
      />
      <ArtistDetailModal artist={artistModal} onClose={() => setArtistModal(null)} />
      <AlbumDetailModal album={albumModal} onClose={() => setAlbumModal(null)} />

    </div>
  );
};

export default MusicSearch;
