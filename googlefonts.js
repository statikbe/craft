import * as readline from 'readline';

const { GoogleFontsHelper } = await import('google-fonts-helper');
const readlineObject = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function downloadFonts(url) {
  await GoogleFontsHelper.download(url, {
    base64: false,
    overwriting: true,
    outputDir: './tailoff',
    stylePath: 'css/site/base/fonts.css',
    fontsDir: 'fonts',
    fontsPath: '/tailoff/fonts/',
  });
  console.log('\x1b[33m%s\x1b[0m', "Dont't forget to add 'fonts.css' to your 'main.css' file");
}

readlineObject.question('Google fonts URL: ', (url) => {
  readlineObject.close();
  if (GoogleFontsHelper.isValidURL(url)) {
    console.log('Downloading Fonts...');
    downloadFonts(url);
  } else {
    console.error('\x1b[1m\x1b[41m\x1b[37m%s\x1b[0m', 'Invalid URL');
  }
});
