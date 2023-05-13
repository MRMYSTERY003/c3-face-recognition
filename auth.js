const load = document.getElementById('load');
const btns = document.getElementById('cont');

btns.style.display = 'none';


Promise.all([
  faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
  faceapi.nets.ssdMobilenetv1.loadFromUri('/models')
]).then(start)

const res = document.getElementById('res');


async function start() {

    const labeledFaceDescriptors = await loadLabeledImages()
    const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6)



    click_button.addEventListener('click', async function() {

        canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
        let image = canvas.toDataURL('image/jpeg');
        canvas.srcObject = stream;
        var blob = await fetch(image).then(res => res.blob())
        console.log(blob);
        image = await faceapi.bufferToImage(blob)
        console.log('loaded...')
        canvas = faceapi.createCanvasFromMedia(image)
        console.log('loaded...')

        const displaySize = { width: image.width, height: image.height }
        faceapi.matchDimensions(canvas, displaySize)
        console.log('loaded...')

        const detections = await faceapi.detectAllFaces(image).withFaceLandmarks().withFaceDescriptors()
        const resizedDetections = faceapi.resizeResults(detections, displaySize)
        const results = resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor))
        console.log(results)
        results.forEach((result, i) => {
            const box = resizedDetections[i].detection.box
            console.log(result)
            res.innerHTML = "This person is : " +result['_label'] +" predicted with the accuracy of "+(1 - result['_distance']) ;
           
        })
            
        

    });
  }

  function loadLabeledImages() {
    const labels = ['Bhuvana','Keerthana']
    return Promise.all(
      labels.map(async label => {
        const descriptions = []
        console.log(label);
        for (let i = 1; i <= 5; i++) {
          console.log("done..");
           const img = await faceapi.fetchImage(`./labeled_images/${label}/${i}.jpeg`)
          const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
          console.log("landmarks done")
          descriptions.push(detections.descriptor)
        }
        console.log("done getting")
  
        btns.style.display = 'block';
        load.style.display = 'none';
  
        return new faceapi.LabeledFaceDescriptors(label, descriptions)
      })
    )
  
  }
  








let camera_button = document.querySelector("#start-camera");
let video = document.querySelector("#video");
let click_button = document.querySelector("#click-photo");
let canvas = document.querySelector("#canvas");
var stop = document.getElementById('stop');

stop.style.display = 'none';


var stream = null;
camera_button.addEventListener('click', async function() {

    try {
    	stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    }
    catch(error) {
    	alert(error.message);
    	return;
    }

    video.srcObject = stream;

    video.style.display = 'block';
    camera_button.style.display = 'none';
    stop.style.display = 'block';



    click_button.style.display = 'block';
});




stop.addEventListener('click',  () =>{
    stream.getVideoTracks()[0].stop();
    camera_button.style.display = 'block';
    stop.style.display = 'none';
}

)





