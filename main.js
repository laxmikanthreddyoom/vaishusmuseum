import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const $ = (s) => document.querySelector(s);
const intro = $("#intro"), welcome = $("#welcome"), museum = $("#museum"), sceneHost = $("#scene");
const isMobileDevice = matchMedia("(pointer: coarse), (any-pointer: coarse), (max-width: 700px), (max-height: 500px)").matches;
let chosenCharacter = "boy", chosenHeight = "average", visitorName = "";
const characterColors = {skin:"#c89570",hair:"#493126",eyes:"#493126",brows:"#493126",shirt:"#244b4b",waistcoat:"#244b4b",trousers:"#343640",shoes:"#343640"};
const originalCharacterColors = {...characterColors};
const colorPalettes = {
  skin:[["Original","#c89570"],["Sand","#d9a788"],["Honey","#b77c57"],["Sienna","#946047"],["Umber","#65402f"]],
  hair:[["Espresso","#493126"],["Chestnut","#70452f"],["Caramel","#a66f3f"],["Blonde","#d2b16e"],["Black","#242222"],["Silver","#aaa9a5"]],
  eyes:[["Brown","#493126"],["Hazel","#80613d"],["Green","#527755"],["Blue","#527c9e"],["Gray","#82888b"]],
  brows:[["Espresso","#493126"],["Chestnut","#70452f"],["Caramel","#a66f3f"],["Blonde","#d2b16e"],["Black","#242222"]],
  shirt:[["Teal","#244b4b"],["Ivory","#e7dfd1"],["Rose","#a65365"],["Blue","#496b9b"],["Sage","#70856b"],["Black","#292929"]],
  waistcoat:[["Teal","#244b4b"],["Ivory","#e7dfd1"],["Rose","#a65365"],["Blue","#496b9b"],["Sage","#70856b"],["Black","#292929"]],
  trousers:[["Charcoal","#343640"],["Navy","#26334f"],["Brown","#594433"],["Olive","#55583c"],["Cream","#ddd3c1"],["Black","#242424"]],
  shoes:[["Charcoal","#343640"],["Brown","#65432f"],["Tan","#a77b51"],["Navy","#293c68"],["White","#e8e5df"],["Black","#242424"]]
};
const colorCategoryNames = {skin:"Skin tone",hair:"Hair",eyes:"Eyes",brows:"Brows",shirt:"Shirt",waistcoat:"Waistcoat",trousers:"Trousers",shoes:"Shoes"};
let selectedColorCategory="skin";
const UPPER_FLOOR_Y=6.4;
const STAIR_CENTER_Z=-13.2,STAIR_WIDTH=3.2,STAIR_START_X=13.6,STAIR_END_X=6.6,STAIR_STEPS=14;
const STAIR_MIN_Z=STAIR_CENTER_Z-STAIR_WIDTH/2,STAIR_MAX_Z=STAIR_CENTER_Z+STAIR_WIDTH/2;
const STAIR_WALK_MIN_Z=STAIR_CENTER_Z-.55,STAIR_WALK_MAX_Z=STAIR_CENTER_Z+.55;
const STAIR_RUN=(STAIR_START_X-STAIR_END_X)/STAIR_STEPS;
const STAIR_RISE=UPPER_FLOOR_Y/STAIR_STEPS;
let renderer, scene, camera, clock, avatar, mixer, actions = {}, activeAction, idlePoseAction, armPoseAction, idlePoseTime = 0, sitPose = null, sitOrigin = null, sitRotation = 0;
let previewRenderer, previewScene, previewCamera, previewFrame, previewMixer;
let previewAvatar, previewGltf = null, previewAvatarLoaded = false, preparedCharacter = null;
let previewLoadId = 0, previewRotation = 0, previewDragPointer = null, previewLastPointerX = 0;
let move = {x:0,z:0}, keys = {}, yaw = 0, cameraPitch = .12, cameraDragPointer = null, cameraLastPointer = {x:0,y:0}, nearby = null, photoMeshes = [], bookDisplay = null, albumIndex = 0, albumOpen = false, sitting = false;
let visitorNameSprite = null, cameraMode = "shoulder", invertLook = false, namesVisible = true, hudVisible = true;
let graphicsQuality = isMobileDevice ? "low" : "balanced", fpsLimit = 0, adaptiveResolution = false, visualStyle = "balanced";
let soundEnabled = true, audioContext = null, masterGain = null, effectsGain = null;
let volumeLevel = 1, musicLevel = .7, effectsLevel = 1, reactionSprites = [];
let museumMusic = null, musicTrackIndex = 0, musicPlaylistActive = false;
let lastFrameTime = 0, performanceWindowStart = 0, performanceFrameCount = 0, lastPerformanceUpdate = 0, lastAdaptiveUpdate = 0, currentFps = 0, adaptiveScale = 1;
let wallColliders = [];
let cameraFollowing = true;
let joystickInitialized = false;
let avatarLoadId = 0;
const characterLoadPromises = new Map();
let videoScreen = null, museumVideo = null, museumVideoTexture = null, museumVideoUrl = null;
const raycaster = new THREE.Raycaster(), pointer = new THREE.Vector2();
const PHOTO_DIR = "./assets/pictures/";
const MUSIC_DIR = "./assets/";
const musicTracks = [
  "Arctic Monkeys - I Wanna Be Yours_320k.mp3",
  "Ed Sheeran - Perfect_320k.mp3",
  "Justin Bieber - Baby (Lyrics) ft. Ludacris_320k.mp3",
  "Thodi Si Daaru (Official Music Video) _ AP Dhillon _ Shreya Ghoshal _ Tara Sutaria_320k.mp3",
  "With You - AP Dhillon (Official Music Video)_320k.mp3"
];
const pictureFiles = [
  "group 1.jpeg",
  "group 3 .jpeg",
  "group 5.jpeg",
  "vaish 1.jpeg",
  "vaish 2.jpeg",
  "vaish 3.jpeg",
  "vaish 5.jpeg",
  "vaish 6.jpeg",
  "vaish 7.jpeg",
  "vaish 8.jpeg",
  "vaish 9.jpeg",
  "vaish 10.jpeg",
  "vaish 12.jpeg",
  "vaish 13.jpeg",
  "vaish 14.jpeg",
  "vaish 15 .jpeg",
  "vaish 16.jpeg",
  "vaish 18 .jpeg",
  "vaishu 19.jpeg",
  "vaish 20.jpeg",
  "y 1.jpeg",
  "y 2.jpeg",
  "y 3.jpeg",
  "y 4.jpeg",
  "y 5.jpeg",
  "y 6.jpeg",
  "y 7.jpeg",
  "y 8.jpeg",
  "y 9.jpeg",
  "y 10.jpeg",
  "y 11.jpeg",
  "y 12.jpeg",
  "y 13.jpeg"
];
const photoQuotes = {
  "group 1.jpeg":"So grateful for the people who share our happiness, and for you at the heart of it.",
  "group 3 .jpeg":"A bright day, familiar faces, and you: my favourite kind of memory.",
  "group 5.jpeg":"All dressed up, surrounded by love, and making a moment we will always remember.",
  "vaish 1.jpeg":"Your smile turns even a simple selfie into my favourite view.",
  "vaish 2.jpeg":"You make every colour look like it was chosen just for you.",
  "vaish 3.jpeg":"The holidays feel warmer when I get to share them with you.",
  "vaish 5.jpeg":"Even on our dressed-up days, you are still my favourite thing in the room.",
  "vaish 6.jpeg":"On quiet days, I hope you always feel how deeply you are loved.",
  "vaish 7.jpeg":"Hand in hand beneath the open sky, this is where I want every road to lead.",
  "vaish 8.jpeg":"Your hand in mine makes every little adventure feel like home.",
  "vaish 9.jpeg":"The sweetest gifts are the moments we get to share.",
  "vaish 10.jpeg":"In every mood and every moment, you deserve to feel cherished.",
  "vaish 12.jpeg":"Silly filters, real smiles, and a love I would never change.",
  "vaish 13.jpeg":"That sunshine looks good on you, but your smile shines brighter.",
  "vaish 14.jpeg":"A festive day is brighter when I get to stand by you.",
  "vaish 15 .jpeg":"No matter where we are, I will always want to stand beside you.",
  "vaish 16.jpeg":"One more picture, one more reason to be grateful for us.",
  "vaish 18 .jpeg":"Celebrating together is better when I get to share the moment with you.",
  "vaishu 19.jpeg":"Even in a busy crowd, my favourite place is right next to you.",
  "vaish 20.jpeg":"A little bit of magic, a lot of love, and my favourite person beside me.",
  "y 1.jpeg":"This is the kind of togetherness I want to keep choosing, every day.",
  "y 2.jpeg":"Wherever our steps take us, I hope they keep finding the same path.",
  "y 3.jpeg":"May every quiet moment bring you comfort and remind you that you are deeply loved.",
  "y 4.jpeg":"Your gentle smile makes even a quiet moment feel full of light.",
  "y 5.jpeg":"Keep moving through life in your own beautiful way; I will always be cheering for you.",
  "y 6.jpeg":"Every step you take has me cheering for the wonderful person you are.",
  "y 7.jpeg":"You do not need a grand occasion to make a moment feel special.",
  "y 8.jpeg":"Some of my favourite memories are the little moments we share along the way.",
  "y 9.jpeg":"Even when words run out, I hope you always feel how much I care.",
  "y 10.jpeg":"Your smile is a little reminder of how lucky I am to know you.",
  "y 11.jpeg":"In every version of you, I see someone truly special.",
  "y 12.jpeg":"Your warmth comes through in every picture and stays with me long after.",
  "y 13.jpeg":"A playful little picture of the person who makes my heart happiest."
};
const memories = pictureFiles.map(file=>({
  file,
  title:"this memory",
  text:photoQuotes[file]
}));
const groundMemories = memories.slice(0,18);
const upperMemories = memories.slice(18);

