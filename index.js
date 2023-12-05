import extToMime from 'ext-to-mime';
import streamSearchReplace from 'stream-search-replace';

export default async function kvToStream(kvClient, key, opts = {}){
  const defaults = {
    streamHandler: null,
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
    if(opts.searchReplace && opts.searchReplace.length){
      // If a searchReplace array is present, pass the stream through streamSearchReplace().
      return opts.streamHandler(async stream => streamSearchReplace(await stream.pipe(kvStream), opts.searchReplace);
    } else {
      return opts.streamHandler(async stream => await stream.pipe(kvStream));
    }
  } else if(opts.emptyHandler){
    return opts.emptyHandler('');
  }
}
