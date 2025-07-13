// 간단한 Spotify 토큰 프록시 서버 (Node.js/Express)
const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config({ path: __dirname + '/.env' });

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Spotify Client ID/Secret은 .env 파일에서 불러옴
const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

app.post('/spotify-token', async (req, res) => {
  try {
    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');

    const resp = await axios.post(
      'https://accounts.spotify.com/api/token',
      params,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization:
            'Basic ' + Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64'),
        },
      }
    );
    res.json({ access_token: resp.data.access_token, expires_in: resp.data.expires_in });
  } catch (err) {
    console.error('AXIOS ERROR:', err.response?.data || err.message, err.stack);
    res.status(500).json({ error: 'Failed to fetch Spotify token', details: err.message });
  }
});

// Spotify Search 프록시 엔드포인트 추가
app.post('/spotify-search', async (req, res) => {
  try {
    const { query, token, offset = 0, limit = 10 } = req.body;
    const resp = await axios.get('https://api.spotify.com/v1/search', {
      params: { q: query, type: 'track', limit, offset },
      headers: { Authorization: 'Bearer ' + token }
    });
    res.json(resp.data);
  } catch (err) {
    console.error('SEARCH ERROR:', err.response?.data || err.message, err.stack);
    res.status(500).json({ error: 'Spotify 검색 실패', details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Spotify proxy server listening on port ${PORT}`);
});
console.log('CLIENT_ID:', CLIENT_ID);
console.log('CLIENT_SECRET:', CLIENT_SECRET ? 'OK' : 'NOT SET');