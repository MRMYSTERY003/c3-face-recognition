const btns = document.getElementById('imageUpload')
imageUpload.style.display = 'none';
const load = document.getElementById('load');

Promise.all([
  faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
  faceapi.nets.ssdMobilenetv1.loadFromUri('/models')
]).then(start)

async function start() {
  const container = document.createElement('div')
  container.style.position = 'relative'
  document.body.append(container)
  const labeledFaceDescriptors = await loadLabeledImages()
  const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6)
  let image
  let canvas
  document.body.append('Loaded')
  imageUpload.addEventListener('change', async () => {
    if (image) image.remove()
    if (canvas) canvas.remove()
    image = await faceapi.bufferToImage(imageUpload.files[0])
    container.append(image)
    canvas = faceapi.createCanvasFromMedia(image)
    container.append(canvas)
    const displaySize = { width: image.width, height: image.height }
    faceapi.matchDimensions(canvas, displaySize)
    const detections = await faceapi.detectAllFaces(image).withFaceLandmarks().withFaceDescriptors()
    const resizedDetections = faceapi.resizeResults(detections, displaySize)
    const results = resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor))
    results.forEach((result, i) => {
      const box = resizedDetections[i].detection.box
      console.log(result)
      const drawBox = new faceapi.draw.DrawBox(box, { label: result['_label'].toString() })
      drawBox.draw(canvas)
    })
  })
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

      imageUpload.style.display = 'block';
      load.style.display = 'none';

      return new faceapi.LabeledFaceDescriptors(label, descriptions)
    })
  )

}
