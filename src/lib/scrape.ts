import https from 'node:https';
import tar from 'tar-stream';
import zlib from 'zlib';

export type Desc = {
  FILENAME: string;
  URL?: string;
  VERSION: string;
  LICENSE?: string;
  ARCH: string;
  BUILDDATE?: string;
  PACKAGER?: string;
  DEPENDS?: string[];
  MAKEDEPENDS?: string[];
  DESC?: string;
  MD5SUM?: string;
  SHA256SUM?: string;
  PGPSIG?: string;
  CSIZE: string;
  ISIZE: string;
  NAME: string;
}

export const parseDesc = (descString?: string) => {
  if (!descString) return;
  try {
    const content = descString
      .split(/\n\n/)
      .filter((el) => el.trim() !== "").filter(el => el.startsWith('%'));

    const map = content.map((el) => {
      const split = el.split('\n')
      const heading = split[0].substring(
        split[0].indexOf("%") + 1, 
        split[0].lastIndexOf("%")
      );
      const values = split.slice(1);
      return [heading, values.length === 1 ? values[0] : values]
    })

    const result = Object.fromEntries(map) as Desc;

    return result;
  } catch (e) {
    throw new Error(`error parsing desc\n` + descString)
  }
}


const getInformation = async (url: string) => {
  const extract = tar.extract()
  const chunks: Desc[] = []

  extract.on('entry', function(header, stream, next) {
    const parts: Buffer[] = []

    if (header.name.endsWith('/desc')) {
      stream.on('data', function(chunk: Buffer) {
          if (chunk)
            parts.push(chunk)
      });
    }  
    stream.on('end', function() {
      const content = parseDesc(Buffer.concat(parts).toString())
      if (content)
        chunks.push(content)
      next()
    })
    stream.resume()
  })
  
  return new Promise<Desc[] | void>(function (resolve) {
    https.get(url,{ headers: { 'accept-encoding': 'gzip' }}, function (response) {
      response
        .pipe(zlib.createGunzip())
        .pipe(extract)
        .on("finish", () => resolve(chunks))
        .on("close", () => resolve(chunks))
    });
  });
}

export const scrape = async (downloadUrl: string) => {
    const info = await getInformation(downloadUrl);
    return info;
}
