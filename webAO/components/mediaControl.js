const entryId = 'mediaControlEntry'
const selectId = 'mediaControl'
const entrySelector = document.getElementById(entryId)
const audioOutputSelect = document.createElement('select')
audioOutputSelect.setAttribute('id', selectId)
const audioElements = document.getElementsByTagName('audio')

const handleChange = async (event) => {
    const sinkId = event.target.value
    for (let i =0; i < audioElements.length; i++) {
        await audioElements[i].setSinkId(sinkId)
    }
}
audioOutputSelect.onchange = handleChange

const gotDevices = (deviceInfos) => {  
    let hasAudioOutput = false
    for (var i = 0; i !== deviceInfos.length; ++i) {
        var option = document.createElement("option");
        var deviceInfo = deviceInfos[i];
        option.value = deviceInfo.deviceId;
        if (deviceInfo.kind === 'audiooutput') {
            hasAudioOutput = true
            option.text = deviceInfo.label || `Speaker ${audioOutputSelect.length + 1}`
            audioOutputSelect.appendChild(option);
      }
  }
  if (hasAudioOutput) {
    const label = createLabel()
    entrySelector.textContent = ''
    entrySelector.append(label)
    entrySelector.append(audioOutputSelect)
  } else {
      entrySelector.textContent = ''
  }
}
const createLabel = () => {
    const label = document.createElement('Label')
    label.setAttribute("for", selectId)
    label.innerHTML = "Audio Device: "
    return label
}
const createMediaControl = () => {
    navigator.mediaDevices.enumerateDevices()
    .then(gotDevices)
    .catch(err => console.error(err));
}

navigator.getUserMedia = navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia;
const checkIfNavigator = () => {
    if (navigator.getUserMedia) {
        navigator.getUserMedia({ audio: true },
            function (stream) {
                createMediaControl()
            },
            function (err) {
                // Rejected
                // console.log("The following error occurred: " + err);
            }
        );
    } else {
        // Feature not supported
        // console.log("getUserMedia not supported");
    }    
}
window.checkIfNavigator = checkIfNavigator

if (!navigator.getUserMedia) {
    // Feature is not supported
    entrySelector.textContent = ''
}