function selectCharacter(type){
  chosenCharacter=type;
  previewRotation=0;
  document.querySelectorAll("[data-character]").forEach(b=>b.classList.toggle("active",b.dataset.character===type));
  loadCharacterPreview();
}
document.querySelectorAll("[data-character]").forEach(b=>b.addEventListener("click",()=>selectCharacter(b.dataset.character)));
document.querySelectorAll("[data-height]").forEach(b=>b.addEventListener("click",()=>{
  chosenHeight=b.dataset.height;
  document.querySelectorAll("[data-height]").forEach(x=>x.classList.toggle("active",x===b));
  updateCharacterPreviewLayout();
}));
document.querySelectorAll("[data-color-tab]").forEach(tab=>tab.addEventListener("click",()=>{
  selectedColorCategory=tab.dataset.colorTab;
  document.querySelectorAll("[data-color-tab]").forEach(item=>{
    const active=item===tab;
    item.classList.toggle("active",active);
    item.setAttribute("aria-selected",String(active));
  });
  renderColorPalette();
}));
$("#colorPalette").addEventListener("click",event=>{
  const swatch=event.target.closest("[data-color-value]");
  if(!swatch)return;
  setCharacterColor(selectedColorCategory,swatch.dataset.colorValue);
});
$("#colorPalette").addEventListener("input",event=>{
  if(event.target.matches("[data-custom-color]"))setCharacterColor(selectedColorCategory,event.target.value);
});
$("#resetLookBtn").addEventListener("click",()=>{
  setCharacterColor(selectedColorCategory,originalCharacterColors[selectedColorCategory]);
});
$("#resetPreviewBtn").addEventListener("click",resetCharacterLook);
renderColorPalette();
$("#turnLeftBtn").addEventListener("click",()=>turnPreviewCharacter(-Math.PI/6));
$("#turnRightBtn").addEventListener("click",()=>turnPreviewCharacter(Math.PI/6));
function renderColorPalette(){
  const palette=$("#colorPalette");
  if(!palette)return;
  $("#paletteTitle").textContent=colorCategoryNames[selectedColorCategory];
  palette.replaceChildren();
  for(const [name,color] of colorPalettes[selectedColorCategory]){
    const button=document.createElement("button");
    button.type="button";
    button.className="color-swatch";
    button.dataset.colorValue=color;
    button.setAttribute("aria-label",`${name} ${color}`);
    button.setAttribute("aria-pressed",String(characterColors[selectedColorCategory].toLowerCase()===color.toLowerCase()));
    const colorChip=document.createElement("span");
    colorChip.className="swatch-color";
    colorChip.style.backgroundColor=color;
    const nameLabel=document.createElement("span");
    nameLabel.className="swatch-name";
    nameLabel.textContent=name;
    button.append(colorChip,nameLabel);
    palette.append(button);
  }
  const customLabel=document.createElement("label");
  customLabel.className="custom-swatch";
  customLabel.setAttribute("aria-label",`Custom ${colorCategoryNames[selectedColorCategory]} color`);
  const customInput=document.createElement("input");
  customInput.type="color";
  customInput.value=characterColors[selectedColorCategory];
  customInput.dataset.customColor="";
  customInput.setAttribute("aria-label",`Choose custom ${colorCategoryNames[selectedColorCategory]} color`);
  const customText=document.createElement("span");
  customText.textContent="Custom";
  customLabel.append(customInput,customText);
  palette.append(customLabel);
}
function setCharacterColor(category,color){
  if(!(category in characterColors))return;
  characterColors[category]=color;
  renderColorPalette();
  if(previewAvatar)applyCharacterColors(previewAvatar);
}
function resetCharacterLook(){
  Object.assign(characterColors,originalCharacterColors);
  chosenHeight="average";
  document.querySelectorAll("[data-height]").forEach(button=>button.classList.toggle("active",button.dataset.height===chosenHeight));
  previewRotation=0;
  selectedColorCategory="skin";
  document.querySelectorAll("[data-color-tab]").forEach(tab=>{
    const active=tab.dataset.colorTab===selectedColorCategory;
    tab.classList.toggle("active",active);
    tab.setAttribute("aria-selected",String(active));
  });
  if(previewAvatar){
    previewAvatar.rotation.y=0;
    applyCharacterColors(previewAvatar);
  }
  updateCharacterPreviewLayout();
  renderColorPalette();
}
$("#startBtn").addEventListener("click",()=>{
  intro.classList.add("hidden");
  welcome.classList.remove("hidden");
  initCharacterPreview();
  if($("#startFullscreen").checked&&document.documentElement.requestFullscreen){
    document.documentElement.requestFullscreen().catch(error=>{
      console.warn("Could not open full screen; continuing in the current window.",error);
      $("#startStatus").textContent="Full screen isn't available here. You can continue in this window.";
    });
  }
});
$("#enterBtn").addEventListener("click",()=>{
  visitorName=$("#visitorName").value.trim();
  if(!visitorName){
    $("#enterError").textContent="Add a name, so others know who you are.";
    $("#enterError").classList.remove("hidden");
    $("#visitorName").setAttribute("aria-invalid","true");
    $("#visitorName").focus();
    return;
  }
  $("#enterError").classList.add("hidden");
  $("#visitorName").removeAttribute("aria-invalid");
  stopCharacterPreview();
  welcome.classList.add("hidden");
  $("#controlsGate").classList.remove("hidden");
});
$("#backToWelcomeBtn").addEventListener("click",()=>{
  $("#controlsGate").classList.add("hidden");
  welcome.classList.remove("hidden");
  initCharacterPreview();
});
$("#enterMuseumBtn").addEventListener("click",()=>{
  $("#controlsGate").classList.add("hidden");
  museum.classList.remove("hidden");
  try{
    startMuseum();
  }catch(error){
    console.error("Could not start the museum:",error);
    exitMuseum();
    $("#enterError").textContent="The museum could not start. Please use a current browser with WebGL enabled and try again.";
    $("#enterError").classList.remove("hidden");
  }
});
$("#visitorName").addEventListener("keydown",e=>{if(e.key==="Enter")$("#enterBtn").click()});
$("#exitBtn").addEventListener("click",exitMuseum);
$("#fullscreenBtn").addEventListener("click",()=>{if(!document.fullscreenElement)document.documentElement.requestFullscreen?.();else document.exitFullscreen?.()});
$("#settingsBtn").addEventListener("click",()=>$("#settingsPanel").classList.toggle("hidden"));
$("#closeSettingsBtn").addEventListener("click",()=>$("#settingsPanel").classList.add("hidden"));
$("#reactionsBtn").addEventListener("click",()=>$("#reactionMenu").classList.toggle("hidden"));
$("#cameraModeBtn").addEventListener("click",()=>setCameraMode(cameraMode==="shoulder"?"eyes":"shoulder"));
$("#reactionMenu").addEventListener("click",event=>{
  const button=event.target.closest("[data-reaction]");
  if(!button)return;
  performReaction(button.dataset.reaction);
  $("#reactionMenu").classList.add("hidden");
});
$("#settingsPanel").addEventListener("click",event=>{
  const quality=event.target.closest("[data-quality]");
  const fps=event.target.closest("[data-fps]");
  const visual=event.target.closest("[data-visual]");
  const cameraButton=event.target.closest("[data-camera]");
  if(quality){
    graphicsQuality=quality.dataset.quality;
    $("#settingsPanel").querySelectorAll("[data-quality]").forEach(button=>button.classList.toggle("selected",button===quality));
    applyGraphicsSettings();
  }
  if(fps){
    fpsLimit=Number(fps.dataset.fps);
    $("#settingsPanel").querySelectorAll("[data-fps]").forEach(button=>button.classList.toggle("selected",button===fps));
  }
  if(visual){
    visualStyle=visual.dataset.visual;
    $("#settingsPanel").querySelectorAll("[data-visual]").forEach(button=>button.classList.toggle("selected",button===visual));
    applyVisualStyle();
  }
  if(cameraButton){
    setCameraMode(cameraButton.dataset.camera);
  }
});
$("#adaptiveResolutionToggle").addEventListener("change",event=>{
  adaptiveResolution=event.target.checked;
  adaptiveScale=1;
  applyGraphicsSettings();
});
$("#fovRange").addEventListener("input",event=>{
  const value=Number(event.target.value);
  $("#fovValue").value=`${value}°`;
  $("#fovValue").textContent=`${value}°`;
  if(camera){camera.fov=value;camera.updateProjectionMatrix();}
});
$("#sensitivityRange").addEventListener("input",event=>{
  const value=Number(event.target.value)/100;
  $("#sensitivityValue").value=`${value.toFixed(2)}×`;
  $("#sensitivityValue").textContent=`${value.toFixed(2)}×`;
});
$("#namesToggle").addEventListener("change",event=>{
  namesVisible=event.target.checked;
  if(visitorNameSprite)visitorNameSprite.visible=namesVisible;
});
$("#hudToggle").addEventListener("change",event=>{
  hudVisible=event.target.checked;
  museum.classList.toggle("hud-minimal",!hudVisible);
});
$("#invertLookToggle").addEventListener("change",event=>{invertLook=event.target.checked});
$("#soundToggle").addEventListener("change",event=>setSoundEnabled(event.target.checked));
$("#soundBtn").addEventListener("click",()=>setSoundEnabled(!soundEnabled));
for(const [id,key,suffix] of [
  ["volumeRange","volumeLevel","%"],["musicRange","musicLevel","%"],["effectsRange","effectsLevel","%"]
]){
  $(`#${id}`).addEventListener("input",event=>{
    const level=Number(event.target.value)/100;
    if(key==="volumeLevel")volumeLevel=level;
    else if(key==="musicLevel")musicLevel=level;
    else effectsLevel=level;
    const output=$(`#${key.replace("Level","")}Value`);
    output.value=`${event.target.value}${suffix}`;
    output.textContent=`${event.target.value}${suffix}`;
    updateAudioLevels();
  });
}
$("#closeModal").addEventListener("click",closePhoto);
$("#photoModal").addEventListener("click",e=>{if(e.target.id==="photoModal")closePhoto()});
$("#albumPrevious").addEventListener("click",()=>changeAlbumPhoto(-1));
$("#albumNext").addEventListener("click",()=>changeAlbumPhoto(1));
$("#photoPrompt").addEventListener("click",()=>{
  if(nearby?.type==="photo"&&isFrameInReach(nearby.frame))openPhoto(nearby.memory);
});
$("#actionBtn").addEventListener("click",interact);

