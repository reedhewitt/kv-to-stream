import extToMime from 'ext-to-mime';
import StreamSearchReplace from 'stream-search-replace';

export default async function kvToStream(kvClient, key, opts = {}){
  const defaults = {
    streamHandler: null, // Currently supports Hono's c.stream() method.
    emptyHandler: null,
    headerHandler: null,
    ext: null,
    searchReplace: null,
  }

  opts = Object.assign(defaults, opts);

  if(opts.ext && opts.headerHandler){
    const mime = extToMime(opts.ext) || 'application/octet-stream';
    opts.headerHandler('Content-Type', mime);
  }

  const kvStream = await kvClient.get(key, {type: 'stream'});

  if(kvStream && opts.streamHandler){
    let finalStream;
    
    if(opts.searchReplace && opts.searchReplace.length){
      // If a searchReplace array is present, pass the stream through streamSearchReplace().
      const streamSearchReplace = new StreamSearchReplace(opts.searchReplace);
      finalStream = kvStream.pipeThrough(streamSearchReplace);
    } else {
      finalStream = kvStream;
    }
    
    const streamCallback = async stream => await stream.pipe(finalStream);
    return opts.streamHandler(streamCallback);
  } else if(opts.emptyHandler){
    return opts.emptyHandler('');
  }
}
