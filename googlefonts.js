const { GoogleFontsHelper } = require('google-fonts-helper');
const readline = require('readline').createInterface({
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
    fontsPath: '../fonts/',
  });
  console.log('\x1b[33m%s\x1b[0m', "Dont't forget to add 'fonts.css' to your 'main.css' file");
}

readline.question('Google fonts URL: ', (url) => {
  readline.close();
  if (GoogleFontsHelper.isValidURL(url)) {
    console.log('Downloading Fonts...');
    downloadFonts(url);
  } else {
    console.error('\x1b[1m\x1b[41m\x1b[37m%s\x1b[0m', 'Invalid URL');
  }
});
