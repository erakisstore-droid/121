import {loadFont} from '@remotion/fonts';
import {staticFile} from 'remotion';

// Cairo (SIL OFL), self-hosted. Arabic + Latin subsets share one family name.
const AR = 'U+0600-06FF,U+0750-077F,U+0870-08FF,U+200C-200E,U+2010-2011,U+204F,U+2E41,U+FB50-FDFF,U+FE70-FEFC';
const LAT = 'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD';

for (const w of ['500', '700', '800'] as const) {
  loadFont({family: 'Cairo', weight: w, url: staticFile(`ms/fonts/Cairo-arabic-${w}.woff2`), unicodeRange: AR});
  loadFont({family: 'Cairo', weight: w, url: staticFile(`ms/fonts/Cairo-latin-${w}.woff2`), unicodeRange: LAT});
}
