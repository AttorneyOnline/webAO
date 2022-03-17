
const entryId = 'mediaControlEntry'
const entrySelector = document.getElementById(entryId)
const audioOutputSelect = document.createElement('select')

const handleChange = async (event) => {
    const audioElements = document.getElementsByTagName('audio')
    const sinkId = event.target.value
    for (let i =0; i < audioElements.length; i++) {
        console.log(audioElements[i])
        await audioElements[i].setSinkId(sinkId)
    }
    console.log(event.target.value)
}
audioOutputSelect.onchange = handleChange

const gotDevices = (deviceInfos) => {  
    console.log('Enumerating', deviceInfos)
    let hasAudioOutput = false
    for (var i = 0; i !== deviceInfos.length; ++i) {
        var option = document.createElement("option");
        var deviceInfo = deviceInfos[i];
        option.value = deviceInfo.deviceId;
        console.log(deviceInfo)
        if (deviceInfo.kind === 'audiooutput') {
            hasAudioOutput = true
            option.text = deviceInfo.label || `Speaker ${audioOutputSelect.length + 1}`
            audioOutputSelect.appendChild(option);
      }
  }
  if (hasAudioOutput) {
    entrySelector.append(audioOutputSelect)
  } 
}

const createMediaControl = () => {
    navigator.mediaDevices.enumerateDevices()
    .then(gotDevices)
    .catch(err => console.error(err));
}


// You must ask for these permissions to use this feature.
navigator.mediaDevices.getUserMedia({audio: true})
.then(accept => createMediaControl())
.catch(reject => {
// Don't create media control.
})