function initCharacterPreview(){
  const canvas=$("#characterPreview");
  canvas.addEventListener("pointerdown",startPreviewTurn);
  canvas.addEventListener("pointermove",updatePreviewTurn);
  canvas.addEventListener("pointerup",stopPreviewTurn);
  canvas.addEventListener("pointercancel",stopPreviewTurn);
  canvas.addEventListener("lostpointercapture",stopPreviewTurn);
  previewScene=new THREE.Scene();
  previewCamera=new THREE.OrthographicCamera(-1,1,2.75,-2.75,.1,100);
  try{
    previewRenderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:!isMobileDevice,powerPreference:"low-power"});
  }catch(error){
    console.error("Could not create the character preview:",error);
    $("#previewStatus").textContent="Your browser could not display the 3D character.";
    return;
  }
  previewRenderer.setPixelRatio(Math.min(devicePixelRatio,isMobileDevice?1.15:1.5));
  previewRenderer.outputColorSpace=THREE.SRGBColorSpace;
  previewRenderer.toneMapping=THREE.ACESFilmicToneMapping;
  previewRenderer.toneMappingExposure=1.1;
  previewRenderer.setClearColor(0x000000,0);
  previewScene.add(new THREE.HemisphereLight(0xffffff,0x776b5b,2.2));
  const key=new THREE.DirectionalLight(0xfff4e3,3);
  key.position.set(-3,7,5);
  previewScene.add(key);
  resizeCharacterPreview();
  addEventListener("resize",resizeCharacterPreview);
  loadCharacterPreview();
  animateCharacterPreview();
}
function turnPreviewCharacter(amount){
  const fullTurn=Math.PI*2;
  previewRotation=(previewRotation+amount)%fullTurn;
  if(previewRotation<0)previewRotation+=fullTurn;
  if(previewRotation<1e-10||fullTurn-previewRotation<1e-10)previewRotation=0;
  if(previewAvatar)previewAvatar.rotation.y=previewRotation;
}
function startPreviewTurn(event){
  if(event.button!==0&&event.pointerType==="mouse")return;
  previewDragPointer=event.pointerId;
  previewLastPointerX=event.clientX;
  event.currentTarget.setPointerCapture(event.pointerId);
  event.preventDefault();
}
function updatePreviewTurn(event){
  if(previewDragPointer!==event.pointerId)return;
  turnPreviewCharacter((event.clientX-previewLastPointerX)*.012);
  previewLastPointerX=event.clientX;
}
function stopPreviewTurn(event){
  if(previewDragPointer!==event.pointerId)return;
  previewDragPointer=null;
  if(event.currentTarget.hasPointerCapture?.(event.pointerId))event.currentTarget.releasePointerCapture(event.pointerId);
}
function resizeCharacterPreview(){
  if(!previewRenderer)return;
  const width=innerWidth,height=innerHeight,viewHeight=5.5,aspect=width/height;
  previewCamera.left=-viewHeight*aspect/2;
  previewCamera.right=viewHeight*aspect/2;
  previewCamera.top=viewHeight/2;
  previewCamera.bottom=-viewHeight/2;
  previewCamera.position.set(0,1.82,10);
  previewCamera.lookAt(0,1.82,0);
  previewCamera.updateProjectionMatrix();
  updateCharacterPreviewLayout();
  previewRenderer.setSize(width,height);
}
function disposePreviewModel(model){
  if(!model)return;
  model.traverse(object=>{
    if(!object.isMesh)return;
    object.geometry?.dispose();
    const materials=Array.isArray(object.material)?object.material:[object.material];
    materials.forEach(material=>{
      Object.values(material).forEach(value=>{if(value?.isTexture)value.dispose();});
      const baseTexture=material.userData?.characterColorBaseTexture;
      if(baseTexture&&baseTexture!==material.map)baseTexture.dispose();
      material.dispose();
    });
  });
}
function loadCharacterGltf(file){
  const pending=characterLoadPromises.get(file);
  if(pending)return pending;
  const load=new GLTFLoader().loadAsync(`./assets/models/${file}`);
  characterLoadPromises.set(file,load);
  load.then(
    ()=>{if(characterLoadPromises.get(file)===load)characterLoadPromises.delete(file);},
    ()=>{if(characterLoadPromises.get(file)===load)characterLoadPromises.delete(file);}
  );
  return load;
}
function loadCharacterPreview(){
  if(!previewRenderer)return;
  const loadId=++previewLoadId;
  const file=chosenCharacter==="girl"?"girl.glb":"boy.glb";
  const prepared=preparedCharacter?.file===file?preparedCharacter.gltf:null;
  if(preparedCharacter&&!prepared)disposePreviewModel(preparedCharacter.gltf.scene);
  preparedCharacter=null;
  previewMixer?.stopAllAction();
  previewMixer=null;
  previewGltf=null;
  previewAvatarLoaded=false;
  if(previewAvatar){
    previewScene.remove(previewAvatar);
    disposePreviewModel(previewAvatar);
    previewAvatar=null;
  }
  previewAvatar=makeFallbackAvatar();
  applyCharacterColors(previewAvatar);
  previewScene.add(previewAvatar);
  updateCharacterPreviewLayout();
  $("#previewStatus").textContent=`Loading ${chosenCharacter}…`;
  $("#previewStatus").classList.remove("hidden");
  const onLoad=gltf=>{
    if(loadId!==previewLoadId)return;
    if(previewAvatar){
      previewScene.remove(previewAvatar);
      disposePreviewModel(previewAvatar);
    }
    previewAvatar=gltf.scene;
    applyCharacterColors(previewAvatar);
    previewAvatar.userData.characterColorsApplied=true;
    previewGltf=gltf;
    previewAvatarLoaded=true;
    previewScene.add(previewAvatar);
    updateCharacterPreviewLayout();
    previewMixer=new THREE.AnimationMixer(previewAvatar);
    setStandingPose(previewMixer,gltf.animations,previewAvatar);
    $("#previewStatus").classList.add("hidden");
  };
  const onError=error=>{
    if(loadId!==previewLoadId)return;
    console.error(`Could not load ${file} for the entry screen:`,error);
    $("#previewStatus").textContent=`Could not load ${file}. Check the file in assets/models.`;
    $("#previewStatus").classList.remove("hidden");
  };
  if(prepared)onLoad(prepared);
  else loadCharacterGltf(file).then(onLoad).catch(onError);
}
function findStandingPoseTime(model,clip){
  const tracks=clip.tracks.filter(track=>/(?:Hips|UpLeg|Leg|Foot|Toe)/i.test(track.name)).map(track=>{
    const split=track.name.lastIndexOf(".");
    const bone=model.getObjectByName(track.name.slice(0,split));
    const property=track.name.slice(split+1);
    return bone&&["position","quaternion","scale"].includes(property)
      ?{interpolant:track.createInterpolant(),base:bone[property].toArray(),property}
      :null;
  }).filter(Boolean);
  if(!tracks.length)return 0;
  let bestTime=0,bestScore=Infinity;
  for(let sample=0;sample<=64;sample++){
    const time=clip.duration*sample/64;
    let score=0;
    tracks.forEach(({interpolant,base,property})=>{
      const pose=interpolant.evaluate(time);
      if(property==="quaternion"){
        const dot=Math.abs(base.reduce((sum,value,index)=>sum+value*pose[index],0));
        score+=Math.pow(2*Math.acos(THREE.MathUtils.clamp(dot,0,1)),2);
      }else{
        const difference=base.reduce((sum,value,index)=>sum+(value-pose[index])**2,0);
        score+=difference*(property==="position"?.1:.01);
      }
    });
    if(score<bestScore){bestScore=score;bestTime=time;}
  }
  return bestTime;
}
function holdTrackAtTime(track,time,duration){
  const pose=Array.from(track.createInterpolant().evaluate(time));
  return new track.constructor(track.name,[0,duration],[...pose,...pose]);
}
function isLegPoseTrack(track){
  return /(?:UpLeg|Leg|Foot|Toe)/i.test(track.name);
}
function setStandingPose(animationMixer,clips,model){
  if(!clips.length)return null;
  const idle=clips.find(clip=>/idle|stand/i.test(clip.name));
  if(idle){
    const action=animationMixer.clipAction(idle);
    action.setLoop(THREE.LoopRepeat,Infinity).play();
    return action;
  }
  const pose=clips.find(clip=>/walk|run|mixamo/i.test(clip.name))||clips[0];
  const standingTime=findStandingPoseTime(model,pose);
  const tracks=pose.tracks.filter(track=>!/Hips\.position$/i.test(track.name)&&!isLegPoseTrack(track))
    .map(track=>holdTrackAtTime(track,standingTime,pose.duration));
  const standingClip=new THREE.AnimationClip(`${pose.name}-standing`,pose.duration,tracks);
  const action=animationMixer.clipAction(standingClip).setLoop(THREE.LoopRepeat,Infinity).play();
  animationMixer.update(0);
  action.paused=true;
  return action;
}
function updateCharacterPreviewLayout(){
  if(!previewRenderer||!previewCamera)return;
  const viewWidth=previewCamera.right-previewCamera.left;
  const centerX=viewWidth*(.42-.5);
  if(!previewAvatar)return;
  const heightScale=chosenHeight==="short"?1.45:chosenHeight==="tall"?1.8:1.65;
  previewAvatar.scale.setScalar(heightScale);
  previewAvatar.position.set(centerX,0,0);
  previewAvatar.rotation.y=previewRotation;
}
function animateCharacterPreview(){
  if(!previewRenderer)return;
  previewFrame=requestAnimationFrame(animateCharacterPreview);
  previewRenderer.render(previewScene,previewCamera);
}
function stopCharacterPreview(){
  previewLoadId++;
  cancelAnimationFrame(previewFrame);
  removeEventListener("resize",resizeCharacterPreview);
  previewMixer?.stopAllAction();
  previewMixer=null;
  if(previewAvatar){
    previewScene.remove(previewAvatar);
    if(previewAvatarLoaded&&previewGltf){
      preparedCharacter={file:chosenCharacter==="girl"?"girl.glb":"boy.glb",gltf:previewGltf};
    }else{
      disposePreviewModel(previewAvatar);
    }
    previewAvatar=null;
  }
  previewGltf=null;
  previewAvatarLoaded=false;
  if(previewRenderer){
    previewRenderer.dispose();
    previewRenderer.forceContextLoss();
    previewRenderer=null;
  }
  const canvas=$("#characterPreview");
  const replacement=document.createElement("canvas");
  replacement.id="characterPreview";
  canvas.replaceWith(replacement);
}
function getRenderPixelRatio(){
  const qualityScale=graphicsQuality==="low"?.85:graphicsQuality==="balanced"?1:1.35;
  return Math.min(devicePixelRatio*qualityScale*adaptiveScale,isMobileDevice?1.15:1.6);
}
function getTextureAnisotropy(){
  return graphicsQuality==="low"||isMobileDevice?1:Math.min(renderer.capabilities.getMaxAnisotropy(),8);
}
function applyGraphicsSettings(){
  if(!renderer)return;
  renderer.setPixelRatio(getRenderPixelRatio());
  renderer.shadowMap.enabled=graphicsQuality==="high";
  renderer.shadowMap.needsUpdate=true;
}
function applyVisualStyle(){
  if(!renderer)return;
  renderer.toneMappingExposure=visualStyle==="illustrated"?.95:visualStyle==="photographic"?1.2:1.1;
}
function setCameraMode(mode){
  cameraMode=mode;
  $("#cameraModeBtn").textContent=mode==="eyes"?"◉ 1P":"◉ 3P";
  const nextView=mode==="eyes"?"over-the-shoulder":"first-person";
  $("#cameraModeBtn").title=`Switch to ${nextView} view`;
  $("#cameraModeBtn").setAttribute("aria-label",`Switch to ${nextView} view`);
  document.querySelectorAll("[data-camera]").forEach(button=>button.classList.toggle("selected",button.dataset.camera===mode));
}
function setSoundEnabled(enabled){
  soundEnabled=enabled;
  $("#soundToggle").checked=enabled;
  $("#soundBtn").classList.toggle("sound-off",!enabled);
  $("#soundBtn").title=enabled?"Pause museum music":"Play museum music";
  $("#soundBtn").setAttribute("aria-label",$("#soundBtn").title);
  if(enabled&&!audioContext)startMuseumAudio();
  updateAudioLevels();
  if(enabled&&museumMusic&&musicPlaylistActive&&museumMusic.paused)playCurrentMusicTrack();
  else if(!enabled)museumMusic?.pause();
  if(enabled&&audioContext?.state==="suspended")audioContext.resume().catch(error=>console.warn("Could not resume museum audio.",error));
}
function updateAudioLevels(){
  if(masterGain)masterGain.gain.value=soundEnabled?volumeLevel:0;
  if(effectsGain)effectsGain.gain.value=effectsLevel*.2;
  if(museumMusic)museumMusic.volume=soundEnabled?volumeLevel*musicLevel:0;
}
function startMuseumMusic(){
  try{
    if(!museumMusic){
      museumMusic=new Audio();
      museumMusic.preload="auto";
      const player=museumMusic;
      player.addEventListener("ended",playNextMusicTrack);
      player.addEventListener("error",()=>{
        if(player!==museumMusic)return;
        const track=musicTracks[musicTrackIndex];
        console.error(`Could not load museum music track ${track}.`,player.error);
        musicPlaylistActive=false;
        showToast(`Could not play ${track}. Check the file in assets.`);
      });
    }
    musicPlaylistActive=true;
    musicTrackIndex=0;
    museumMusic.src=MUSIC_DIR+musicTracks[musicTrackIndex];
    updateAudioLevels();
    if(soundEnabled)playCurrentMusicTrack();
  }catch(error){
    console.error("Could not initialize museum music.",error);
    musicPlaylistActive=false;
    showToast("Museum music could not be started.");
  }
}
function playCurrentMusicTrack(){
  if(!museumMusic||!soundEnabled||!musicPlaylistActive)return;
  const playRequest=museumMusic.play();
  playRequest?.catch(error=>{
    if(error.name==="AbortError")return;
    if(error.name==="NotAllowedError"){
      console.warn("The browser blocked automatic museum music playback.",error);
      setSoundEnabled(false);
      showToast("Autoplay was blocked. Tap the music note to start playback.");
    }else{
      console.error("Could not start museum music.",error);
      showToast("Museum music could not be played.");
    }
  });
}
function playNextMusicTrack(){
  if(!museumMusic||!musicPlaylistActive)return;
  musicTrackIndex=(musicTrackIndex+1)%musicTracks.length;
  museumMusic.src=MUSIC_DIR+musicTracks[musicTrackIndex];
  updateAudioLevels();
  playCurrentMusicTrack();
}
function startMuseumAudio(){
  if(!soundEnabled||audioContext)return;
  const AudioContextClass=window.AudioContext||window.webkitAudioContext;
  if(!AudioContextClass){
    console.warn("Web Audio is unavailable; museum sound controls are disabled.");
    return;
  }
  try{
    audioContext=new AudioContextClass();
    masterGain=audioContext.createGain();
    effectsGain=audioContext.createGain();
    effectsGain.connect(masterGain);masterGain.connect(audioContext.destination);
    updateAudioLevels();
  }catch(error){
    console.error("Could not initialize museum audio.",error);
    audioContext=null;masterGain=null;effectsGain=null;
    showToast("Museum sound could not be started.");
  }
}
function playReactionSound(){
  if(!audioContext||!soundEnabled||!effectsLevel)return;
  const oscillator=audioContext.createOscillator(),gain=audioContext.createGain();
  oscillator.type="sine";oscillator.frequency.setValueAtTime(660,audioContext.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(440,audioContext.currentTime+.18);
  gain.gain.setValueAtTime(.22,audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(.001,audioContext.currentTime+.2);
  oscillator.connect(gain);gain.connect(effectsGain);oscillator.start();oscillator.stop(audioContext.currentTime+.2);
}
function performReaction(reaction){
  if(!avatar){showToast("Your character is still arriving. Try again in a moment.");return;}
  const emoji={Wave:"👋",Nice:"👍",Agree:"✔",Celebrate:"🎉","Blow a kiss":"♥",Dance:"♫"}[reaction];
  if(!emoji)return;
  const canvas=document.createElement("canvas");canvas.width=256;canvas.height=256;
  const context=canvas.getContext("2d");
  context.font="160px sans-serif";context.textAlign="center";context.textBaseline="middle";
  context.fillText(emoji,128,128);
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
  const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,transparent:true,depthTest:false}));
  sprite.position.set(0,2.4,0);sprite.scale.set(.85,.85,1);avatar.add(sprite);
  reactionSprites.push({sprite,texture,startedAt:performance.now(),duration:1500});
  playReactionSound();
  showToast(`${visitorName}: ${reaction}!`);
}
function startMuseum(){
  soundEnabled=true;
  $("#soundToggle").checked=true;
  $("#soundBtn").classList.remove("sound-off");
  $("#soundBtn").title="Pause museum music";
  $("#soundBtn").setAttribute("aria-label","Pause museum music");
  scene = new THREE.Scene(); scene.background=new THREE.Color("#d8d4cc"); scene.fog=new THREE.Fog("#d8d4cc",30,82);
  wallColliders=[];
  cameraFollowing=true;
  cameraDragPointer=null;
  keys={};move={x:0,z:0};yaw=0;sitting=false;
  cameraPitch=.12;
  lastFrameTime=0;performanceWindowStart=performance.now();performanceFrameCount=0;lastPerformanceUpdate=performanceWindowStart;lastAdaptiveUpdate=performanceWindowStart;
  camera = new THREE.PerspectiveCamera(Number($("#fovRange").value),innerWidth/innerHeight,.1,120);
  camera.position.set(0,2.2,10);
  camera.lookAt(0,.95,8);
  renderer = new THREE.WebGLRenderer({antialias:!isMobileDevice,powerPreference:"high-performance"});
  renderer.setPixelRatio(getRenderPixelRatio()); renderer.setSize(innerWidth,innerHeight);
  renderer.shadowMap.enabled=graphicsQuality==="high"; renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  renderer.outputColorSpace=THREE.SRGBColorSpace; renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=1.1;
  sceneHost.innerHTML=""; sceneHost.appendChild(renderer.domElement);
  clock=new THREE.Clock();
  scene.add(new THREE.HemisphereLight(0xffead1,0x443329,1.35));
  const key=new THREE.DirectionalLight(0xffe6c6,2.4);key.position.set(-5,9,4);key.castShadow=true;key.shadow.mapSize.set(1024,1024);scene.add(key);
  applyVisualStyle();
  $("#settingsPanel").querySelectorAll("[data-quality]").forEach(button=>button.classList.toggle("selected",button.dataset.quality===graphicsQuality));
  updateAudioLevels();
  startMuseumAudio();
  startMuseumMusic();
  buildMuseum(); loadAvatar();
  renderer.domElement.addEventListener("click",onSceneClick);
  renderer.domElement.addEventListener("pointerdown",startCameraOrbit);
  renderer.domElement.addEventListener("pointermove",updateCameraOrbit);
  renderer.domElement.addEventListener("pointerup",stopCameraOrbit);
  renderer.domElement.addEventListener("pointercancel",stopCameraOrbit);
  addEventListener("keydown",onKeyDown); addEventListener("keyup",onKeyUp); addEventListener("resize",resize);addEventListener("blur",clearMovementInput);document.addEventListener("visibilitychange",clearMovementInput);
  setupJoystick();
  animate();
}
function startCameraOrbit(event){
  if(event.button!==0||event.target.closest("button,input,select,label,.settings-panel,.reaction-menu"))return;
  cameraDragPointer=event.pointerId;
  cameraLastPointer={x:event.clientX,y:event.clientY};
  event.currentTarget.setPointerCapture(event.pointerId);
}
function updateCameraOrbit(event){
  if(cameraDragPointer!==event.pointerId||!event.buttons)return;
  const deltaX=event.clientX-cameraLastPointer.x,deltaY=event.clientY-cameraLastPointer.y;
  const sensitivity=Number($("#sensitivityRange").value)/100;
  yaw-=deltaX*.005*sensitivity;
  cameraPitch=THREE.MathUtils.clamp(cameraPitch+deltaY*.004*sensitivity*(invertLook?-1:1),-.18,.9);
  cameraLastPointer={x:event.clientX,y:event.clientY};
}
function stopCameraOrbit(event){
  if(cameraDragPointer!==event.pointerId)return;
  cameraDragPointer=null;
  if(event.currentTarget.hasPointerCapture?.(event.pointerId))event.currentTarget.releasePointerCapture(event.pointerId);
}
function material(color,roughness=.85){return new THREE.MeshStandardMaterial({color,roughness})}
function createMarbleTexture(){
  const canvas=document.createElement("canvas");
  canvas.width=canvas.height=512;
  const context=canvas.getContext("2d");
  context.fillStyle="#eeece7";
  context.fillRect(0,0,canvas.width,canvas.height);
  for(let vein=0;vein<12;vein++){
    const startX=Math.random()*canvas.width,startY=Math.random()*canvas.height;
    const direction=Math.random()<.5?-1:1;
    const points=[[startX,startY]];
    for(let step=1;step<=5;step++){
      const x=startX+direction*step*24+(Math.random()-.5)*18;
      const y=startY+step*18+(Math.random()-.5)*24;
      points.push([x,y]);
    }
    context.strokeStyle=`rgba(133,132,129,${.12+Math.random()*.09})`;
    context.lineWidth=1.2+Math.random()*1.5;
    for(const offsetX of [-canvas.width,0,canvas.width]){
      for(const offsetY of [-canvas.height,0,canvas.height]){
        context.beginPath();
        context.moveTo(points[0][0]+offsetX,points[0][1]+offsetY);
        points.slice(1).forEach(([x,y])=>context.lineTo(x+offsetX,y+offsetY));
        context.stroke();
      }
    }
  }
  const texture=new THREE.CanvasTexture(canvas);
  texture.needsUpdate=true;
  return texture;
}
function createTintedTexture(source,color,strength=.9){
  if(!source?.image)return null;
  const image=source.image;
  const canvas=document.createElement("canvas");
  canvas.width=image.width;
  canvas.height=image.height;
  const context=canvas.getContext("2d");
  context.drawImage(image,0,0);
  context.globalCompositeOperation="source-atop";
  context.globalAlpha=strength;
  context.fillStyle=color;
  context.fillRect(0,0,canvas.width,canvas.height);
  const texture=new THREE.CanvasTexture(canvas);
  texture.colorSpace=source.colorSpace;
  texture.wrapS=source.wrapS;
  texture.wrapT=source.wrapT;
  texture.repeat.copy(source.repeat);
  texture.offset.copy(source.offset);
  texture.center.copy(source.center);
  texture.rotation=source.rotation;
  texture.flipY=source.flipY;
  texture.anisotropy=source.anisotropy;
  texture.minFilter=source.minFilter;
  texture.magFilter=source.magFilter;
  return texture;
}
function applyCharacterColors(model){
  model.traverse(object=>{
    if(!object.isMesh)return;
    let category=object.userData.characterColorCategory;
    if(!category){
      const name=object.name.toLowerCase();
      category=/hair/.test(name)?"hair"
        :/brow/.test(name)?"brows"
        :/eye|iris|pupil/.test(name)?"eyes"
        :/waistcoat|vest|collar/.test(name)?"waistcoat"
        :/shirt|sweater|top|jacket/.test(name)?"shirt"
        :/trouser|pants/.test(name)?"trousers"
        :/shoe|sneaker|footwear/.test(name)?"shoes"
        :/(^|_)body$|skin/.test(name)?"skin":null;
      if(!category)return;
      object.userData.characterColorCategory=category;
      const sourceMaterials=Array.isArray(object.material)?object.material:[object.material];
      object.userData.characterColorMaterials=sourceMaterials.map(source=>source.clone());
      object.material=Array.isArray(object.material)?object.userData.characterColorMaterials:object.userData.characterColorMaterials[0];
    }
    const materials=object.userData.characterColorMaterials;
    if(!materials)return;
    materials.forEach(partMaterial=>{
      const baseTexture=partMaterial.userData.characterColorBaseTexture??partMaterial.map;
      if(baseTexture){
        partMaterial.userData.characterColorBaseTexture=baseTexture;
        partMaterial.userData.characterColorTexture?.dispose();
        const tintStrength=category==="skin"?.22:.9;
        partMaterial.userData.characterColorTexture=createTintedTexture(baseTexture,characterColors[category],tintStrength);
        if(partMaterial.userData.characterColorTexture){
          partMaterial.map=partMaterial.userData.characterColorTexture;
          partMaterial.color?.set("#ffffff");
        }
      }else{
        partMaterial.color?.set(characterColors[category]);
      }
      partMaterial.needsUpdate=true;
    });
  });
}
function box(w,h,d,x,y,z,mat,cast=false,receive=true){
  const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);m.castShadow=cast;m.receiveShadow=receive;scene.add(m);return m;
}
function buildMuseum(){
  const marbleTexture=createMarbleTexture();
  marbleTexture.wrapS=marbleTexture.wrapT=THREE.RepeatWrapping;
  marbleTexture.repeat.set(14,14);
  marbleTexture.colorSpace=THREE.SRGBColorSpace;
  marbleTexture.anisotropy=getTextureAnisotropy();
  const floorMat=new THREE.MeshStandardMaterial({color:"#ffffff",map:marbleTexture,roughness:.34,metalness:.015});
  const tileLine=material("#c6c3bd"), wallMat=material("#a7a297"), ceilingMat=material("#222527"), ceilingTrim=material("#3a3e40"), trim=material("#b59a61"), dark=material("#11100f");
  const groundCeilingMat=new THREE.MeshBasicMaterial({color:"#d5cbbb"});
  const groundCeilingTrim=material("#aa967a");
  box(56,.35,56,0,-.2,0,floorMat,false,true);
  for(let offset=-26.25;offset<=26.25;offset+=3.5){
    box(56,.012,.012,0,-.015,offset,tileLine);
    box(.012,.012,56,offset,-.015,0,tileLine);
  }
  const stairOpening={
    minX:STAIR_END_X-.25,maxX:STAIR_START_X+.25,
    minZ:STAIR_MIN_Z-.25,maxZ:STAIR_MAX_Z+.25
  };
  const ceilingPanels=[
    [-28,stairOpening.minX,-28,28],
    [stairOpening.maxX,28,-28,28],
    [stairOpening.minX,stairOpening.maxX,-28,stairOpening.minZ],
    [stairOpening.minX,stairOpening.maxX,stairOpening.maxZ,28]
  ];
  ceilingPanels.forEach(([minX,maxX,minZ,maxZ])=>{
    box(maxX-minX,.2,maxZ-minZ,(minX+maxX)/2,5.75,(minZ+maxZ)/2,groundCeilingMat);
  });
  for(let offset=-26;offset<=26;offset+=3.25){
    if(offset<stairOpening.minZ||offset>stairOpening.maxZ){
      box(56,.08,.07,0,5.61,offset,groundCeilingTrim);
    }else{
      box(stairOpening.minX+28,.08,.07,(-28+stairOpening.minX)/2,5.61,offset,groundCeilingTrim);
      box(28-stairOpening.maxX,.08,.07,(28+stairOpening.maxX)/2,5.61,offset,groundCeilingTrim);
    }
    if(offset<stairOpening.minX||offset>stairOpening.maxX){
      box(.07,.08,56,offset,5.55,0,groundCeilingTrim);
    }else{
      box(.07,.08,stairOpening.minZ+28,offset,5.55,(-28+stairOpening.minZ)/2,groundCeilingTrim);
      box(.07,.08,28-stairOpening.maxZ,offset,5.55,(28+stairOpening.maxZ)/2,groundCeilingTrim);
    }
  }
  const groundCeilingLightMaterial=new THREE.MeshStandardMaterial({
    color:"#fff0d5",emissive:"#ffdca5",emissiveIntensity:1.6,roughness:.35
  });
  for(const x of [-18,0,18]){
    for(const z of [-8,8]){
      const fixtureY=5.61;
      const fixture=new THREE.Mesh(new THREE.CylinderGeometry(.22,.27,.12,16),material("#3a3530",.5));
      fixture.position.set(x,fixtureY,z);scene.add(fixture);
      const lens=new THREE.Mesh(new THREE.CircleGeometry(.18,16),groundCeilingLightMaterial);
      lens.rotation.x=-Math.PI/2;lens.position.set(x,fixtureY-.065,z);scene.add(lens);
      const spot=new THREE.SpotLight(0xffe7c4,36,16,Math.PI/5,.68,1);
      spot.position.set(x,fixtureY-.12,z);
      spot.target.position.set(x,.15,z);
      scene.add(spot,spot.target);
    }
  }
  box(56,6,.35,0,2.8,-16,wallMat);
  box(56,6,.35,0,2.8,16,wallMat);
  box(.35,6,32,-28,2.8,0,wallMat);
  box(.35,6,11.3,28,2.8,-10.35,wallMat);
  box(.35,6,15.3,28,2.8,8.35,wallMat);
  // The grand double doors replace the small side door and face into the gallery.
  box(.35,1.3,5.4,28,5.15,-2,wallMat);
  const doorMat=material("#49301f"),doorInset=material("#332015"),gold=material("#b59a61"),doorX=27.76,doorCenterZ=-2;
  const leftDoor=box(.18,4.55,2.62,doorX,2.35,doorCenterZ-1.34,doorMat,true);
  const rightDoor=box(.18,4.55,2.62,doorX,2.35,doorCenterZ+1.34,doorMat,true);
  [leftDoor,rightDoor].forEach(door=>door.userData.exit=true);
  for(const z of [doorCenterZ-1.34,doorCenterZ+1.34]){
    box(.035,1.1,2.15,doorX-.11,3.82,z,doorInset);
    box(.035,.42,2.15,doorX-.11,1.38,z,doorInset);
    box(.06,3.55,.09,doorX-.14,2.55,z,gold);
  }
  for(const z of [doorCenterZ-2.82,doorCenterZ+2.82])box(.18,5.05,.24,doorX-.04,2.48,z,trim,true);
  box(.2,.28,5.88,doorX-.04,5.04,doorCenterZ,trim,true);
  for(const z of [doorCenterZ-.22,doorCenterZ+.22])box(.06,.62,.055,doorX-.19,2.36,z,gold,true);
  // A separate dark screening room occupies the west wing, with a central doorway.
  box(.35,6,12,-12.5,2.8,-10,wallMat);
  box(.35,6,12,-12.5,2.8,10,wallMat);
  addWallCollider(-12.5,-10,.35,12);addWallCollider(-12.5,10,.35,12);
  // Side gallery partitions, leaving clear paths between rooms.
  box(.35,5,9,-9,2.5,-4,wallMat);addWallCollider(-9,-4,.35,9);
  box(.35,5,7.2,9,2.5,3.4,wallMat);addWallCollider(9,3.4,.35,7.2);
  // Main gallery photo wall and dedication.
  box(10.5,5.5,.35,0,3.15,-10,dark);addWallCollider(0,-10,10.5,.35);
  box(.35,6,2.4,5.55,3,-10.8,dark);addWallCollider(5.55,-10.8,.35,2.4);
  box(12,.45,3.8,0,.15,-10,trim);
  addWallCollider(0,-10,12,3.8);
  const featuredMemory=groundMemories[0];
  createPhotoFrame(featuredMemory,[0,3.5,-9.765,0],-1,{width:3.8,height:3.5});
  createCaptionPlaque();
  // Black media wall is mounted at the end of the annex; the bench is kept well back from it.
  box(.45,5.6,15,-26.2,2.8,0,dark);addWallCollider(-26.2,0,.45,15);
  createVideoScreen(-25.91,3.15,0);
  createBench(-19.1,0);
  createGlassPlanter(-8,-7);
  createGlassPlanter(18,-7);
  createGlassPlanter(-21,8);
  createGlassPlanter(21,8);
  createGlassPlanter(-4,7);
  createGlassPlanter(4,7);
  const screenSpot=new THREE.SpotLight(0xf1d6a8,4,18,Math.PI/5,.55,1);
  screenSpot.position.set(-20.5,5.5,0);screenSpot.target.position.set(-25.7,2.8,0);scene.add(screenSpot,screenSpot.target);
  // Fill the longer perimeter and partitions with evenly spaced memories.
  const placements=[
    [-27.765,2.8,-9,Math.PI/2],[-27.765,2.8,9,Math.PI/2],
    [27.765,2.8,-10,-Math.PI/2],[27.765,2.8,5,-Math.PI/2],[27.765,2.8,11,-Math.PI/2],
    [-17,2.8,-15.765,0],[-10,2.8,-15.765,0],[17,2.8,-15.765,0],
    [-18,2.8,15.765,Math.PI],[-9,2.8,15.765,Math.PI],[0,2.8,15.765,Math.PI],[9,2.8,15.765,Math.PI],[18,2.8,15.765,Math.PI],
    [-8.765,2.8,-4,Math.PI/2],[8.765,2.8,4,-Math.PI/2]
  ];
  placements.forEach((p,i)=>{const mem=groundMemories[i+1];if(mem)createPhotoFrame(mem,p,i);});
  if(groundMemories[placements.length+1])createPhotoFrame(groundMemories[placements.length+1],[0,2.8,-15.765,0],placements.length+10,{width:3.2,height:3.8});
  if(groundMemories[placements.length+2])createPhotoFrame(groundMemories[placements.length+2],[0,3.5,-10.25,Math.PI],memories.length+40);
  buildUpperGallery(floorMat,wallMat,ceilingMat,ceilingTrim,stairOpening);
}
function buildUpperGallery(floorMaterial,wallMaterial,ceilingMaterial,ceilingTrimMaterial,stairOpening){
  const upperFloorMaterial=floorMaterial.clone();
  upperFloorMaterial.map=floorMaterial.map.clone();
  upperFloorMaterial.map.repeat.set(14,14);
  upperFloorMaterial.map.needsUpdate=true;
  const panels=[
    [-28,stairOpening.minX,-28,28],
    [stairOpening.maxX,28,-28,28],
    [stairOpening.minX,stairOpening.maxX,-28,stairOpening.minZ],
    [stairOpening.minX,stairOpening.maxX,stairOpening.maxZ,28]
  ];
  panels.forEach(([minX,maxX,minZ,maxZ])=>{
    box(maxX-minX,.32,maxZ-minZ,(minX+maxX)/2,UPPER_FLOOR_Y-.16,(minZ+maxZ)/2,upperFloorMaterial);
  });
  // The stair opening is tucked behind the central feature wall.
  const treadMaterial=new THREE.MeshPhysicalMaterial({
    color:"#64b8e4",transparent:true,opacity:.58,transmission:.42,thickness:.16,
    roughness:.2,metalness:.08,side:THREE.DoubleSide
  });
  const riserMaterial=material("#526d7b",.72);
  const nosingMaterial=material("#a7d8ed",.38);
  for(let step=0;step<STAIR_STEPS;step++){
    const treadDepth=STAIR_RUN+.035;
    const treadX=STAIR_START_X-(step+.5)*STAIR_RUN;
    const treadY=(step+1)*STAIR_RISE-.055;
    const tread=new THREE.Mesh(
      new THREE.BoxGeometry(treadDepth,.14,STAIR_WIDTH),
      treadMaterial
    );
    tread.position.set(treadX,treadY,STAIR_CENTER_Z);
    tread.castShadow=true;tread.receiveShadow=true;scene.add(tread);
    const riser=new THREE.Mesh(
      new THREE.BoxGeometry(.1,STAIR_RISE-.12,STAIR_WIDTH),
      riserMaterial
    );
    riser.position.set(STAIR_START_X-(step+1)*STAIR_RUN+.05,(step+.5)*STAIR_RISE,STAIR_CENTER_Z);
    riser.castShadow=true;scene.add(riser);
    const nosing=new THREE.Mesh(
      new THREE.BoxGeometry(.075,.035,STAIR_WIDTH),
      nosingMaterial
    );
    nosing.position.set(treadX-STAIR_RUN/2+.025,treadY+.07,STAIR_CENTER_Z);
    nosing.castShadow=true;scene.add(nosing);
  }
  const stairStringerMaterial=material("#4d4031",.78);
  for(const z of [STAIR_MIN_Z+.04,STAIR_MAX_Z-.04]){
    const start=new THREE.Vector3(STAIR_START_X+.08,.12,z);
    const end=new THREE.Vector3(STAIR_END_X-.08,UPPER_FLOOR_Y-.05,z);
    const delta=end.clone().sub(start);
    const stringer=new THREE.Mesh(
      new THREE.BoxGeometry(delta.length(),.3,.16),
      stairStringerMaterial
    );
    stringer.position.copy(start).add(end).multiplyScalar(.5);
    stringer.quaternion.setFromUnitVectors(new THREE.Vector3(1,0,0),delta.normalize());
    stringer.castShadow=true;stringer.receiveShadow=true;scene.add(stringer);
  }
  const upperWallY=UPPER_FLOOR_Y+3;
  box(56,6,.35,0,upperWallY,-16,wallMaterial);
  box(56,6,.35,0,upperWallY,16,wallMaterial);
  box(.35,6,32,-28,upperWallY,0,wallMaterial);
  box(.35,6,32,28,upperWallY,0,wallMaterial);
  const upperCeilingY=UPPER_FLOOR_Y+6.25;
  box(56,.25,56,0,upperCeilingY,0,ceilingMaterial);
  for(let offset=-26;offset<=26;offset+=3.25){
    box(56,.08,.07,0,upperCeilingY-.17,offset,ceilingTrimMaterial);
    box(.07,.08,56,offset,upperCeilingY-.27,0,ceilingTrimMaterial);
  }
  const ceilingLightMaterial=new THREE.MeshStandardMaterial({
    color:"#fff0d5",emissive:"#ffdca5",emissiveIntensity:1.6,roughness:.35
  });
  for(const x of [-18,0,18]){
    for(const z of [-8,8]){
      const fixtureY=upperCeilingY-.24;
      const fixture=new THREE.Mesh(new THREE.CylinderGeometry(.22,.27,.12,16),material("#3a3530",.5));
      fixture.position.set(x,fixtureY,z);scene.add(fixture);
      const lens=new THREE.Mesh(new THREE.CircleGeometry(.18,16),ceilingLightMaterial);
      lens.rotation.x=-Math.PI/2;lens.position.set(x,fixtureY-.065,z);scene.add(lens);
      const spot=new THREE.SpotLight(0xffe7c4,48,13,Math.PI/5,.68,1);
      spot.position.set(x,fixtureY-.12,z);
      spot.target.position.set(x,UPPER_FLOOR_Y+.15,z);
      scene.add(spot,spot.target);
    }
  }
  const upperFrames=[
    [-18,UPPER_FLOOR_Y+2.8,-15.765,0],
    [-9,UPPER_FLOOR_Y+2.8,-15.765,0],
    [9,UPPER_FLOOR_Y+2.8,-15.765,0],
    [18,UPPER_FLOOR_Y+2.8,-15.765,0],
    [-18,UPPER_FLOOR_Y+2.8,15.765,Math.PI],[-9,UPPER_FLOOR_Y+2.8,15.765,Math.PI],
    [9,UPPER_FLOOR_Y+2.8,15.765,Math.PI],[18,UPPER_FLOOR_Y+2.8,15.765,Math.PI],
    [-27.765,UPPER_FLOOR_Y+2.8,-10,Math.PI/2],[-27.765,UPPER_FLOOR_Y+2.8,2,Math.PI/2],
    [-27.765,UPPER_FLOOR_Y+2.8,10,Math.PI/2],[27.765,UPPER_FLOOR_Y+2.8,-10,-Math.PI/2],
    [27.765,UPPER_FLOOR_Y+2.8,2,-Math.PI/2],[27.765,UPPER_FLOOR_Y+2.8,10,-Math.PI/2]
  ];
  upperFrames.forEach((position,index)=>{
    const memory=upperMemories[index%upperMemories.length];
    if(memory)createPhotoFrame(memory,position,index+memories.length+20);
  });
  const featureMemory=upperMemories[upperFrames.length%upperMemories.length];
  if(featureMemory){
    createPhotoFrame(featureMemory,[0,UPPER_FLOOR_Y+2.8,-15.765,0],upperFrames.length+memories.length+20,{width:3.2,height:3.8});
  }
  bookDisplay=createAlbumDisplay(0,0,UPPER_FLOOR_Y);
  for(const [x,z] of [[-21,-8],[21,-8],[-21,8],[21,8]]){
    createGlassPlanter(x,z,UPPER_FLOOR_Y);
  }
  const signX=STAIR_START_X+.9;
  const sign=new THREE.Mesh(new THREE.BoxGeometry(1.7,.45,.08),material("#282623"));
  sign.position.set(signX,1.55,STAIR_CENTER_Z+STAIR_WIDTH/2+.5);scene.add(sign);
  const signCanvas=document.createElement("canvas");
  signCanvas.width=512;signCanvas.height=128;
  const context=signCanvas.getContext("2d");
  context.fillStyle="#f1e7d5";context.font="600 42px sans-serif";context.textAlign="center";context.textBaseline="middle";
  context.fillText("UPPER GALLERY  ↑",256,64);
  const signText=new THREE.Mesh(new THREE.PlaneGeometry(1.55,.36),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(signCanvas),transparent:true}));
  signText.position.set(signX,1.55,STAIR_CENTER_Z+STAIR_WIDTH/2+.55);scene.add(signText);
}
function createAlbumDisplay(x,z,floorY){
  const display=new THREE.Group();
  display.position.set(x,floorY,z);
  const wood=new THREE.MeshStandardMaterial({color:"#67452e",roughness:.48,metalness:.08});
  const trim=new THREE.MeshStandardMaterial({color:"#b69a67",roughness:.38,metalness:.4});
  const glass=new THREE.MeshPhysicalMaterial({
    color:"#e9f2f2",transparent:true,opacity:.11,roughness:.08,metalness:.04,
    transmission:.72,thickness:.08,side:THREE.DoubleSide,depthWrite:false
  });
  const addPart=(geometry,material,xPos,yPos,zPos)=>{
    const mesh=new THREE.Mesh(geometry,material);
    mesh.position.set(xPos,yPos,zPos);mesh.castShadow=true;mesh.receiveShadow=true;display.add(mesh);
    return mesh;
  };
  const width=3.2,depth=2.4,baseHeight=.36,caseHeight=2.15,caseBottom=baseHeight;
  addPart(new THREE.BoxGeometry(width,baseHeight,depth),wood,0,baseHeight/2,0);
  addPart(new THREE.BoxGeometry(width-.16,.045,depth-.16),trim,0,baseHeight+.015,0);
  for(const [xOffset,zOffset] of [[-width/2,-depth/2],[-width/2,depth/2],[width/2,-depth/2],[width/2,depth/2]]){
    addPart(new THREE.BoxGeometry(.035,caseHeight,.035),trim,xOffset,caseBottom+caseHeight/2,zOffset);
  }
  const panes=[
    [width-.07,caseHeight,.018,0,caseBottom+caseHeight/2,-depth/2],
    [width-.07,caseHeight,.018,0,caseBottom+caseHeight/2,depth/2],
    [.018,caseHeight,depth-.07,-width/2,caseBottom+caseHeight/2,0],
    [.018,caseHeight,depth-.07,width/2,caseBottom+caseHeight/2,0],
    [width-.07,.018,depth-.07,0,caseBottom+caseHeight,0]
  ];
  panes.forEach(([w,h,d,px,py,pz])=>addPart(new THREE.BoxGeometry(w,h,d),glass,px,py,pz));
  const support=addPart(new THREE.BoxGeometry(.16,.82,.16),wood,0,1.05,0);
  support.rotation.x=-.28;
  for(const side of [-1,1]){
    const foot=addPart(new THREE.BoxGeometry(.12,.78,.14),wood,side*.44,.78,.13);
    foot.rotation.z=side*.43;
  }
  addPart(new THREE.BoxGeometry(1.95,.11,1.2),wood,0,1.37,0);
  const pageRotation=-Math.PI/2+.2;
  const anisotropy=getTextureAnisotropy();
  const photoMaterialFor=(memory)=>{
    const texture=new THREE.TextureLoader().load(
      PHOTO_DIR+memory.file,
      loaded=>{
        loaded.colorSpace=THREE.SRGBColorSpace;
        loaded.anisotropy=anisotropy;
        loaded.minFilter=THREE.LinearMipmapLinearFilter;loaded.magFilter=THREE.LinearFilter;
      },
      undefined,
      error=>console.error(`Could not load album photo ${memory.file}.`,error)
    );
    return new THREE.MeshBasicMaterial({map:texture,side:THREE.DoubleSide});
  };
  for(const [index,pageX] of [[0,-.47],[1,.47]]){
    const memory=upperMemories[index%upperMemories.length];
    addPart(new THREE.PlaneGeometry(.88,1.08),new THREE.MeshStandardMaterial({color:"#f5ead0",roughness:.92}),pageX,1.45,0).rotation.x=pageRotation;
    const image=addPart(new THREE.PlaneGeometry(.74,.82),photoMaterialFor(memory),pageX,1.465,0);
    image.rotation.x=pageRotation;
  }
  const spine=addPart(new THREE.BoxGeometry(.12,.055,1.12),wood,0,1.43,0);
  spine.rotation.x=pageRotation;
  display.userData={type:"album",position:new THREE.Vector3(x,floorY,z),width,depth};
  scene.add(display);
  addWallCollider(x,z,width,depth,1);
  return display;
}
function createBench(x,z){
  const bench=new THREE.Group();
  bench.position.set(x,0,z);bench.rotation.y=Math.PI/2;
  const seat=new THREE.Mesh(new THREE.BoxGeometry(4.2,.18,1.05),material("#7b5739"));
  seat.position.y=.58;seat.castShadow=true;bench.add(seat);
  const back=new THREE.Mesh(new THREE.BoxGeometry(4.2,.85,.16),material("#63442f"));
  back.position.set(0,1.02,.57);back.castShadow=true;bench.add(back);
  for(const legX of [-1.7,1.7]){
    const leg=new THREE.Mesh(new THREE.BoxGeometry(.16,.52,.16),material("#292522"));
    leg.position.set(legX,.27,0);leg.castShadow=true;bench.add(leg);
  }
  scene.add(bench);
  addWallCollider(x,z,1.25,4.4);
}
function createVideoScreen(x,y,z){
  const gold=material("#b59a61"),black=material("#080807");
  const frame=box(.18,4.25,8.35,x,y,z,gold,true);
  const canvas=document.createElement("canvas");canvas.width=1024;canvas.height=512;
  const context=canvas.getContext("2d");
  context.fillStyle="#080807";context.fillRect(0,0,canvas.width,canvas.height);
  context.strokeStyle="#b59a61";context.lineWidth=8;context.strokeRect(12,12,canvas.width-24,canvas.height-24);
  context.fillStyle="#e4d3b2";context.textAlign="center";
  context.font="600 42px Georgia, serif";context.fillText("OUR STORY",512,225);
  context.font="28px sans-serif";context.fillText("Press E to choose a video",512,280);
  const placeholder=new THREE.CanvasTexture(canvas);placeholder.colorSpace=THREE.SRGBColorSpace;
  const screen=new THREE.Mesh(new THREE.PlaneGeometry(8,3.9),new THREE.MeshBasicMaterial({map:placeholder,side:THREE.DoubleSide}));
  screen.position.set(x+.101,y,z);screen.rotation.y=Math.PI/2;screen.userData.videoScreen=true;scene.add(screen);
  frame.userData.videoScreen=true;
  videoScreen=screen;
  museumVideo=document.createElement("video");
  museumVideo.loop=true;museumVideo.playsInline=true;museumVideo.preload="metadata";
  museumVideo.addEventListener("loadeddata",()=>{
    if(!videoScreen)return;
    if(!museumVideoTexture){
      museumVideoTexture=new THREE.VideoTexture(museumVideo);
      museumVideoTexture.colorSpace=THREE.SRGBColorSpace;
    }
    videoScreen.material.map=museumVideoTexture;
    videoScreen.material.needsUpdate=true;
  });
}
function loadMuseumVideo(event){
  const file=event.target.files?.[0];
  if(!file)return;
  if(museumVideoUrl)URL.revokeObjectURL(museumVideoUrl);
  museumVideoUrl=URL.createObjectURL(file);
  museumVideo.src=museumVideoUrl;
  museumVideo.load();
  museumVideo.play().catch(error=>{
    console.error("Could not play the selected museum video.",error);
    showToast("This video could not be played. Try an MP4 video.");
  });
  event.target.value="";
}
$("#videoFile").addEventListener("change",loadMuseumVideo);
function createPlanter(x,z){
  const potMat=material("#e2ded5"),soilMat=material("#514333"),stemMat=material("#4d7152"),leafMat=material("#718e68"),flowerMats=["#fff7e9","#e9aebd","#e9d39f"].map(color=>material(color,.7));
  const potHeight=.66,potTop=.56;
  const pot=new THREE.Mesh(new THREE.CylinderGeometry(.42,.29,potHeight,28),potMat);
  pot.position.set(x,potHeight/2,z);pot.castShadow=true;pot.receiveShadow=true;scene.add(pot);
  const rim=new THREE.Mesh(new THREE.TorusGeometry(.41,.035,10,32),material("#f3efe7"));
  rim.rotation.x=Math.PI/2;rim.position.set(x,potTop,z);scene.add(rim);
  const soil=new THREE.Mesh(new THREE.CylinderGeometry(.37,.37,.04,28),soilMat);
  soil.position.set(x,potTop,z);scene.add(soil);
  const leafGeometry=new THREE.SphereGeometry(.12,10,8);
  for(let index=0;index<7;index++){
    const angle=index*Math.PI*2/7;
    for(const level of [0,.28]){
      const leaf=new THREE.Mesh(leafGeometry,leafMat);
      leaf.scale.set(.82,4.2,.62);
      leaf.position.set(x+Math.cos(angle)*(.17+level*.12),potTop+.32+level,z+Math.sin(angle)*(.17+level*.12));
      leaf.rotation.z=-Math.cos(angle)*(.52+level*.2);leaf.rotation.x=Math.sin(angle)*(.52+level*.2);scene.add(leaf);
    }
    const stemHeight=1.05+(index%2)*.12;
    const stem=new THREE.Mesh(new THREE.CylinderGeometry(.012,.018,stemHeight,7),stemMat);
    stem.position.set(x+Math.cos(angle)*.08,potTop+stemHeight/2,z+Math.sin(angle)*.08);
    scene.add(stem);
    const flowerX=x+Math.cos(angle)*.08,flowerZ=z+Math.sin(angle)*.08,flowerY=potTop+stemHeight;
    for(let petal=0;petal<5;petal++){
      const petalAngle=petal*Math.PI*2/5;
      const petalMesh=new THREE.Mesh(new THREE.SphereGeometry(.085,8,6),flowerMats[index%flowerMats.length]);
      petalMesh.scale.set(1,.8,.9);
      petalMesh.position.set(flowerX+Math.cos(petalAngle)*.11,flowerY,flowerZ+Math.sin(petalAngle)*.11);scene.add(petalMesh);
    }
    const center=new THREE.Mesh(new THREE.SphereGeometry(.024,8,6),material("#e3c985"));
    center.position.set(flowerX,flowerY+.01,flowerZ);scene.add(center);
  }
  addWallCollider(x,z,.9,.9);
}
function createGlassPlanter(x,z,floorY=0){
  const level=floorY>=UPPER_FLOOR_Y-.01?1:0;
  const plinthMat=material("#5c4937"),gold=material("#b59a61"),leaf=material("#738c65"),stem=material("#506c4d");
  const plinth=new THREE.Mesh(new THREE.BoxGeometry(1.05,.72,1.05),plinthMat);
  plinth.position.set(x,floorY+.36,z);plinth.castShadow=true;scene.add(plinth);
  const base=new THREE.Mesh(new THREE.BoxGeometry(1.2,.09,1.2),gold);
  base.position.set(x,floorY+.77,z);scene.add(base);
  const glassMaterial=new THREE.MeshPhysicalMaterial({
    color:"#dce9e5",transparent:true,opacity:.13,roughness:.08,metalness:.05,
    transmission:.72,thickness:.12,side:THREE.DoubleSide,depthWrite:false
  });
  const caseWidth=.92,caseHeight=1.08,caseY=floorY+.84+caseHeight/2;
  const panes=[
    [caseWidth,caseHeight,.018,0,caseY,-caseWidth/2],
    [caseWidth,caseHeight,.018,0,caseY,caseWidth/2],
    [.018,caseHeight,caseWidth,-caseWidth/2,caseY,0],
    [.018,caseHeight,caseWidth,caseWidth/2,caseY,0],
    [caseWidth,.018,caseWidth,0,floorY+.84+caseHeight,0]
  ];
  panes.forEach(([w,h,d,px,py,pz])=>{
    const pane=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),glassMaterial);
    pane.position.set(x+px,py,z+pz);scene.add(pane);
  });
  for(const [dx,dz] of [[-.46,-.46],[-.46,.46],[.46,-.46],[.46,.46]]){
    const post=new THREE.Mesh(new THREE.BoxGeometry(.035,1.1,.035),gold);
    post.position.set(x+dx,floorY+1.39,z+dz);scene.add(post);
  }
  const potMat=material("#e2ded5");
  const pot=new THREE.Mesh(new THREE.CylinderGeometry(.13,.09,.19,16),potMat);
  pot.position.set(x,floorY+.96,z);pot.castShadow=true;scene.add(pot);
  const soil=new THREE.Mesh(new THREE.CylinderGeometry(.115,.115,.025,16),material("#514333"));
  soil.position.set(x,floorY+1.065,z);scene.add(soil);
  for(let leafIndex=0;leafIndex<5;leafIndex++){
    const angle=leafIndex*Math.PI*2/5;
    const leafMesh=new THREE.Mesh(new THREE.SphereGeometry(.055,8,7),leaf);
    leafMesh.scale.set(.7,3.8,.55);
    leafMesh.position.set(x+Math.cos(angle)*.1,floorY+1.28,z+Math.sin(angle)*.1);
    leafMesh.rotation.z=-Math.cos(angle)*.42;leafMesh.rotation.x=Math.sin(angle)*.42;scene.add(leafMesh);
    const stalk=new THREE.Mesh(new THREE.CylinderGeometry(.009,.013,.5,6),stem);
    stalk.position.set(x+Math.cos(angle)*.035,floorY+1.32,z+Math.sin(angle)*.035);scene.add(stalk);
  }
  const displayLight=new THREE.PointLight(0xffedcf,.7,3);
  displayLight.position.set(x,floorY+1.95,z);scene.add(displayLight);
  addWallCollider(x,z,1.2,1.2,level);
}
function addWallCollider(x,z,width,depth,level=0){
  wallColliders.push({minX:x-width/2,maxX:x+width/2,minZ:z-depth/2,maxZ:z+depth/2,level});
}
function createPhotoFrame(mem,pos,index,size={width:1.85,height:2.3}){
  const group=new THREE.Group();group.position.set(pos[0],pos[1],pos[2]);group.rotation.y=pos[3];
  const frame=new THREE.Mesh(new THREE.BoxGeometry(size.width,size.height,.12),material("#9b7846"));frame.castShadow=true;group.add(frame);
  const matWidth=size.width-.18,matHeight=size.height-.18;
  const mat=new THREE.Mesh(new THREE.PlaneGeometry(matWidth,matHeight),new THREE.MeshBasicMaterial({color:"#f5f0e7"}));mat.position.z=.064;group.add(mat);
  const image=new THREE.Mesh(new THREE.PlaneGeometry(matWidth-.12,matHeight-.12),new THREE.MeshBasicMaterial({color:"#ffffff"}));image.position.z=.068;group.add(image);
  const anisotropy=getTextureAnisotropy();
  const loader=new THREE.TextureLoader();
  loader.load(PHOTO_DIR+mem.file,tex=>{
    tex.colorSpace=THREE.SRGBColorSpace;
    tex.anisotropy=anisotropy;
    tex.minFilter=THREE.LinearMipmapLinearFilter;
    tex.magFilter=THREE.LinearFilter;
    tex.generateMipmaps=true;
    const aspect=tex.image.width/tex.image.height,imageWidth=Math.min(matWidth-.12,(matHeight-.12)*aspect),imageHeight=imageWidth/aspect;
    image.geometry.dispose();image.geometry=new THREE.PlaneGeometry(imageWidth,imageHeight);
    image.material.map=tex;image.material.needsUpdate=true;
  },undefined,error=>console.error(`Could not load museum photo ${mem.file}.`,error));
  const lightY=Math.max(size.height/2+.35,5.55-pos[1]);
  const railWidth=Math.min(size.width*.58,1.25);
  const railY=lightY-.1;
  const rail=new THREE.Mesh(
    new THREE.BoxGeometry(railWidth,.075,.09),
    material("#242321",.48)
  );
  rail.position.set(0,railY,.72);group.add(rail);
  const ceilingY=5.98-pos[1];
  const suspensionLength=Math.max(.08,ceilingY-railY);
  for(const x of [-railWidth*.38,railWidth*.38]){
    const suspension=new THREE.Mesh(
      new THREE.CylinderGeometry(.018,.018,suspensionLength,8),
      material("#242321",.48)
    );
    suspension.position.set(x,railY+suspensionLength/2,.72);
    group.add(suspension);
  }
  const lightPosition=new THREE.Vector3(0,lightY,.92);
  const targetPosition=new THREE.Vector3(0,0,.04);
  const lampDirection=targetPosition.clone().sub(lightPosition).normalize();
  const lampHead=new THREE.Mesh(
    new THREE.CylinderGeometry(.06,.095,.28,12),
    material("#171716",.45)
  );
  lampHead.position.copy(lightPosition).addScaledVector(lampDirection,.1);
  lampHead.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),lampDirection);
  group.add(lampHead);
  const lampLens=new THREE.Mesh(
    new THREE.SphereGeometry(.055,10,8),
    new THREE.MeshStandardMaterial({color:"#fff1cf",emissive:"#ffd995",emissiveIntensity:2,roughness:.35})
  );
  lampLens.position.copy(lightPosition).addScaledVector(lampDirection,.22);
  group.add(lampLens);
  const frameLight=new THREE.SpotLight(0xffe6bd,18,8,.4,.82,1);
  frameLight.position.copy(lightPosition);
  frameLight.target.position.copy(targetPosition);
  group.add(frameLight,frameLight.target);
  group.userData={
    type:"photo",memory:mem,index,
    width:size.width,
    promptAnchor:new THREE.Vector3(0,-size.height/2-.28,.12)
  };
  scene.add(group);photoMeshes.push(group);
}
function createCaptionPlaque(){
  box(4.6,.88,.12,0,.94,-8.12,material("#191817"),true);
  const canvas=document.createElement("canvas");canvas.width=2048;canvas.height=512;
  const context=canvas.getContext("2d");
  context.fillStyle="#171615";context.fillRect(0,0,canvas.width,canvas.height);
  context.strokeStyle="#b59a61";context.lineWidth=8;context.strokeRect(16,16,canvas.width-32,canvas.height-32);
  context.textAlign="center";context.textBaseline="middle";
  context.fillStyle="#e1cfad";context.font="700 38px sans-serif";
  context.fillText("A LOVE WRITTEN IN EVERY MOMENT",1024,75);
  context.fillStyle="#fffaf0";context.font="italic 60px Georgia, serif";
  context.fillText("Every love story is beautiful,",1024,190);
  context.fillText("but ours is my favorite.",1024,280);
  context.fillStyle="#f1d2c8";context.font="600 58px Georgia, serif";
  context.fillText("❤️ Vaish",1024,410);
  const texture=new THREE.CanvasTexture(canvas);
  texture.colorSpace=THREE.SRGBColorSpace;
  texture.anisotropy=getTextureAnisotropy();
  texture.minFilter=THREE.LinearMipmapLinearFilter;
  texture.magFilter=THREE.LinearFilter;
  const face=new THREE.Mesh(new THREE.PlaneGeometry(4.4,.78),new THREE.MeshBasicMaterial({map:texture,toneMapped:false}));
  face.position.set(0,.94,-8.05);scene.add(face);
}
function createNameTag(){
  const canvas=document.createElement("canvas");canvas.width=512;canvas.height=128;
  const context=canvas.getContext("2d");
  context.clearRect(0,0,canvas.width,canvas.height);
  context.fillStyle="#fff8eb";context.font="500 34px Georgia, serif";context.textAlign="center";context.textBaseline="middle";
  context.fillText(visitorName||"Visitor",256,64,450);
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
  const label=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,transparent:true,depthTest:false}));
  const modelScale=avatar.scale.x||1;
  avatar.updateMatrixWorld(true);
  const bounds=new THREE.Box3().setFromObject(avatar);
  const labelHeight=(bounds.max.y-avatar.position.y+.3)/modelScale;
  label.position.set(0,labelHeight,0);label.scale.set(1.15/modelScale,.3/modelScale,.6/modelScale);label.visible=namesVisible;avatar.add(label);
  visitorNameSprite=label;
}
function loadAvatar(){
  const file=chosenCharacter==="girl"?"girl.glb":"boy.glb";
  const loadId=++avatarLoadId;
  const prepared=preparedCharacter?.file===file?preparedCharacter.gltf:null;
  if(preparedCharacter&&!prepared)disposePreviewModel(preparedCharacter.gltf.scene);
  preparedCharacter=null;
  avatar=makeFallbackAvatar();
  avatar.position.set(0,0,8);avatar.rotation.y=0;
  applyCharacterColors(avatar);scene.add(avatar);createNameTag();
  const onLoad=gltf=>{
    if(loadId!==avatarLoadId)return;
    const placeholder=avatar;
    const position=placeholder.position.clone(),rotation=placeholder.rotation.clone();
    scene.remove(placeholder);
    disposePreviewModel(placeholder);
    avatar=gltf.scene;
    // Keep the GLB's armature scale; resizing the static mesh bounds breaks its animated bone transforms.
    avatar.scale.setScalar(chosenHeight==="short"?1.4:chosenHeight==="tall"?1.75:1.55);
    avatar.position.copy(position);avatar.rotation.copy(rotation);
    avatar.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});
    if(!avatar.userData.characterColorsApplied)applyCharacterColors(avatar);
    scene.add(avatar);createNameTag();mixer=new THREE.AnimationMixer(avatar);
    const hasIdle=gltf.animations.some(clip=>/idle|stand/i.test(clip.name));
    gltf.animations.forEach(originalClip=>{
      let clip=originalClip;
      if(!hasIdle&&/walk|run|mixamo/i.test(clip.name)){
        const standingTime=findStandingPoseTime(avatar,clip);
        const heldArmTracks=[],standingTracks=[],movementTracks=[];
        clip.tracks.forEach(track=>{
          if(/Hips\.position$/i.test(track.name))return;
          if(/(?:Left|Right)(?:Shoulder|Arm|ForeArm|Hand)/i.test(track.name)){
            heldArmTracks.push(holdTrackAtTime(track,standingTime,clip.duration));
          }else{
            movementTracks.push(track);
              if(!isLegPoseTrack(track)){
                standingTracks.push(holdTrackAtTime(track,standingTime,clip.duration));
              }
          }
        });
        if(heldArmTracks.length){
          const armClip=new THREE.AnimationClip(`${clip.name}-idle-arms`,clip.duration,heldArmTracks);
          armPoseAction=mixer.clipAction(armClip).setLoop(THREE.LoopRepeat,Infinity).play();
        }
        if(standingTracks.length){
          const standingClip=new THREE.AnimationClip(`${clip.name}-standing`,clip.duration,standingTracks);
          idlePoseAction=mixer.clipAction(standingClip).setLoop(THREE.LoopRepeat,Infinity).play();
          idlePoseAction.paused=true;
          idlePoseTime=standingTime;
        }
        clip=new THREE.AnimationClip(`${clip.name}-locomotion`,clip.duration,movementTracks);
      }
      const action=mixer.clipAction(clip);
      actions[clip.name.toLowerCase()]=action;
      if(!hasIdle&&!idlePoseAction)idlePoseAction=action;
    });
    playAnimation("idle");
    mixer.update(0);
  };
  const onError=error=>{
    if(loadId!==avatarLoadId)return;
    console.error(`Could not load ${file}; using the procedural character instead.`,error);
  };
  if(prepared)onLoad(prepared);
  else loadCharacterGltf(file).then(onLoad).catch(onError);
}
function makeFallbackAvatar(){
  const g=new THREE.Group(), skin=material("#c89570"), shirt=material(characterColors.shirt), pants=material("#343640"), hair=material(characterColors.hair);
  const sphere=(r,x,y,z,mat,name="")=>{const m=new THREE.Mesh(new THREE.SphereGeometry(r,16,12),mat);m.position.set(x,y,z);m.name=name;g.add(m);return m;};
  const limb=(r1,r2,len,x,y,z,mat)=>{const m=new THREE.Mesh(new THREE.CapsuleGeometry(r1,len,4,8),mat);m.position.set(x,y,z);g.add(m);return m;};
  sphere(.22,0,1.62,0,skin,"FallbackSkin");sphere(.24,0,1.78,-.02,hair,"FallbackHair");
  const body= new THREE.Mesh(new THREE.CapsuleGeometry(.28,.65,5,10),shirt);body.name="FallbackShirt";body.position.y=1.08;g.add(body);
  const eyeMaterial=material(characterColors.eyes);
  sphere(.035,-.075,1.65,.19,eyeMaterial,"FallbackEyes");sphere(.035,.075,1.65,.19,eyeMaterial,"FallbackEyes");
  const l1=limb(.09,.09,.55,-.38,1.08,0,shirt),r1=limb(.09,.09,.55,.38,1.08,0,shirt);
  const l2=limb(.11,.11,.72,-.16,.43,0,pants),r2=limb(.11,.11,.72,.16,.43,0,pants);
  l2.name="FallbackTrousers";r2.name="FallbackTrousers";
  const shoeMaterial=material(characterColors.shoes);
  for(const x of [-.16,.16]){
    const shoe=new THREE.Mesh(new THREE.BoxGeometry(.22,.12,.34),shoeMaterial);
    shoe.name="FallbackShoes";shoe.position.set(x,.06,.04);g.add(shoe);
  }
  const legs=[l2,r2],arms=[l1,r1];g.userData={legs,arms,body};return g;
}
function playAnimation(name){
  if(!mixer)return;
  let found=Object.keys(actions).find(k=>k.includes(name));
  if(name==="idle"&&!found){
    if(!idlePoseAction)return;
    if(activeAction===idlePoseAction&&idlePoseAction.paused)return;
    activeAction?.stop();
    activeAction=idlePoseAction.reset().setLoop(THREE.LoopRepeat,Infinity).setEffectiveWeight(1).play();
    idlePoseAction.time=idlePoseTime;
    idlePoseAction.paused=true;
    return;
  }
  if(!found&&(name==="walk"||name==="run"))found=Object.keys(actions).find(k=>/walk|run|mixamo/i.test(k));
  if(!found)return;
  const next=actions[found];
  if(activeAction===next&&next.isRunning())return;
  activeAction?.stop();
  activeAction=next;
  activeAction.reset().setLoop(THREE.LoopRepeat,Infinity).setEffectiveWeight(1).play();
}
function stopWalkingAnimation(){
  playAnimation("idle");
}
function stopFallbackWalk(){
  if(!avatar?.userData.legs)return;
  avatar.userData.legs.forEach(leg=>{leg.rotation.x=0;});
  avatar.userData.arms.forEach(arm=>{arm.rotation.x=0;});
}
function clearMovementInput(){
  keys={};move={x:0,z:0};
  const stick=$("#joystick")?.querySelector(".stick");
  if(stick)stick.style.transform="translate(0,0)";
}
function onKeyDown(e){
  if(!renderer||museum.classList.contains("hidden"))return;
  if(albumOpen){
    if(e.key==="Escape"){closePhoto();e.preventDefault();}
    else if(e.key==="ArrowLeft"){changeAlbumPhoto(-1);e.preventDefault();}
    else if(e.key==="ArrowRight"){changeAlbumPhoto(1);e.preventDefault();}
    return;
  }
  const key=e.key.toLowerCase();
  keys[key]=true;
  if(["w","a","s","d","arrowup","arrowdown","arrowleft","arrowright"," "].includes(key))e.preventDefault();
  if(e.repeat)return;
  if(key==="e")interact();
  if(key==="f")sitToggle();
}
function onKeyUp(e){keys[e.key.toLowerCase()]=false;}
function setupJoystick(){
  if(joystickInitialized)return;
  joystickInitialized=true;
  const joy=$("#joystick"),stick=joy.querySelector(".stick");let active=false,origin={x:0,y:0};
  joy.addEventListener("pointerdown",e=>{active=true;joy.setPointerCapture(e.pointerId);const r=joy.getBoundingClientRect();origin={x:r.left+r.width/2,y:r.top+r.height/2};update(e);});
  joy.addEventListener("pointermove",e=>{if(active)update(e)});
  const stop=()=>{active=false;move.x=0;move.z=0;stick.style.transform="translate(0,0)"};joy.addEventListener("pointerup",stop);joy.addEventListener("pointercancel",stop);
  function update(e){let dx=e.clientX-origin.x,dy=e.clientY-origin.y;const len=Math.hypot(dx,dy),max=34;if(len>max){dx=dx/len*max;dy=dy/len*max;}stick.style.transform=`translate(${dx}px,${dy}px)`;move.x=dx/max;move.z=dy/max;}
}
function onSceneClick(e){
  pointer.x=(e.clientX/innerWidth)*2-1;pointer.y=-(e.clientY/innerHeight)*2+1;
  if(videoScreen){
    raycaster.setFromCamera(pointer,camera);
    if(raycaster.intersectObject(videoScreen).length){
      if(museumVideo?.src){
        if(museumVideo.paused)museumVideo.play().catch(error=>{
          console.error("Could not resume the museum video.",error);
          showToast("The video could not be resumed.");
        });
        else museumVideo.pause();
      }else $("#videoFile").click();
      return;
    }
  }
  if(bookDisplay){
    raycaster.setFromCamera(pointer,camera);
    if(raycaster.intersectObject(bookDisplay,true).length){
      if(nearby?.type==="album")openAlbum();
      else showToast("Walk up to the upstairs photo album to browse its pictures.");
      return;
    }
  }
  raycaster.setFromCamera(pointer,camera);const hits=raycaster.intersectObjects(photoMeshes,true);
  if(hits.length){
    let obj=hits[0].object;
    while(obj.parent&&!obj.userData.type)obj=obj.parent;
    if(obj.userData.type==="photo"){
      if(isFrameInReach(obj))openPhoto(obj.userData.memory);
      else showToast("Walk up in front of the frame to view it.");
    }
  }
}
function getForward(){return new THREE.Vector3(Math.sin(yaw),0,Math.cos(yaw));}
function isFrameInReach(frame){
  if(!avatar||!frame)return false;
  const avatarOnUpperFloor=avatar.position.y>=UPPER_FLOOR_Y-.01;
  const frameOnUpperFloor=frame.position.y>UPPER_FLOOR_Y;
  if(avatarOnUpperFloor!==frameOnUpperFloor)return false;
  const normal=new THREE.Vector3(0,0,1).applyQuaternion(frame.quaternion).setY(0).normalize();
  const towardFrame=new THREE.Vector3(frame.position.x-avatar.position.x,0,frame.position.z-avatar.position.z);
  const frontDistance=-towardFrame.dot(normal);
  const lateralDistance=Math.abs(towardFrame.x*(-normal.z)+towardFrame.z*normal.x);
  const avatarForward=new THREE.Vector3(Math.sin(avatar.rotation.y),0,Math.cos(avatar.rotation.y));
  const facingFrame=avatarForward.dot(towardFrame.clone().normalize());
  return frontDistance>=.2&&frontDistance<=2.15
    &&lateralDistance<=frame.userData.width/2+.45
    &&facingFrame>=.7;
}
function getMuseumFloorHeight(x,z,currentHeight=0){
  if(z>=STAIR_WALK_MIN_Z&&z<=STAIR_WALK_MAX_Z&&x<=STAIR_START_X&&x>=STAIR_END_X){
    const progress=THREE.MathUtils.clamp((STAIR_START_X-x)/(STAIR_START_X-STAIR_END_X),0,1);
    return progress*UPPER_FLOOR_Y;
  }
  if(z>=STAIR_WALK_MIN_Z&&z<=STAIR_WALK_MAX_Z&&x<STAIR_END_X&&x>=STAIR_END_X-.6){
    return UPPER_FLOOR_Y;
  }
  return currentHeight>=UPPER_FLOOR_Y-.01?UPPER_FLOOR_Y:0;
}
function canOccupy(x,z,radius=.48,floorHeight=0){
  if(x < -27.2||x > 27.2||z < -15.2||z > 15.2)return false;
  const onStairTread=z>=STAIR_WALK_MIN_Z&&z<=STAIR_WALK_MAX_Z
    &&x>=STAIR_END_X-.6&&x<=STAIR_START_X+.3;
  const insideStairOpening=x>STAIR_END_X-.25&&x<STAIR_START_X+.25
    &&z>STAIR_MIN_Z-.25&&z<STAIR_MAX_Z+.25;
  if(floorHeight>0&&floorHeight<UPPER_FLOOR_Y&&!onStairTread)return false;
  if(insideStairOpening&&!onStairTread)return false;
  return !wallColliders.some(wall=>
    (wall.level??0)===(floorHeight>=UPPER_FLOOR_Y-.01?1:0)
    &&x+radius>wall.minX&&x-radius<wall.maxX&&z+radius>wall.minZ&&z-radius<wall.maxZ
  );
}
function canMoveToFloor(x,z,targetFloor,currentX,currentZ,currentFloor){
  const inStairWidth=currentZ>=STAIR_WALK_MIN_Z&&currentZ<=STAIR_WALK_MAX_Z;
  const insideStairLane=inStairWidth
    &&((currentFloor===0&&currentX>=STAIR_START_X-STAIR_RUN&&currentX<=STAIR_START_X+.3)
      ||(currentFloor>0&&currentFloor<UPPER_FLOOR_Y&&currentX<=STAIR_START_X&&currentX>=STAIR_END_X)
      ||(currentFloor>=UPPER_FLOOR_Y-.01&&currentX<=STAIR_START_X+.3&&currentX>=STAIR_END_X-.6));
  const targetIsStair=targetFloor>0&&targetFloor<UPPER_FLOOR_Y;
  if(currentFloor>0&&currentFloor<UPPER_FLOOR_Y&&Math.abs(z-currentZ)>.001)return false;
  if(!insideStairLane&&currentFloor===0&&targetIsStair&&x>STAIR_START_X+STAIR_RUN)return false;
  if(!insideStairLane&&currentFloor>=UPPER_FLOOR_Y-.01&&targetIsStair&&x<STAIR_END_X-STAIR_RUN)return false;
  return canOccupy(x,z,.48,targetFloor);
}
function interact(){
  if(!avatar)return;
  if(nearby?.type==="album"){openAlbum();return;}
  if(nearby?.type==="photo"){
    if(isFrameInReach(nearby.frame))openPhoto(nearby.memory);
    return;
  }
  if(nearby?.type==="bench"){sitToggle();return;}
  if(nearby?.type==="video"){
    if(museumVideo?.src){
      if(museumVideo.paused)museumVideo.play().catch(error=>{
        console.error("Could not resume the museum video.",error);
        showToast("The video could not be resumed.");
      });
      else museumVideo.pause();
    }else $("#videoFile").click();
    return;
  }
  if(nearby?.type==="exit"){exitMuseum();return;}
  showToast("Walk closer to a photo, the bench, the video screen or the exit.");
}
function setSittingPose(active){
  if(active){
    sitOrigin=avatar.position.clone();
    sitRotation=avatar.rotation.y;
    const joints=[];
    let hips=null;
    avatar.traverse(object=>{
      if(!object.isBone)return;
      if(/Hips$/i.test(object.name))hips={bone:object,position:object.position.clone()};
      const angle=/(?:Left|Right)UpLeg$/i.test(object.name)?1.25
        :/(?:Left|Right)Leg$/i.test(object.name)?-1.35
        :null;
      if(angle!==null){
        joints.push({bone:object,rotation:object.quaternion.clone(),angle});
      }
    });
    sitPose={joints,hips,hipOffset:0};
    avatar.position.set(-19.1,0,0);
    avatar.rotation.y=-Math.PI/2;
    if(hips){
      avatar.updateMatrixWorld(true);
      const scale=hips.bone.parent.getWorldScale(new THREE.Vector3()).y;
      if(Number.isFinite(scale)&&scale>0)sitPose.hipOffset=-.32/scale;
    }
    applySittingPose();
    return;
  }
  sitPose?.joints.forEach(({bone,rotation})=>bone.quaternion.copy(rotation));
  if(sitPose?.hips)sitPose.hips.bone.position.copy(sitPose.hips.position);
  if(sitOrigin)avatar.position.copy(sitOrigin);
  avatar.rotation.y=sitRotation;
  sitRotation=0;
  sitPose=null;sitOrigin=null;
}
function applySittingPose(){
  if(!sitPose)return;
  sitPose.joints.forEach(({bone,rotation,angle})=>{
    bone.quaternion.copy(rotation).multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,0),angle));
  });
  if(sitPose.hips){
    sitPose.hips.bone.position.copy(sitPose.hips.position);
    sitPose.hips.bone.position.y+=sitPose.hipOffset;
    avatar.updateMatrixWorld(true);
    const hipPosition=sitPose.hips.bone.getWorldPosition(new THREE.Vector3());
    avatar.position.add(new THREE.Vector3(-19.1,1.08,0).sub(hipPosition));
  }
}
function sitToggle(){
  if(!avatar)return;
  if(!nearby||nearby.type!=="bench"){showToast("Walk up to the bench first.");return;}
  if(!sitting){stopWalkingAnimation();mixer?.update(0);}
  sitting=!sitting;setSittingPose(sitting);
  showToast(sitting?"Take a seat. Press F to stand.":"You're back on your feet.");
}
function findNearby(){
  nearby=null;if(!avatar)return;
  let best=Infinity;
  const candidates=photoMeshes.map(frame=>({type:"photo",memory:frame.userData.memory,pos:frame.position,frame})).concat([
    {type:"bench",pos:new THREE.Vector3(-19.1,0,0)},
    {type:"video",pos:new THREE.Vector3(-25.5,0,0)},
    {type:"exit",pos:new THREE.Vector3(25.4,0,-2)},
    {type:"album",pos:bookDisplay?.userData.position}
  ]);
  candidates.forEach(c=>{
    if(!c.pos)return;
    const avatarOnUpperFloor=avatar.position.y>=UPPER_FLOOR_Y-.01;
    const candidateOnUpperFloor=(c.type==="photo"||c.type==="album")&&c.pos.y>=UPPER_FLOOR_Y-.01;
    if(avatarOnUpperFloor!==candidateOnUpperFloor)return;
    if(c.type==="photo"){
      if(!isFrameInReach(c.frame))return;
      const distance=Math.hypot(avatar.position.x-c.pos.x,avatar.position.z-c.pos.z);
      if(distance<best){best=distance;nearby=c;}
      return;
    }
    const horizontalDistance=Math.hypot(avatar.position.x-c.pos.x,avatar.position.z-c.pos.z);
    const reach=c.type==="album"?3.2:2.5;
    if(horizontalDistance<reach&&horizontalDistance<best){best=horizontalDistance;nearby=c;}
  });
  const photoPrompt=$("#photoPrompt");
  const isNearbyPhoto=nearby?.type==="photo";
  let photoPromptVisible=false;
  photoPrompt.classList.toggle("hidden",true);
  if(isNearbyPhoto){
    const anchor=nearby.frame.localToWorld(nearby.frame.userData.promptAnchor.clone());
    anchor.project(camera);
    const x=(anchor.x*.5+.5)*innerWidth;
    const y=(-anchor.y*.5+.5)*innerHeight;
    const onScreen=anchor.z>-1&&anchor.z<1&&x>20&&x<innerWidth-20&&y>20&&y<innerHeight-20;
    photoPromptVisible=onScreen;
    if(onScreen){
      photoPrompt.classList.remove("hidden");
      photoPrompt.style.left=`${x}px`;
      photoPrompt.style.top=`${y}px`;
      photoPrompt.setAttribute("aria-label",`View ${nearby.memory.title}; press E`);
    }
  }
  const action=$("#actionBtn");
  action.classList.toggle("is-visible",Boolean(nearby)&&(!isNearbyPhoto||!photoPromptVisible));
  action.textContent=nearby?(nearby.type==="photo"?"View memory":nearby.type==="album"?"Browse photo album · E":nearby.type==="bench"?(sitting?"Stand · F":"Sit · F"):nearby.type==="video"?(museumVideo?.src?(museumVideo.paused?"Play video":"Pause video"):"Choose video"):"Exit museum"):"E · Interact";
}
function animate(){
  requestAnimationFrame(animate);if(!renderer)return;
  const now=performance.now();
  if(fpsLimit&&now-lastFrameTime<1000/fpsLimit)return;
  lastFrameTime=now;
  const dt=Math.min(clock.getDelta(),.05);
  if(mixer)mixer.update(dt);
  if(sitting)applySittingPose();
  if(avatar&&!sitting){
    const forward=(keys.w||keys.arrowup?-1:0)+(keys.s||keys.arrowdown?1:0)+move.z;
    const side=(keys.d||keys.arrowright?1:0)+(keys.a||keys.arrowleft?-1:0)+move.x;
    const moving=Math.abs(forward)+Math.abs(side)>.08;
    if(moving){
      const f=getForward(),right=new THREE.Vector3(f.z,0,-f.x);
      const dir=f.multiplyScalar(forward).add(right.multiplyScalar(side)).normalize();
      const speed=(keys.shift?7:4.5)*dt;
      const previousX=avatar.position.x,previousZ=avatar.position.z;
      const nextX=avatar.position.x+dir.x*speed,nextZ=avatar.position.z+dir.z*speed;
      const currentFloor=avatar.position.y;
      const nextXFloor=getMuseumFloorHeight(nextX,avatar.position.z,currentFloor);
      if(canMoveToFloor(nextX,avatar.position.z,nextXFloor,avatar.position.x,avatar.position.z,currentFloor)){
        avatar.position.x=nextX;
        avatar.position.y=nextXFloor;
      }
      const nextZFloor=getMuseumFloorHeight(avatar.position.x,nextZ,avatar.position.y);
      if(canMoveToFloor(avatar.position.x,nextZ,nextZFloor,avatar.position.x,avatar.position.z,avatar.position.y)){
        avatar.position.z=nextZ;
        avatar.position.y=nextZFloor;
      }
      const didMove=Math.hypot(avatar.position.x-previousX,avatar.position.z-previousZ)>.001;
      if(didMove){
        avatar.rotation.y=Math.atan2(dir.x,dir.z);
        cameraFollowing=true;
      }
      if(didMove&&!mixer&&avatar.userData.legs){const t=clock.elapsedTime*8;avatar.userData.legs[0].rotation.x=Math.sin(t)*.65;avatar.userData.legs[1].rotation.x=-Math.sin(t)*.65;avatar.userData.arms[0].rotation.x=-Math.sin(t)*.35;avatar.userData.arms[1].rotation.x=Math.sin(t)*.35;}
      else if(didMove&&mixer)playAnimation(keys.shift?"run":"walk");
      else if(mixer)stopWalkingAnimation();
      else stopFallbackWalk();
    }else if(mixer)stopWalkingAnimation();
    else stopFallbackWalk();
  }else if(avatar&&sitting&&mixer){
    stopWalkingAnimation();
  }
  if(avatar&&cameraFollowing){
    if(cameraMode==="eyes"){
      const eyePosition=avatar.position.clone().add(new THREE.Vector3(0,1.58,0));
      camera.position.lerp(eyePosition,.25);
      const direction=new THREE.Vector3(Math.sin(yaw)*Math.cos(cameraPitch),Math.sin(cameraPitch),Math.cos(yaw)*Math.cos(cameraPitch));
      camera.lookAt(eyePosition.clone().add(direction.multiplyScalar(8)));
    }else{
      const targetHeight=1.2,cameraDistance=6;
      const target=avatar.position.clone().add(new THREE.Vector3(0,targetHeight,0));
      const horizontalDistance=cameraDistance*Math.cos(cameraPitch);
      const desired=avatar.position.clone().add(new THREE.Vector3(
        Math.sin(yaw)*horizontalDistance,
        targetHeight+cameraDistance*Math.sin(cameraPitch),
        Math.cos(yaw)*horizontalDistance
      ));
      camera.position.lerp(desired,.12);camera.lookAt(target);
    }
  }
  for(let i=reactionSprites.length-1;i>=0;i--){
    const reaction=reactionSprites[i],progress=(now-reaction.startedAt)/reaction.duration;
    if(progress>=1){
      reaction.sprite.parent?.remove(reaction.sprite);
      reaction.texture.dispose();
      reaction.sprite.material.dispose();
      reactionSprites.splice(i,1);
    }else{
      reaction.sprite.position.y=2.4+progress*.65;
      reaction.sprite.material.opacity=1-progress;
    }
  }
  performanceFrameCount++;
  if(now-lastPerformanceUpdate>=500){
    currentFps=Math.round(performanceFrameCount*1000/(now-performanceWindowStart));
    lastPerformanceUpdate=now;
  }
  if(now-lastAdaptiveUpdate>=2000){
    if(adaptiveResolution){
      if(currentFps<25)adaptiveScale=Math.max(.65,adaptiveScale-.1);
      else if(currentFps>50)adaptiveScale=Math.min(1,adaptiveScale+.05);
      applyGraphicsSettings();
    }
    performanceWindowStart=now;performanceFrameCount=0;lastAdaptiveUpdate=now;
  }
  findNearby();renderer.render(scene,camera);
}
function displayMemory(mem){
  $("#modalPhoto").src=PHOTO_DIR+mem.file;
  $("#modalPhoto").alt="A memory from our collection";
  $("#modalText").textContent=mem.text;
}
function openPhoto(mem){
  albumOpen=false;
  $("#albumPrevious").classList.add("hidden");
  $("#albumNext").classList.add("hidden");
  $("#albumCounter").classList.add("hidden");
  $("#photoModal").setAttribute("aria-label","Memory photo");
  displayMemory(mem);
  $("#photoModal").classList.remove("hidden");
}
function openAlbum(){
  if(!memories.length)return;
  albumOpen=true;
  albumIndex=0;
  $("#photoModal").setAttribute("aria-label","Our story photo album");
  $("#albumPrevious").classList.remove("hidden");
  $("#albumNext").classList.remove("hidden");
  $("#albumCounter").classList.remove("hidden");
  $("#photoModal").classList.remove("hidden");
  displayAlbumPhoto();
}
function displayAlbumPhoto(){
  const memory=memories[albumIndex];
  if(!memory)return;
  displayMemory(memory);
  $("#albumCounter").textContent=`Photo ${albumIndex+1} of ${memories.length} · Use the arrows to browse`;
}
function changeAlbumPhoto(direction){
  if(!albumOpen||!memories.length)return;
  albumIndex=(albumIndex+direction+memories.length)%memories.length;
  displayAlbumPhoto();
}
function closePhoto(){
  albumOpen=false;
  $("#photoModal").classList.add("hidden");
}
function showToast(msg){const t=$("#toast");t.textContent=msg;t.classList.add("show");clearTimeout(showToast.timer);showToast.timer=setTimeout(()=>t.classList.remove("show"),2600);}
function exitMuseum(){
  avatarLoadId++;
  museumVideo?.pause();
  museumVideo?.removeAttribute("src");
  museumVideo?.load();
  museumVideo=null;
  videoScreen=null;
  if(museumVideoUrl){URL.revokeObjectURL(museumVideoUrl);museumVideoUrl=null;}
  museumVideoTexture?.dispose();museumVideoTexture=null;
  reactionSprites.forEach(({sprite,texture})=>{sprite.parent?.remove(sprite);texture.dispose();sprite.material.dispose();});
  reactionSprites=[];
  if(audioContext){
    audioContext.close().catch(error=>console.warn("Could not close museum audio cleanly.",error));
    audioContext=null;masterGain=null;effectsGain=null;
  }
  if(museumMusic){
    museumMusic.pause();
    museumMusic.removeAttribute("src");
    museumMusic.load();
    museumMusic=null;
  }
  musicPlaylistActive=false;musicTrackIndex=0;
  if(renderer){renderer.dispose();sceneHost.innerHTML="";renderer=null;}
  removeEventListener("keydown",onKeyDown);removeEventListener("keyup",onKeyUp);removeEventListener("resize",resize);
  removeEventListener("blur",clearMovementInput);document.removeEventListener("visibilitychange",clearMovementInput);
  clearMovementInput();
  photoMeshes=[];bookDisplay=null;nearby=null;avatar=null;visitorNameSprite=null;mixer=null;actions={};activeAction=null;idlePoseAction=null;armPoseAction=null;idlePoseTime=0;sitting=false;sitPose=null;sitOrigin=null;sitRotation=0;$("#settingsPanel").classList.add("hidden");$("#reactionMenu").classList.add("hidden");welcome.classList.remove("hidden");museum.classList.add("hidden");closePhoto();
  initCharacterPreview();
}
function resize(){if(!renderer)return;camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(getRenderPixelRatio());}
