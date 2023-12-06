import extToMime from 'ext-to-mime';
import StreamSearchReplace from 'stream-search-replace';

// Currently supports Hono's context as the "c" arg.
export default async function kvToStream(kvClient, key, ext, searchReplace = []){
  // If ext is a true boolean, it means to auto-detect the file extension.
  if(ext === true && key.includes('.')){
    ext = key.split('.').pop();
  }
  
  // If we have a file extension, determine MIME type.
  const mime = ext ? extToMime(ext) : false;
  
  // Get a stream from the Workers KV client.
  const kvStream = await kvClient.get(key, {type: 'stream'});
  
  // If we have search-and-replace values, pipe through the replacer.
  if(kvStream && searchReplace && searchReplace.length){
    const streamSearchReplace = new StreamSearchReplace(searchReplace);
    const finalStream = await kvStream.pipeThrough(streamSearchReplace);
    return [finalStream, mime];
  }
  
  return [kvStream, mime];
}
