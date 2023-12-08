import type { Params } from 'astro';
import mongoose from 'mongoose';

export async function GET({
  params,
  request,
}: {
  params: Params;
  request: Request;
}) {
  // mongoose
  //   .connect(
  //     `mongodb+srv://${import.meta.env.DB_USER}:${
  //       import.meta.env.DB_PASSWORD
  //     }@musicfydb.kv7vvkt.mongodb.net/?retryWrites=true&w=majority`
  //   )
  //   .then(() => console.log('Connected!'));

  // mongoose.get()

  // fetch('https://accounts.spotify.com/api/token', {
  //     method: 'POST',
  //     headers: {
  //         'Content-Type': 'application/x-www-form-urlencoded',
  //     },
  //     body: data,
  // })
  //     .then(res => res.json())
  //     .then(data => {
  //         // fetch('https://api.spotify.com/v1/browse/featured-playlists?country=US&locale=en_US', {
  //         //     headers: {
  //         //         'Authorization': `${data.token_type} ${data.access_token}`
  //         //     }
  //         // })
  //         // .then(res => res.json())
  //         // .then(data => console.log('Playlist response:', data.playlists.items))

  //         fetch('https://api.spotify.com/v1/playlists/37i9dQZF1DX6R7QUWePReA/tracks', {
  //             headers: {
  //                 'Authorization': `${data.token_type} ${data.access_token}`
  //             }
  //         })
  //             .then(res => res.json())
  //             .then(data => console.log('Tracks response:', data.items[0].track))
  //     })
  //     .catch(error => {
  //         console.error('Error:', error);
  //     });

  return new Response(JSON.stringify('oleole'), {
    headers: { 'content-type': 'application/json' },
  });
}
