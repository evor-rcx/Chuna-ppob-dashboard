const ytdl = require('@distube/ytdl-core');
ytdl.getInfo('https://youtu.be/yg3EXDKvUAw').then(info => {
    let videoFormat = ytdl.chooseFormat(info.formats, { quality: 'highestvideo', filter: 'videoandaudio' });
    if (!videoFormat) videoFormat = ytdl.chooseFormat(info.formats, { filter: 'videoandaudio' });
    console.log("Video URL:", videoFormat ? videoFormat.url : 'none');
    
    let audioFormat = ytdl.chooseFormat(info.formats, { filter: 'audioonly' });
    console.log("Audio URL:", audioFormat ? audioFormat.url : 'none');
}).catch(console.error);
