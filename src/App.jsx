import { useState, useEffect, useRef } from "react";
import { supabase } from "./supabase";
import Auth from "./Auth";
import { removeBackground } from "@imgly/background-removal";

const STICKERS = ["\u{1F496}","\u2B50","\u2728","\u{1F31F}","\u{1F4AB}","\u{1F389}","\u{1F942}","\u{1F37E}","\u{1F451}","\u{1F380}","\u{1F48E}","\u{1F98B}","\u{1F338}","\u{1F388}","\u{1F38A}","\u{1F49D}","\u26A1","\u{1F525}","\u{1F495}","\u{1F49C}","\u{1F49B}","\u{1F90D}","\u{1F602}","\u{1F60D}","\u{1F973}","\u{1F62D}","\u{1F929}","\u{1F60E}","\u{1F970}","\u{1F605}","\u{1F64C}","\u{1F44F}","\u{1F48B}","\u{1F382}","\u{1F370}","\u{1F964}","\u{1F3C6}","\u{1F381}","\u{1F3B6}","\u{1F3B5}"];

const BOOK_THEMES = [
  {c1:"#f7da78",c2:"#f0c94f",text:"#7c5a1c",shadow:"rgba(150,110,30,0.18)"},
  {c1:"rgba(179, 218, 156, 1)",c2:"#97c97f",text:"#3f6b35",shadow:"rgba(60,110,40,0.16)"},
  {c1:"#bcd5ef",c2:"#a6c5ec",text:"#2f5488",shadow:"rgba(50,80,140,0.16)"},
  {c1:"#f5bf92",c2:"#eda36e",text:"#8a4a22",shadow:"rgba(150,90,40,0.16)"},
  {c1:"#d2c0ef",c2:"#bca6e2",text:"#5a3f86",shadow:"rgba(95,70,140,0.16)"},
  {c1:"#97d6c9",c2:"#79c4b4",text:"#1f6a5e",shadow:"rgba(35,110,95,0.16)"},
  {c1:"#f0c6d2",c2:"#e8a8bc",text:"#8a3f5e",shadow:"rgba(140,60,90,0.16)"},
];

const BUBBLE_COLORS = ["#ffb6c8","#fff9c4","#c8e6ff","#d4f0c8","#e8d4f5","#fde8c8","#ffffff","#ffc0cb"];

const ALBUMS = [
  {id:1,name:"Tenerife 2023",emoji:"🏖️",height:195,
   photos:[{id:1,emoji:"🏖️",caption:"First morning",color:"#fde8c8",aspect:"landscape"},{id:2,emoji:"🌅",caption:"Sunset",color:"#ffe0b2",aspect:"wide"},{id:3,emoji:"🍹",caption:"Sangria",color:"#fce4ec",aspect:"square"},{id:4,emoji:"🐠",caption:"Snorkel",color:"#e0f7fa",aspect:"portrait"},{id:5,emoji:"🏔️",caption:"Teide",color:"#f3e5f5",aspect:"landscape"}],
   comments:[{id:1,author:"Mum",text:"This holiday was absolutely magical ❤️",date:"12 Jan 2024"},{id:2,author:"Jamie",text:"Best trip we've ever done 🙌",date:"13 Jan 2024"}]},
  {id:2,name:"Mum's 60th Birthday",emoji:"🎂",height:215,
   photos:[{id:1,emoji:"🎂",caption:"The cake!",color:"#fce4ec",aspect:"square"},{id:2,emoji:"👨‍👩‍👧‍👦",caption:"All of us",color:"#e3f2fd",aspect:"wide"},{id:3,emoji:"🥂",caption:"Toast",color:"#fff9c4",aspect:"landscape"},{id:4,emoji:"💐",caption:"Her flowers",color:"#f3e5f5",aspect:"portrait"}],
   comments:[{id:1,author:"Dad",text:"What a day. So proud 🥲",date:"5 Mar 2024"}]},
  {id:3,name:"Christmas 2024",emoji:"🎄",height:178,
   photos:[{id:1,emoji:"🎄",caption:"Christmas morning",color:"#fff3e0",aspect:"landscape"},{id:2,emoji:"🎁",caption:"Present chaos",color:"#fde8c8",aspect:"wide"},{id:3,emoji:"🍗",caption:"The spread",color:"#e8f5e9",aspect:"square"},{id:4,emoji:"🌨️",caption:"It snowed!",color:"#e3f2fd",aspect:"portrait"}],
   comments:[]},
  {id:4,name:"Snowdonia Hike",emoji:"🌄",height:202,
   photos:[{id:1,emoji:"🌄",caption:"Dawn start",color:"#e8f5e9",aspect:"wide"},{id:2,emoji:"🥾",caption:"Two hours in",color:"#fff3e0",aspect:"square"},{id:3,emoji:"🏔️",caption:"The summit",color:"#f3e5f5",aspect:"landscape"}],
   comments:[{id:1,author:"Pete",text:"My legs 😂",date:"20 Sep 2024"},{id:2,author:"Sarah",text:"Worth every blister!",date:"20 Sep 2024"}]},
  {id:5,name:"Jamie's First Gig",emoji:"🎸",height:188,
   photos:[{id:1,emoji:"🎸",caption:"Sound check",color:"#e8eaf6",aspect:"landscape"},{id:2,emoji:"🎤",caption:"First song",color:"#fce4ec",aspect:"portrait"},{id:3,emoji:"🎶",caption:"The crowd",color:"#e0f7fa",aspect:"wide"}],
   comments:[{id:1,author:"Mum",text:"I cried the whole way through 😭❤️",date:"8 Nov 2024"}]},
  {id:6,name:"Family BBQ",emoji:"🍖",height:168,
   photos:[{id:1,emoji:"🍖",caption:"Grill master",color:"#fff3e0",aspect:"square"},{id:2,emoji:"👶",caption:"Little ones",color:"#f3e5f5",aspect:"portrait"},{id:3,emoji:"🌞",caption:"Golden hour",color:"#fde8c8",aspect:"wide"}],
   comments:[]},
];

const INITIAL_SHELVES=[{id:1,albums:ALBUMS}];

const ASPECTS={landscape:{w:230,h:162},portrait:{w:152,h:214},square:{w:180,h:180},wide:{w:270,h:150},tall:{w:132,h:236}};
const SCATTER=[{cx:155,cy:145},{cx:385,cy:118},{cx:125,cy:345},{cx:410,cy:355},{cx:278,cy:470},{cx:530,cy:240}];
const INITIAL_ITEMS=[
  {id:1,type:'polaroid',emoji:"🎂",caption:"Mum's 60th",color:"#fce4ec",cx:180,cy:210,rot:4,zIndex:1,w:148,h:148},
  {id:2,type:'bubble',text:"Happy Birthday Mum! 🎂🎉",cx:390,cy:160,rot:-3,zIndex:2,color:"#fff9c4"},
  {id:3,type:'sticker',emoji:"🎉",cx:310,cy:90,rot:15,size:52,zIndex:3},
  {id:4,type:'sticker',emoji:"⭐",cx:530,cy:110,rot:-10,size:38,zIndex:4},
  {id:5,type:'polaroid',emoji:"👨‍👩‍👧‍👦",caption:"All together",color:"#e3f2fd",cx:610,cy:230,rot:-4,zIndex:5,w:155,h:130},
  {id:6,type:'bubble',text:"Best day ever! ❤️",cx:820,cy:180,rot:2,zIndex:6,color:"#e8f5e9"},
  {id:7,type:'sticker',emoji:"🌟",cx:760,cy:340,rot:-18,size:44,zIndex:7},
  {id:8,type:'sticker',emoji:"🥳",cx:480,cy:330,rot:8,size:48,zIndex:8},
  {id:9,type:'polaroid',emoji:"🏖️",caption:"Tenerife ☀️",color:"#fde8c8",cx:1070,cy:210,rot:-3,zIndex:9,w:152,h:152},
  {id:10,type:'sticker',emoji:"🌅",cx:990,cy:120,rot:8,size:42,zIndex:10},
  {id:11,type:'bubble',text:"Miss this place 😍",cx:1270,cy:165,rot:-2,zIndex:11,color:"#e3f2fd"},
  {id:12,type:'polaroid',emoji:"🎄",caption:"Christmas 2024",color:"#fff3e0",cx:1500,cy:230,rot:3,zIndex:12,w:145,h:162},
  {id:13,type:'sticker',emoji:"❄️",cx:1430,cy:100,rot:-5,size:46,zIndex:13},
  {id:14,type:'sticker',emoji:"🎁",cx:1640,cy:150,rot:12,size:42,zIndex:14},
  {id:15,type:'bubble',text:"It actually snowed this year!!",cx:1720,cy:300,rot:1,zIndex:15,color:"#e3f2fd"},
];

function seededRandom(seed){let s=seed;return()=>{s=(s*16807+0)%2147483647;return(s-1)/2147483646;};}
function initBookPositions(photos){const pos={};photos.forEach((photo,i)=>{const slot=SCATTER[i%SCATTER.length];const dims=ASPECTS[photo.aspect]||ASPECTS.landscape;const rnd=seededRandom(photo.id*137+i*31);pos[photo.id]={cx:slot.cx+(rnd()-0.5)*50,cy:slot.cy+(rnd()-0.5)*40,w:dims.w,h:dims.h,rot:(rnd()-0.5)*22,zIndex:i+1};});return pos;}
function tb(bg,col){return{background:bg,color:col,border:"none",borderRadius:20,padding:"7px 15px",fontFamily:"'Nunito',sans-serif",fontSize:11,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",cursor:"pointer",boxShadow:"0 1px 4px rgba(0,0,0,0.15)"};}
function hdl(pos){const b={position:"absolute",zIndex:10,background:"#4a90e2",cursor:"grab",display:"flex",alignItems:"center",justifyContent:"center",color:"white",boxShadow:"0 1px 6px rgba(0,0,0,0.3)",border:"2px solid white"};if(pos==="top")return{...b,top:-30,left:"50%",transform:"translateX(-50%)",width:24,height:24,borderRadius:"50%",fontSize:14};if(pos==="br")return{...b,bottom:-5,right:-5,width:20,height:20,borderRadius:5,fontSize:11,cursor:"se-resize"};}
const PIN_COLORS=["#e63946","#2a9d8f","#e9c46a","#a8dadc","#e76f51","#457b9d"];

function HorizontalWall({session,muted}){
  const [items,setItems]=useState([]);
  const [editing,setEditing]=useState(false);
  const [selected,setSelected]=useState(null);
  const [editingText,setEditingText]=useState(null);
  const [editingCaption,setEditingCaption]=useState(null);
  const [maxZ,setMaxZ]=useState(20);
  const [showStickers,setShowStickers]=useState(false);
  const [showNoteMenu,setShowNoteMenu]=useState(false);
  const [showPhotoMenu,setShowPhotoMenu]=useState(false);
  const photoModeRef=useRef('polaroid');
  const [uploading,setUploading]=useState(false);
  const [uploadingAudio,setUploadingAudio]=useState(false);
  const [cuttingOut,setCuttingOut]=useState(false);
  const [viewPhoto,setViewPhoto]=useState(null);
  const [doodling,setDoodling]=useState(false);
  const [erasing,setErasing]=useState(false);
  const [doodleColor,setDoodleColor]=useState("#1a1a1a");
  const [doodleWidth,setDoodleWidth]=useState(3);
  const [currentPath,setCurrentPath]=useState(null);
  const doodlePoints=useRef([]);
  const doodleColorRef=useRef(doodleColor);
  const doodleWidthRef=useRef(doodleWidth);
  const doodlingRef=useRef(false);
  const erasingRef=useRef(false);
  useEffect(()=>{doodleColorRef.current=doodleColor;},[doodleColor]);
  useEffect(()=>{doodleWidthRef.current=doodleWidth;},[doodleWidth]);
  useEffect(()=>{doodlingRef.current=doodling;},[doodling]);
  useEffect(()=>{erasingRef.current=erasing;},[erasing]);
  const [view,setView]=useState({x:80,y:80,zoom:1});
  const [homeView,setHomeView]=useState(null);
  const [homeViewSet,setHomeViewSet]=useState(false);
  const clearedDoodles=useRef([]);
  const [vp,setVp]=useState({w:1200,h:700});
  const dragStart=useRef(null);
  const panStart=useRef(null);
  const viewportRef=useRef(null);
  const saveTimeout=useRef(null);
  const didDrag=useRef(false);
  const mousedownOnItem=useRef(false);
  const viewRef=useRef(view);
  const hasLoaded=useRef(false);
  useEffect(()=>{viewRef.current=view;},[view]);

  useEffect(()=>{
    const measure=()=>{const el=viewportRef.current;if(el)setVp({w:el.clientWidth,h:el.clientHeight});};
    measure();
    window.addEventListener('resize',measure);
    return()=>window.removeEventListener('resize',measure);
  },[]);

  useEffect(()=>{
    const loadWall=async()=>{
      if(!session?.user)return;
      const{data,error}=await supabase.from('walls').select('items').eq('user_id',session.user.id).maybeSingle();
      if(error)console.error('[Wall load] error:',error);
      console.log('[Wall load] data:',data);
      if(data?.items?.length){
        setItems(data.items);
        const loadedMaxZ=Math.max(...data.items.map(i=>i.zIndex||1),20);
        setMaxZ(loadedMaxZ);
      }
      // Load home view from localStorage only on first mount this session
      try{
        const saved=localStorage.getItem('pinwall_home_view');
        if(saved){
          setHomeViewSet(true);
          const hv=JSON.parse(saved);
          setHomeView(hv);
          if(!window.__pinwall_view_applied){
            setView(hv);
            window.__pinwall_view_applied=true;
          }
        }
      }catch(e){}
      hasLoaded.current=true;
    };
    loadWall();
  },[session]);

  useEffect(()=>{
    if(!session?.user||!hasLoaded.current)return;
    clearTimeout(saveTimeout.current);
    saveTimeout.current=setTimeout(async()=>{
      console.log('[Wall save] saving',items.length,'items');
      const{error}=await supabase.from('walls').upsert({user_id:session.user.id,items},{onConflict:'user_id'});
      if(error)console.error('[Wall save] error:',error);
      else console.log('[Wall save] success');
    },1500);
    return()=>clearTimeout(saveTimeout.current);
  },[items,session]);

  // Extract dominant color from photos that don't have one yet
  useEffect(()=>{
    const photosWithoutColor=items.filter(i=>(i.type==='photo'||i.type==='cutout')&&i.url&&!i.dominantColor);
    if(!photosWithoutColor.length)return;
    photosWithoutColor.forEach(item=>{
      const img=new Image();
      img.crossOrigin="anonymous";
      img.onload=()=>{
        const canvas=document.createElement('canvas');
        canvas.width=4;canvas.height=4;
        const ctx=canvas.getContext('2d');
        ctx.drawImage(img,0,0,4,4);
        const d=ctx.getImageData(0,0,4,4).data;
        let r=0,g=0,b=0;
        for(let i=0;i<d.length;i+=4){r+=d[i];g+=d[i+1];b+=d[i+2];}
        const px=d.length/4;
        const col=`rgb(${Math.round(r/px)},${Math.round(g/px)},${Math.round(b/px)})`;
        setItems(p=>p.map(i=>i.id===item.id?{...i,dominantColor:col}:i));
      };
      img.src=item.url;
    });
  },[items.length]);

  useEffect(()=>{
    const onKey=e=>{
      if(!editing||!selected)return;
      if(e.key==='Delete'||e.key==='Backspace'){
        if(editingText||editingCaption)return;
        setItems(p=>p.filter(i=>i.id!==selected));
        setSelected(null);
      }
    };
    window.addEventListener('keydown',onKey);
    return()=>window.removeEventListener('keydown',onKey);
  },[editing,selected,editingText]);

  const rectOf=()=>viewportRef.current?.getBoundingClientRect();
  const centerWorld=()=>{const v=viewRef.current;return{x:(vp.w/2-v.x)/v.zoom,y:(vp.h/2-v.y)/v.zoom};};

  const bringToFront=id=>{const z=maxZ+1;setMaxZ(z);setItems(p=>p.map(i=>i.id===id?{...i,zIndex:z}:i));return z;};

  const startDrag=(e,id)=>{const cx=e.clientX||e.touches?.[0]?.clientX;const cy=e.clientY||e.touches?.[0]?.clientY;e.stopPropagation();if(!editing)return;if(editingText===id)return;mousedownOnItem.current=true;bringToFront(id);setSelected(id);const item=items.find(i=>i.id===id);const v=viewRef.current;dragStart.current={mode:'move',id,mouseX:cx,mouseY:cy,cx:item.cx,cy:item.cy,zoom:v.zoom};panStart.current=null;};
  const startRotate=(e,id)=>{const cx=e.clientX||e.touches?.[0]?.clientX;const cy=e.clientY||e.touches?.[0]?.clientY;e.preventDefault();e.stopPropagation();mousedownOnItem.current=true;const item=items.find(i=>i.id===id);const r=rectOf();const v=viewRef.current;const cxS=item.cx*v.zoom+v.x+(r?.left||0),cyS=item.cy*v.zoom+v.y+(r?.top||0);const startAngle=Math.atan2(cy-cyS,cx-cxS)*(180/Math.PI);dragStart.current={mode:'rotate',id,startAngle,startRot:item.rot||0,cxS,cyS};panStart.current=null;};
  const startResize=(e,id)=>{const cx=e.clientX||e.touches?.[0]?.clientX;const cy=e.clientY||e.touches?.[0]?.clientY;e.preventDefault();e.stopPropagation();mousedownOnItem.current=true;const item=items.find(i=>i.id===id);const rotRad=(item.rot||0)*Math.PI/180;const v=viewRef.current;dragStart.current={mode:'resize',id,mouseX:cx,mouseY:cy,startW:item.w||item.size||60,startH:item.h||item.size||60,startScale:item.scale||1,rotRad,zoom:v.zoom};panStart.current=null;};

  useEffect(()=>{
    const onMove=e=>{
      // Doodle drawing
      if(doodlePoints.current.length>0){
        const r=viewportRef.current?.getBoundingClientRect();
        const v=viewRef.current;
        const wx=(e.clientX-(r?.left||0)-v.x)/v.zoom;
        const wy=(e.clientY-(r?.top||0)-v.y)/v.zoom;
        doodlePoints.current.push({x:wx,y:wy});
        setCurrentPath(prev=>prev+` L${wx} ${wy}`);
        return;
      }
      if(panStart.current){const p=panStart.current;didDrag.current=true;setView(v=>({...v,x:p.vx+(e.clientX-p.mx),y:p.vy+(e.clientY-p.my)}));return;}
      const d=dragStart.current;if(!d)return;didDrag.current=true;
      if(d.mode==='move'){const dx=(e.clientX-d.mouseX)/d.zoom,dy=(e.clientY-d.mouseY)/d.zoom;setItems(p=>p.map(i=>i.id===d.id?{...i,cx:d.cx+dx,cy:d.cy+dy}:i));}
      else if(d.mode==='rotate'){const angle=Math.atan2(e.clientY-d.cyS,e.clientX-d.cxS)*(180/Math.PI);setItems(p=>p.map(i=>i.id===d.id?{...i,rot:d.startRot+(angle-d.startAngle)}:i));}
      else if(d.mode==='resize'){const dx=(e.clientX-d.mouseX)/d.zoom,dy=(e.clientY-d.mouseY)/d.zoom;const cos=Math.cos(d.rotRad),sin=Math.sin(d.rotRad);const lx=cos*dx+sin*dy,ly=-sin*dx+cos*dy;setItems(p=>p.map(i=>{if(i.id!==d.id)return i;if(i.type==='sticker')return{...i,size:Math.max(24,d.startW+Math.max(lx,ly)*2)};if(i.type==='bubble'||i.type==='speech'||i.type==='markertext')return{...i,scale:Math.max(0.3,d.startScale+(lx+ly)/200)};return{...i,w:Math.max(80,d.startW+lx*2),h:Math.max(60,d.startH+ly*2)};}));}
    };
    const onTouchMoveItems=e=>{
      if(doodlePoints.current.length>0){
        e.preventDefault();
        const t=e.touches[0];
        onMove({clientX:t.clientX,clientY:t.clientY});
        return;
      }
      if(!dragStart.current)return;
      e.preventDefault();
      const t=e.touches[0];
      onMove({clientX:t.clientX,clientY:t.clientY});
    };
    const onUp=()=>{
      // Finish doodle
      if(doodlePoints.current.length>1){
        const pts=doodlePoints.current;
        const minX=Math.min(...pts.map(p=>p.x)),maxX=Math.max(...pts.map(p=>p.x));
        const minY=Math.min(...pts.map(p=>p.y)),maxY=Math.max(...pts.map(p=>p.y));
        const cx=(minX+maxX)/2,cy=(minY+maxY)/2;
        const pathData=pts.map((p,i)=>`${i===0?'M':'L'}${p.x-minX} ${p.y-minY}`).join(' ');
        const w=Math.max(20,maxX-minX);
        const h=Math.max(20,maxY-minY);
        setItems(prev=>[{id:Date.now(),type:'doodle',path:pathData,cx,cy,w,h,color:doodleColorRef.current,strokeWidth:doodleWidthRef.current,rot:0,zIndex:maxZ+1},...prev]);
        setMaxZ(z=>z+1);
        doodlePoints.current=[];
        setCurrentPath(null);
      } else {
        doodlePoints.current=[];
        setCurrentPath(null);
      }
      dragStart.current=null;panStart.current=null;
    };
    window.addEventListener('mousemove',onMove);
    window.addEventListener('mouseup',onUp);
    window.addEventListener('touchmove',onTouchMoveItems,{passive:false});
    window.addEventListener('touchend',onUp);
    return()=>{
      window.removeEventListener('mousemove',onMove);
      window.removeEventListener('mouseup',onUp);
      window.removeEventListener('touchmove',onTouchMoveItems);
      window.removeEventListener('touchend',onUp);
    };
  },[]);

  const onWheel=e=>{
    e.preventDefault();
    const r=rectOf();const sx=e.clientX-(r?.left||0),sy=e.clientY-(r?.top||0);
    if(e.shiftKey){
      setView(v=>({...v,x:v.x-e.deltaX,y:v.y-e.deltaY}));
    } else {
      setView(v=>{const factor=Math.exp(-e.deltaY*0.0015);const nz=Math.min(3,Math.max(0.05,v.zoom*factor));const wx=(sx-v.x)/v.zoom,wy=(sy-v.y)/v.zoom;return{zoom:nz,x:sx-wx*nz,y:sy-wy*nz};});
    }
  };
  const lastTouchDist=useRef(null);
  const onTouchMoveWall=e=>{
    if(dragStart.current)return; // Item handler owns the touch
    if(!panStart.current&&!lastTouchDist.current)return;
    e.preventDefault();
    if(e.touches.length===1&&panStart.current){
      const t=e.touches[0];
      didDrag.current=true;
      const p=panStart.current;
      setView(v=>({...v,x:p.vx+(t.clientX-p.mx),y:p.vy+(t.clientY-p.my)}));
    } else if(e.touches.length===2&&lastTouchDist.current){
      const dx=e.touches[0].clientX-e.touches[1].clientX;
      const dy=e.touches[0].clientY-e.touches[1].clientY;
      const dist=Math.hypot(dx,dy);
      const factor=dist/lastTouchDist.current;
      const midX=(e.touches[0].clientX+e.touches[1].clientX)/2;
      const midY=(e.touches[0].clientY+e.touches[1].clientY)/2;
      const r=rectOf();
      const sx=midX-(r?.left||0),sy=midY-(r?.top||0);
      setView(v=>{const nz=Math.min(3,Math.max(0.05,v.zoom*factor));const wx=(sx-v.x)/v.zoom,wy=(sy-v.y)/v.zoom;return{zoom:nz,x:sx-wx*nz,y:sy-wy*nz};});
      lastTouchDist.current=dist;
    }
  };
  const onTouchStartWall=e=>{
    // Don't start panning if tapping a button or interactive control
    const tag=e.target.tagName;
    if(tag==='BUTTON'||tag==='INPUT'||tag==='TEXTAREA'||tag==='LABEL'||tag==='A'||e.target.closest('button,input,textarea,label,a,[data-control]'))return;
    // If an item handler already claimed this touch (rotate/resize/drag), skip
    if(dragStart.current)return;
    if(doodlingRef.current&&!erasingRef.current&&e.touches.length===1){
      // Start doodle on touch
      const t=e.touches[0];
      const r=rectOf();const v=viewRef.current;
      const wx=(t.clientX-(r?.left||0)-v.x)/v.zoom;
      const wy=(t.clientY-(r?.top||0)-v.y)/v.zoom;
      doodlePoints.current=[{x:wx,y:wy}];
      setCurrentPath(`M${wx} ${wy}`);
      return;
    }
    if(e.touches.length===1){
      const t=e.touches[0];
      mousedownOnItem.current=false;
      const v=viewRef.current;
      panStart.current={mx:t.clientX,my:t.clientY,vx:v.x,vy:v.y};
      didDrag.current=false;
      lastTouchDist.current=null;
    } else if(e.touches.length===2){
      e.preventDefault();
      const dx=e.touches[0].clientX-e.touches[1].clientX;
      const dy=e.touches[0].clientY-e.touches[1].clientY;
      lastTouchDist.current=Math.hypot(dx,dy);
      panStart.current=null;
    }
  };
  const onTouchEndWall=()=>{
    panStart.current=null;
    lastTouchDist.current=null;
  };
  const zoomBy=mult=>{setView(v=>{const nz=Math.min(3,Math.max(0.05,v.zoom*mult));const cx=vp.w/2,cy=vp.h/2;const wx=(cx-v.x)/v.zoom,wy=(cy-v.y)/v.zoom;return{zoom:nz,x:cx-wx*nz,y:cy-wy*nz};});};
  const resetView=()=>setView({x:80,y:80,zoom:1});
  useEffect(()=>{
    const el=viewportRef.current;if(!el)return;
    el.addEventListener('wheel',onWheel,{passive:false});
    el.addEventListener('touchstart',onTouchStartWall,{passive:false});
    el.addEventListener('touchmove',onTouchMoveWall,{passive:false});
    el.addEventListener('touchend',onTouchEndWall);
    return()=>{
      el.removeEventListener('wheel',onWheel);
      el.removeEventListener('touchstart',onTouchStartWall);
      el.removeEventListener('touchmove',onTouchMoveWall);
      el.removeEventListener('touchend',onTouchEndWall);
    };
  },[]);

  const addSticker=emoji=>{const c=centerWorld();setItems(p=>[{id:Date.now(),type:'sticker',emoji,cx:c.x+(Math.random()-0.5)*140,cy:c.y+(Math.random()-0.5)*140,rot:(Math.random()-0.5)*30,size:50,zIndex:maxZ+1},...p]);setMaxZ(z=>z+1);setShowStickers(false);};
  const addBubble=()=>{const c=centerWorld();const id=Date.now();setItems(p=>[{id,type:'bubble',text:"",cx:c.x+(Math.random()-0.5)*80,cy:c.y+(Math.random()-0.5)*80,rot:(Math.random()-0.5)*8,color:"#ffb6c8",w:160,h:100,zIndex:maxZ+1},...p]);setMaxZ(z=>z+1);setEditing(true);setSelected(id);setEditingText(id);};
  const addSpeechBubble=()=>{const c=centerWorld();const id=Date.now();setItems(p=>[{id,type:'speech',text:"",cx:c.x+(Math.random()-0.5)*80,cy:c.y+(Math.random()-0.5)*80,rot:0,color:"#ffffff",tailDir:"bottom",zIndex:maxZ+1},...p]);setMaxZ(z=>z+1);setEditing(true);setSelected(id);setEditingText(id);};
  const addAudio=async(file)=>{
    if(!file||!session?.user||uploadingAudio)return;
    if(file.size>15*1024*1024){alert('Audio must be under 15MB.');return;}
    setUploadingAudio(true);
    const ext=(file.name.split('.').pop()||'mp3').toLowerCase();
    const fileName=`${session.user.id}/audio/${Date.now()}.${ext}`;
    const{error}=await supabase.storage.from('photos').upload(fileName,file);
    if(error){console.error('Audio upload error:',error);alert('Audio upload failed: '+error.message);setUploadingAudio(false);return;}
    const{data:{publicUrl}}=supabase.storage.from('photos').getPublicUrl(fileName);
    const c=centerWorld();
    setItems(p=>[{id:Date.now(),type:'audio',url:publicUrl,cx:c.x,cy:c.y,loop:false,playing:true,range:600,rot:0,zIndex:maxZ+1},...p]);
    setMaxZ(z=>z+1);setUploadingAudio(false);
  };

  const cutOutPhoto=async(item)=>{
    if(!item.url||!session?.user||cuttingOut)return;
    setCuttingOut(true);
    try{
      // Fetch the image as blob to avoid CORS issues
      const img=new Image();
      img.crossOrigin="anonymous";
      img.src=item.url;
      await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=reject;});
      const canvas=document.createElement('canvas');
      canvas.width=img.naturalWidth;
      canvas.height=img.naturalHeight;
      canvas.getContext('2d').drawImage(img,0,0);
      const blob=await new Promise(r=>canvas.toBlob(r,'image/png'));
      const resultBlob=await removeBackground(blob,{output:{format:'image/png'}});
      // Upload the cutout
      const fileName=`${session.user.id}/cutouts/${Date.now()}.png`;
      const{error}=await supabase.storage.from('photos').upload(fileName,resultBlob,{contentType:'image/png'});
      if(error){console.error('Cutout upload error:',error);setCuttingOut(false);return;}
      const{data:{publicUrl}}=supabase.storage.from('photos').getPublicUrl(fileName);
      const resultImg=new Image();
      const objectUrl=URL.createObjectURL(resultBlob);
      resultImg.onload=()=>{
        URL.revokeObjectURL(objectUrl);
        const maxDim=200;const ratio=resultImg.width/resultImg.height;
        const w=Math.max(100,ratio>=1?maxDim:maxDim*ratio);
        const h=Math.max(100,ratio>=1?maxDim/ratio:maxDim);
        setItems(p=>[{id:Date.now(),type:'cutout',url:publicUrl,cx:item.cx+120,cy:item.cy,rot:0,w,h,zIndex:maxZ+1},...p]);
        setMaxZ(z=>z+1);setCuttingOut(false);
      };
      resultImg.onerror=()=>{URL.revokeObjectURL(objectUrl);setCuttingOut(false);};
      resultImg.src=objectUrl;
    }catch(e){
      console.error('Cutout error:',e);
      setCuttingOut(false);
      alert('Could not remove background. Try a different photo.');
    }
  };
  const addPhoto=async(file)=>{
    if(!file)return;
    const ALLOWED_TYPES=['image/jpeg','image/png','image/gif','image/webp','image/avif'];
    const ALLOWED_EXTS=['jpg','jpeg','png','gif','webp','avif'];
    const fileExt=(file.name.split('.').pop()||'').toLowerCase();
    if(!ALLOWED_TYPES.includes(file.type)||!ALLOWED_EXTS.includes(fileExt)){
      alert('Only image files (JPEG, PNG, GIF, WebP, AVIF) are allowed.');
      return;
    }
    if(file.size>10*1024*1024){alert('File must be under 10MB.');return;}
    setUploading(true);
    const fileName=`${session.user.id}/${Date.now()}.${fileExt}`;
    const{error}=await supabase.storage.from('photos').upload(fileName,file);
    if(error){console.error('Upload error:',error);setUploading(false);return;}
    const{data:{publicUrl}}=supabase.storage.from('photos').getPublicUrl(fileName);
    const c=centerWorld();
    // Use the local file blob for dimension detection — avoids a CDN round-trip
    // and ensures we're inspecting the actual uploaded file.
    const objectUrl=URL.createObjectURL(file);
    const img=new Image();
    img.onload=()=>{
      URL.revokeObjectURL(objectUrl);
      const maxDim=200;const ratio=img.width/img.height;
      const w=ratio>=1?maxDim:maxDim*ratio;const h=ratio>=1?maxDim/ratio:maxDim;
      setItems(p=>[{id:Date.now(),type:photoModeRef.current==='frameless'?'cutout':'photo',url:publicUrl,cx:c.x+(Math.random()-0.5)*140,cy:c.y+(Math.random()-0.5)*140,rot:(Math.random()-0.5)*12,w,h,zIndex:maxZ+1},...p]);
      setMaxZ(z=>z+1);setUploading(false);
    };
    img.onerror=()=>{URL.revokeObjectURL(objectUrl);setUploading(false);};
    img.src=objectUrl;
  };

  const onViewportMouseDown=e=>{
    mousedownOnItem.current=false;
    if(e.button!==0)return;
    if(doodlingRef.current&&!erasingRef.current){const r=rectOf();const v=viewRef.current;
      const wx=(e.clientX-(r?.left||0)-v.x)/v.zoom;
      const wy=(e.clientY-(r?.top||0)-v.y)/v.zoom;
      doodlePoints.current=[{x:wx,y:wy}];
      setCurrentPath(`M${wx} ${wy}`);
      return;
    }
    const v=viewRef.current;
    panStart.current={mx:e.clientX,my:e.clientY,vx:v.x,vy:v.y};
    didDrag.current=false;
  };

  const onViewportClick=()=>{
    if(didDrag.current){didDrag.current=false;return;}
    if(mousedownOnItem.current){mousedownOnItem.current=false;return;}
    if(editing){setSelected(null);setEditingText(null);setShowStickers(false);}
  };

  const zoom=view.zoom;
  const lod=zoom>=0.55?'full':(zoom>=0.22?'mid':'low');
  const margin=300;
  const wL=(0-view.x)/zoom-margin,wT=(0-view.y)/zoom-margin;
  const wR=(vp.w-view.x)/zoom+margin,wB=(vp.h-view.y)/zoom+margin;
  const itemHalf=it=>{if(it.type==='sticker')return(it.size||44);if(it.type==='bubble')return 170;return Math.max(it.w||148,it.h||148);};
  const visible=items.filter(it=>{const h=itemHalf(it);return it.cx+h>=wL&&it.cx-h<=wR&&it.cy+h>=wT&&it.cy-h<=wB;});
  const sorted=[...visible].sort((a,b)=>(a.zIndex||1)-(b.zIndex||1));

  // Audio proximity playback
  const audioRefs=useRef({});
  useEffect(()=>{
    const audioItems=items.filter(i=>i.type==='audio'&&i.url);
    const centerX=(vp.w/2-view.x)/view.zoom;
    const centerY=(vp.h/2-view.y)/view.zoom;
    audioItems.forEach(item=>{
      const dist=Math.hypot(item.cx-centerX,item.cy-centerY);
      const range=item.range||600;
      const vol=muted?0:Math.max(0,Math.min(1,1-dist/range));
      if(!audioRefs.current[item.id]){
        const a=new Audio(item.url);
        a.loop=!!item.loop;
        a.volume=vol;
        if(vol>0)a.play().catch(()=>{});
        audioRefs.current[item.id]=a;
      } else {
        const a=audioRefs.current[item.id];
        a.loop=!!item.loop;
        a.volume=vol;
        if(vol>0&&a.paused)a.play().catch(()=>{});
        if(vol===0&&!a.paused)a.pause();
      }
    });
    Object.keys(audioRefs.current).forEach(id=>{
      if(!audioItems.find(i=>String(i.id)===id)){
        audioRefs.current[id].pause();
        delete audioRefs.current[id];
      }
    });
  },[items,view,vp,muted]);

  return(
    <div style={{display:"flex",flexDirection:"column",height:"calc(100dvh - 44px)"}}>
      <div className="wall-toolbar" style={{background:"#ffffff",borderBottom:"1px solid #e8e0d0",padding:"10px 20px",display:"flex",alignItems:"center",flexShrink:0,zIndex:90,position:"relative",boxShadow:"0 2px 8px rgba(120,80,30,0.08)"}}>
        <div className="tb-pill" style={{margin:"0 auto",display:"flex",alignItems:"center",gap:2,background:"#f5f0e8",borderRadius:30,padding:5,border:"1px solid #e0d5c0",boxShadow:"0 2px 10px rgba(120,90,40,0.10)"}}>
          <div style={{position:"relative"}}>
            <button onClick={()=>setShowPhotoMenu(s=>!s)} className="tb-btn" style={{display:"inline-flex",alignItems:"center",gap:6,padding:"7px 15px",borderRadius:24,border:"none",background:showPhotoMenu?"#ece4d4":"transparent",fontFamily:"'Nunito',sans-serif",fontSize:13,fontWeight:700,color:"#3a3327",cursor:uploading?"default":"pointer",opacity:uploading?0.55:1}} onMouseEnter={e=>{if(!showPhotoMenu)e.currentTarget.style.background="#ece4d4";}} onMouseLeave={e=>{if(!showPhotoMenu)e.currentTarget.style.background="transparent";}}>
              <span style={{fontSize:15}}>{uploading?"⏳":"📷"}</span>{uploading?"Uploading…":"Photo"}
            </button>
            {showPhotoMenu&&<div onClick={e=>e.stopPropagation()} style={{position:"absolute",top:46,left:"50%",transform:"translateX(-50%)",background:"#fffdf8",border:"1px solid #ece1cf",borderRadius:12,padding:10,zIndex:200,boxShadow:"0 12px 36px rgba(80,60,20,0.22)",width:170}}>
              <label style={{display:"flex",alignItems:"center",gap:8,width:"100%",padding:"8px 10px",border:"none",background:"transparent",borderRadius:8,fontFamily:"'Nunito',sans-serif",fontSize:12,fontWeight:700,color:"#3a3327",cursor:"pointer"}} onMouseEnter={e=>e.currentTarget.style.background="#f3ecdf"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>🖼️ Polaroid<input type="file" accept="image/*" multiple style={{display:"none"}} onChange={e=>{photoModeRef.current='polaroid';Array.from(e.target.files).forEach((f,i)=>setTimeout(()=>addPhoto(f),i*100));e.target.value='';setShowPhotoMenu(false);}} disabled={uploading}/></label>
              <label style={{display:"flex",alignItems:"center",gap:8,width:"100%",padding:"8px 10px",border:"none",background:"transparent",borderRadius:8,fontFamily:"'Nunito',sans-serif",fontSize:12,fontWeight:700,color:"#3a3327",cursor:"pointer"}} onMouseEnter={e=>e.currentTarget.style.background="#f3ecdf"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>📐 Frameless<input type="file" accept="image/*" multiple style={{display:"none"}} onChange={e=>{photoModeRef.current='frameless';Array.from(e.target.files).forEach((f,i)=>setTimeout(()=>addPhoto(f),i*100));e.target.value='';setShowPhotoMenu(false);}} disabled={uploading}/></label>
            </div>}
          </div>
          <div style={{width:1,height:20,background:"#d8cdb8"}}/>
          <div style={{position:"relative"}}>
            <button onClick={()=>setShowStickers(s=>!s)} style={{display:"inline-flex",alignItems:"center",gap:6,padding:"7px 15px",borderRadius:24,border:"none",background:showStickers?"#ece4d4":"transparent",fontFamily:"'Nunito',sans-serif",fontSize:13,fontWeight:700,color:"#3a3327",cursor:"pointer"}} onMouseEnter={e=>{if(!showStickers)e.currentTarget.style.background="#ece4d4";}} onMouseLeave={e=>{if(!showStickers)e.currentTarget.style.background="transparent";}}><span style={{fontSize:15}}>⭐</span>Sticker</button>
            {showStickers&&<div onClick={e=>e.stopPropagation()} style={{position:"absolute",top:46,left:"50%",transform:"translateX(-50%)",background:"#fffdf8",border:"1px solid #ece1cf",borderRadius:14,padding:12,zIndex:200,boxShadow:"0 12px 36px rgba(80,60,20,0.22)",width:264}}>
              <div style={{fontFamily:"'Nunito',sans-serif",fontSize:10,fontWeight:700,color:"#b9a888",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:8}}>Tap to add</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                {STICKERS.map((em,i)=><button key={i} onClick={()=>addSticker(em)} style={{background:"#f6efe2",border:"1px solid #ece1cf",borderRadius:9,padding:"5px 6px",fontSize:20,cursor:"pointer",lineHeight:1,transition:"transform 0.12s"}} onMouseEnter={e=>e.currentTarget.style.transform="scale(1.25)"} onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>{em}</button>)}
              </div>
            </div>}
          </div>
          <div style={{width:1,height:20,background:"#d8cdb8"}}/>
          <div style={{position:"relative"}}>
            <button onClick={()=>setShowNoteMenu(s=>!s)} style={{display:"inline-flex",alignItems:"center",gap:6,padding:"7px 15px",borderRadius:24,border:"none",background:showNoteMenu?"#ece4d4":"transparent",fontFamily:"'Nunito',sans-serif",fontSize:13,fontWeight:700,color:"#3a3327",cursor:"pointer"}} onMouseEnter={e=>{if(!showNoteMenu)e.currentTarget.style.background="#ece4d4";}} onMouseLeave={e=>{if(!showNoteMenu)e.currentTarget.style.background="transparent";}}><span style={{fontSize:15}}>📝</span>Note</button>
            {showNoteMenu&&<div onClick={e=>e.stopPropagation()} style={{position:"absolute",top:46,left:"50%",transform:"translateX(-50%)",background:"#fffdf8",border:"1px solid #ece1cf",borderRadius:12,padding:10,zIndex:200,boxShadow:"0 12px 36px rgba(80,60,20,0.22)",width:160}}>
              <button onClick={()=>{addBubble();setShowNoteMenu(false);}} style={{display:"flex",alignItems:"center",gap:8,width:"100%",padding:"8px 10px",border:"none",background:"transparent",borderRadius:8,fontFamily:"'Nunito',sans-serif",fontSize:12,fontWeight:700,color:"#3a3327",cursor:"pointer",textAlign:"left"}} onMouseEnter={e=>e.currentTarget.style.background="#f3ecdf"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>📋 Sticky Note</button>
              <button onClick={()=>{addSpeechBubble();setShowNoteMenu(false);}} style={{display:"flex",alignItems:"center",gap:8,width:"100%",padding:"8px 10px",border:"none",background:"transparent",borderRadius:8,fontFamily:"'Nunito',sans-serif",fontSize:12,fontWeight:700,color:"#3a3327",cursor:"pointer",textAlign:"left"}} onMouseEnter={e=>e.currentTarget.style.background="#f3ecdf"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>💬 Speech Bubble</button>
            </div>}
          </div>
          <div style={{width:1,height:20,background:"#d8cdb8"}}/>
          <button onClick={()=>{setDoodling(d=>!d);if(doodling){setCurrentPath(null);setErasing(false);}}} style={{display:"inline-flex",alignItems:"center",gap:6,padding:"7px 15px",borderRadius:24,border:"none",background:doodling?"#ece4d4":"transparent",fontFamily:"'Nunito',sans-serif",fontSize:13,fontWeight:700,color:"#3a3327",cursor:"pointer"}} onMouseEnter={e=>{if(!doodling)e.currentTarget.style.background="#ece4d4";}} onMouseLeave={e=>{if(!doodling)e.currentTarget.style.background="transparent";}}><span style={{fontSize:15}}>✏️</span>Doodle</button>
        </div>
        {doodling&&<div style={{position:"absolute",left:"50%",transform:"translateX(-50%)",top:52,display:"flex",gap:6,alignItems:"center",background:"rgba(0,0,0,0.8)",borderRadius:20,padding:"6px 12px",zIndex:200}}>
          {["#1a1a1a","#e63980","#e63946","#2a9d8f","#e9c46a","#457b9d","#ffffff"].map(c=><div key={c} onClick={()=>setDoodleColor(c)} style={{width:20,height:20,borderRadius:"50%",background:c,border:doodleColor===c?"2px solid #4a90e2":"2px solid rgba(255,255,255,0.3)",cursor:"pointer"}}/>)}
          <div style={{width:1,height:18,background:"rgba(255,255,255,0.2)",margin:"0 4px"}}/>
          {[2,4,8].map(w=><div key={w} onClick={()=>setDoodleWidth(w)} style={{width:24,height:24,borderRadius:"50%",background:doodleWidth===w?"rgba(255,255,255,0.2)":"transparent",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}><div style={{width:w*2,height:w*2,borderRadius:"50%",background:"white"}}/></div>)}
          <div style={{width:1,height:18,background:"rgba(255,255,255,0.2)",margin:"0 4px"}}/>
          <button onClick={()=>{const last=items.find(i=>i.type==='doodle');if(last)setItems(p=>p.filter(i=>i.id!==last.id));}} style={{background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.3)",borderRadius:12,padding:"3px 10px",color:"#fff",fontFamily:"'Lato',sans-serif",fontSize:10,fontWeight:700,cursor:"pointer"}}>Undo</button>
          <button onClick={()=>{clearedDoodles.current=items.filter(i=>i.type==='doodle'||i.type==='markertext');setItems(p=>p.filter(i=>i.type!=='doodle'&&i.type!=='markertext'));}} style={{background:"#e63946",border:"none",borderRadius:12,padding:"3px 10px",color:"#fff",fontFamily:"'Lato',sans-serif",fontSize:10,fontWeight:700,cursor:"pointer"}}>Clear all</button>
          <button onClick={()=>{if(clearedDoodles.current.length){setItems(p=>[...clearedDoodles.current,...p]);clearedDoodles.current=[];}}} style={{background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.3)",borderRadius:12,padding:"3px 10px",color:"#fff",fontFamily:"'Lato',sans-serif",fontSize:10,fontWeight:700,cursor:clearedDoodles.current.length?"pointer":"default",opacity:clearedDoodles.current.length?1:0.4}}>Redo</button>
          <div style={{width:1,height:18,background:"rgba(255,255,255,0.2)",margin:"0 4px"}}/>
          <button onClick={()=>setErasing(e=>!e)} style={{background:erasing?"#fff":"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.3)",borderRadius:12,padding:"3px 10px",color:erasing?"#1a1a1a":"#fff",fontFamily:"'Lato',sans-serif",fontSize:10,fontWeight:700,cursor:"pointer"}}>🧹 Eraser</button>
          <div style={{width:1,height:18,background:"rgba(255,255,255,0.2)",margin:"0 4px"}}/>
          <button onClick={()=>{const c=centerWorld();const id=Date.now();setItems(p=>[{id,type:'markertext',text:"",cx:c.x,cy:c.y,rot:0,color:doodleColorRef.current,scale:1,zIndex:maxZ+1},...p]);setMaxZ(z=>z+1);setDoodling(false);setEditing(true);setSelected(id);setEditingText(id);}} style={{background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.3)",borderRadius:12,padding:"3px 10px",color:"#fff",fontFamily:"'Permanent Marker',sans-serif",fontSize:10,fontWeight:700,cursor:"pointer"}}>Aa Text</button>
        </div>}
        <div style={{position:"absolute",right:18,top:"50%",transform:"translateY(-50%)",display:"flex",gap:10,alignItems:"center",className:"edit-btn-desktop"}}>
          {editing&&<button onClick={()=>{const hv={x:view.x,y:view.y,zoom:view.zoom};setHomeView(hv);setHomeViewSet(true);localStorage.setItem('pinwall_home_view',JSON.stringify(hv));}} style={{display:"inline-flex",alignItems:"center",gap:5,padding:"8px 14px",borderRadius:24,border:"none",cursor:"pointer",fontFamily:"'Nunito',sans-serif",fontSize:11,fontWeight:700,background:homeViewSet?"#2a9d8f":"rgba(44,38,32,0.7)",color:"#fff",boxShadow:"0 2px 8px rgba(0,0,0,0.14)"}}>{homeViewSet?"📍 Home set":"📍 Set home view"}</button>}
          {editing&&<label style={{display:"inline-flex",alignItems:"center",gap:5,padding:"8px 14px",borderRadius:24,cursor:uploadingAudio?"default":"pointer",fontFamily:"'Nunito',sans-serif",fontSize:11,fontWeight:700,background:"#2c2620",color:"#fff",boxShadow:"0 2px 8px rgba(0,0,0,0.14)",opacity:uploadingAudio?0.6:1}}>{uploadingAudio?"⏳":"🎵 Audio"}<input type="file" accept="audio/*" style={{display:"none"}} onChange={e=>{addAudio(e.target.files[0]);e.target.value='';}} disabled={uploadingAudio}/></label>}
          <button onClick={()=>{setEditing(e=>!e);setSelected(null);setEditingText(null);setShowStickers(false);}} className="tb-btn edit-wall-desktop" style={{display:"inline-flex",alignItems:"center",gap:6,padding:"8px 16px",borderRadius:24,border:"none",cursor:"pointer",fontFamily:"'Nunito',sans-serif",fontSize:12,fontWeight:700,background:editing?"#2a9d8f":"#2c2620",color:"#fff",boxShadow:"0 2px 8px rgba(0,0,0,0.14)"}}>{editing?"✓ Done":"✏️ Edit wall"}</button>
        </div>
      </div>
      <div ref={viewportRef} onMouseDown={onViewportMouseDown} onClick={onViewportClick} style={{flex:1,position:"relative",overflow:"hidden",cursor:doodling?"crosshair":(editing?"default":"grab"),touchAction:"none",background:"#c6a06a",backgroundImage:`radial-gradient(ellipse 120% 90% at 50% -5%,rgba(255,244,222,0.35) 0%,transparent 55%),radial-gradient(ellipse at 88% 108%,rgba(110,78,42,0.32) 0%,transparent 50%),url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='cork'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0.25'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23cork)' opacity='0.4'/%3E%3C/svg%3E")`,backgroundSize:"100% 100%,100% 100%,150px 150px",userSelect:"none"}}>
        <div style={{position:"absolute",inset:0,boxShadow:"inset 0 0 90px rgba(0,0,0,0.22)",pointerEvents:"none",zIndex:5}}/>
        <div style={{position:"absolute",left:0,top:0,transformOrigin:"0 0",transform:`translate(${view.x}px,${view.y}px) scale(${view.zoom})`,pointerEvents:(doodling&&!erasing)?"none":"auto"}}>
          {sorted.map(item=>{
            const isSel=editing&&selected===item.id;

            if(item.type==='audio'){
              return null; // Audio rendered separately on top
            }
            if(lod==='low'){
              const w=item.type==='sticker'?(item.size||44):(item.type==='bubble'?150*(item.scale||1):(item.w||148));
              const h=item.type==='sticker'?(item.size||44):(item.type==='bubble'?70*(item.scale||1):(item.h||148));
              const col=item.type==='photo'||item.type==='cutout'?(item.dominantColor||"#d8cdb8"):(item.type==='sticker'?"#e6c25c":(item.color||"#ffffff"));
              return(<div key={item.id} style={{position:"absolute",left:item.cx,top:item.cy,width:w,height:h,transform:`translate(-50%,-50%) rotate(${item.rot||0}deg)`,background:col,borderRadius:item.type==='sticker'?"50%":6,zIndex:item.zIndex||1,boxShadow:"0 6px 14px rgba(0,0,0,0.18)"}}/>);
            }
            if(item.type==='sticker')return(<div key={item.id} style={{position:"absolute",left:item.cx,top:item.cy,zIndex:item.zIndex||1,transform:`translate(-50%,-50%) rotate(${item.rot||0}deg)`,cursor:editing?"grab":"default",userSelect:"none"}} onMouseDown={e=>startDrag(e,item.id)} onTouchStart={e=>startDrag(e,item.id)} onClick={e=>{if(editing){e.stopPropagation();setSelected(item.id);}}}><div style={{fontSize:item.size||44,lineHeight:1,filter:"drop-shadow(1px 3px 6px rgba(0,0,0,0.22))"}}>{item.emoji}</div>{isSel&&lod==='full'&&<><div style={{position:"absolute",inset:-5,border:"1.5px dashed rgba(74,144,226,0.65)",borderRadius:6,pointerEvents:"none"}}/><div onMouseDown={e=>startRotate(e,item.id)} onTouchStart={e=>startRotate(e,item.id)} style={hdl("top")}>↻</div><div onMouseDown={e=>startResize(e,item.id)} onTouchStart={e=>startResize(e,item.id)} style={hdl("br")}/><div onMouseDown={e=>{e.stopPropagation();setItems(p=>p.filter(i=>i.id!==item.id));setSelected(null);}} style={{position:"absolute",top:-10,right:-10,width:20,height:20,borderRadius:"50%",background:"#e63946",color:"white",fontSize:12,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",zIndex:10}}>✕</div></>}</div>);
            if(item.type==='bubble'){const isEditingThis=editingText===item.id;const scale=item.scale||1;const pinColor=PIN_COLORS[(item.id||0)%PIN_COLORS.length];return(<div key={item.id} style={{position:"absolute",left:item.cx,top:item.cy,zIndex:item.zIndex||1,transform:`translate(-50%,-50%) rotate(${item.rot||0}deg) scale(${scale})`,cursor:editing&&!isEditingThis?"grab":"default",userSelect:"none"}} onMouseDown={e=>{if(!isEditingThis)startDrag(e,item.id);}} onTouchStart={e=>{if(!isEditingThis)startDrag(e,item.id);}} onClick={e=>{if(editing){e.stopPropagation();bringToFront(item.id);setSelected(item.id);}}} onDoubleClick={e=>{if(editing&&lod==='full'){e.stopPropagation();setEditingText(item.id);}}}>
              <div style={{position:"absolute",top:-10,left:"50%",transform:"translateX(-50%)",width:18,height:18,borderRadius:"50%",background:"radial-gradient(circle at 35% 35%,#f0d060,#b8941e)",boxShadow:"0 2px 6px rgba(0,0,0,0.35)",zIndex:2}}/>
              <div style={{background:item.color||"#ffb6c8",padding:"18px 20px",minWidth:140,minHeight:80,boxShadow:isSel?"0 6px 20px rgba(0,0,0,0.25),0 0 0 2px rgba(74,144,226,0.55)":"3px 5px 14px rgba(0,0,0,0.2)",position:"relative"}}>
                {isEditingThis?<textarea autoFocus defaultValue={item.text} onBlur={e=>{setItems(p=>p.map(i=>i.id===item.id?{...i,text:e.target.value}:i));setEditingText(null);}} placeholder="Write here..." style={{background:"transparent",border:"none",outline:"none",fontFamily:"'Permanent Marker',cursive",fontSize:18,color:"#1a1a1a",resize:"none",width:160,minHeight:60,lineHeight:1.5,display:"block"}}/>:<div style={{fontFamily:"'Permanent Marker',cursive",fontSize:18,color:"#1a1a1a",lineHeight:1.5,whiteSpace:"pre-wrap",wordBreak:"break-word",minWidth:80,minHeight:28}}>{item.text||<span style={{color:"rgba(0,0,0,0.2)"}}>...</span>}</div>}
              </div>
              {isSel&&!isEditingThis&&lod==='full'&&<><div onMouseDown={e=>startRotate(e,item.id)} onTouchStart={e=>startRotate(e,item.id)} style={hdl("top")}>↻</div><div onMouseDown={e=>startResize(e,item.id)} onTouchStart={e=>startResize(e,item.id)} style={hdl("br")}>⤡</div><div style={{position:"absolute",top:-46,left:"50%",transform:"translateX(-50%)",display:"flex",gap:5,background:"rgba(0,0,0,0.75)",borderRadius:20,padding:"5px 8px",zIndex:20}} onClick={e=>e.stopPropagation()} onMouseDown={e=>e.stopPropagation()}>{BUBBLE_COLORS.map(c=><div key={c} onClick={()=>setItems(p=>p.map(i=>i.id===item.id?{...i,color:c}:i))} style={{width:16,height:16,borderRadius:"50%",background:c,border:item.color===c?"2px solid #4a90e2":"2px solid transparent",cursor:"pointer"}}/>)}<div onClick={()=>{setItems(p=>p.filter(i=>i.id!==item.id));setSelected(null);}} style={{width:20,height:20,borderRadius:4,background:"#e63946",color:"white",fontSize:11,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",marginLeft:2}}>✕</div></div></>}
             </div>);}
            if(item.type==='speech'){const isEditingThis=editingText===item.id;const scale=item.scale||1;const tailDir=item.tailDir||'bottom';const tailStyles={bottom:{bottom:-12,left:24,borderLeft:"10px solid transparent",borderRight:"10px solid transparent",borderTop:`12px solid ${item.color||"#fff"}`},top:{top:-12,left:24,borderLeft:"10px solid transparent",borderRight:"10px solid transparent",borderBottom:`12px solid ${item.color||"#fff"}`},left:{left:-12,top:20,borderTop:"10px solid transparent",borderBottom:"10px solid transparent",borderRight:`12px solid ${item.color||"#fff"}`},right:{right:-12,top:20,borderTop:"10px solid transparent",borderBottom:"10px solid transparent",borderLeft:`12px solid ${item.color||"#fff"}`}};return(<div key={item.id} style={{position:"absolute",left:item.cx,top:item.cy,zIndex:item.zIndex||1,transform:`translate(-50%,-50%) rotate(${item.rot||0}deg) scale(${scale})`,cursor:editing&&!isEditingThis?"grab":"default",userSelect:"none",minWidth:100,maxWidth:240}} onMouseDown={e=>{if(!isEditingThis)startDrag(e,item.id);}} onTouchStart={e=>{if(!isEditingThis)startDrag(e,item.id);}} onClick={e=>{if(editing){e.stopPropagation();bringToFront(item.id);setSelected(item.id);}}} onDoubleClick={e=>{if(editing&&lod==='full'){e.stopPropagation();setEditingText(item.id);}}}>
              <div style={{background:item.color||"#fff",borderRadius:18,padding:"12px 16px",boxShadow:isSel?"0 6px 20px rgba(0,0,0,0.25),0 0 0 2px rgba(74,144,226,0.55)":"2px 4px 14px rgba(0,0,0,0.18)",border:"none",position:"relative",minWidth:100}}>
                {isEditingThis?<textarea autoFocus defaultValue={item.text} onBlur={e=>{setItems(p=>p.map(i=>i.id===item.id?{...i,text:e.target.value}:i));setEditingText(null);}} placeholder="Type here..." style={{background:"transparent",border:"none",outline:"none",fontFamily:"'Caveat',cursive",fontSize:20,color:"#333",resize:"none",width:160,minHeight:44,lineHeight:1.4,display:"block"}}/>:<div style={{fontFamily:"'Caveat',cursive",fontSize:20,color:"#333",lineHeight:1.4,whiteSpace:"pre-wrap",wordBreak:"break-word",minWidth:60,minHeight:24}}>{item.text||<span style={{color:"#bbb"}}>...</span>}</div>}
              </div>
              <div style={{position:"absolute",width:0,height:0,...tailStyles[tailDir]}}/>
              {isSel&&!isEditingThis&&lod==='full'&&<><div onMouseDown={e=>startRotate(e,item.id)} onTouchStart={e=>startRotate(e,item.id)} style={hdl("top")}>↻</div><div onMouseDown={e=>startResize(e,item.id)} onTouchStart={e=>startResize(e,item.id)} style={hdl("br")}>⤡</div><div style={{position:"absolute",top:-46,left:"50%",transform:"translateX(-50%)",display:"flex",gap:4,background:"rgba(0,0,0,0.75)",borderRadius:20,padding:"5px 8px",zIndex:20}} onClick={e=>e.stopPropagation()} onMouseDown={e=>e.stopPropagation()}>{BUBBLE_COLORS.map(c=><div key={c} onClick={()=>setItems(p=>p.map(i=>i.id===item.id?{...i,color:c}:i))} style={{width:14,height:14,borderRadius:"50%",background:c,border:item.color===c?"2px solid #4a90e2":"2px solid transparent",cursor:"pointer"}}/>)}<div onClick={()=>{const dirs=['bottom','top','left','right'];const cur=dirs.indexOf(item.tailDir||'bottom');setItems(p=>p.map(i=>i.id===item.id?{...i,tailDir:dirs[(cur+1)%4]}:i));}} style={{width:20,height:20,borderRadius:4,background:"rgba(255,255,255,0.15)",color:"white",fontSize:11,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",marginLeft:3}} title="Flip tail">⇅</div><div onClick={()=>{setItems(p=>p.filter(i=>i.id!==item.id));setSelected(null);}} style={{width:20,height:20,borderRadius:4,background:"#e63946",color:"white",fontSize:11,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",marginLeft:2}}>✕</div></div></>}
            </div>);}
            if(item.type==='polaroid'||item.type==='photo'){const isPhoto=item.type==='photo';const pinColor=PIN_COLORS[(item.id||0)%PIN_COLORS.length];return(<div key={item.id} style={{position:"absolute",left:item.cx,top:item.cy,zIndex:item.zIndex||1,transform:`translate(-50%,-50%) rotate(${item.rot||0}deg)`,cursor:editing?"grab":"pointer",userSelect:"none"}} onMouseDown={e=>startDrag(e,item.id)} onTouchStart={e=>startDrag(e,item.id)} onClick={e=>{if(editing){e.stopPropagation();setSelected(item.id);}else if(item.type==='photo'){setViewPhoto(item);}}} onMouseEnter={e=>{if(!editing){e.currentTarget.style.transform=`translate(-50%,-50%) rotate(${(item.rot||0)*0.3}deg) scale(1.06)`;e.currentTarget.style.zIndex=99;}}} onMouseLeave={e=>{if(!editing){e.currentTarget.style.transform=`translate(-50%,-50%) rotate(${item.rot||0}deg) scale(1)`;e.currentTarget.style.zIndex=item.zIndex;}}}>
              <div style={{position:"absolute",top:-14,left:"50%",transform:"translateX(-50%)",width:22,height:22,borderRadius:"50%",background:`radial-gradient(circle at 35% 35%,${pinColor}ee,${pinColor})`,boxShadow:"0 3px 10px rgba(0,0,0,0.45),inset 0 1px 2px rgba(255,255,255,0.4)",zIndex:2}}/>
              <div style={{background:"white",padding:isPhoto?"5px 5px 30px 5px":"8px 8px 36px 8px",boxShadow:isSel?"0 14px 34px rgba(0,0,0,0.30),0 0 0 2px rgba(74,144,226,0.55)":"0 8px 20px rgba(0,0,0,0.25),0 2px 4px rgba(0,0,0,0.10)",width:item.w||148,transition:"box-shadow 0.15s"}}>
                {isPhoto?<img src={item.url} style={{width:"100%",height:item.h||148,objectFit:"cover",display:"block"}} alt=""/>:<div style={{width:"100%",height:item.h||148,background:item.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:Math.min(item.w||148,item.h||148)*0.4}}>{item.emoji}</div>}
                {lod==='full'&&<div onDoubleClick={e=>{if(editing){e.stopPropagation();setEditingCaption(item.id);}}} style={{marginTop:6,fontFamily:"'Permanent Marker',cursive",fontSize:13,color:"#1a1a1a",textAlign:"center",lineHeight:1.3,minHeight:16,cursor:editing?"text":"default"}}>
                  {editingCaption===item.id
                    ?<input autoFocus defaultValue={item.caption||""} onBlur={e=>{setItems(p=>p.map(i=>i.id===item.id?{...i,caption:e.target.value}:i));setEditingCaption(null);}} onKeyDown={e=>{if(e.key==='Enter')e.currentTarget.blur();if(e.key==='Escape')setEditingCaption(null);}} onClick={e=>e.stopPropagation()} style={{background:"transparent",border:"none",borderBottom:"1px solid #ccc",outline:"none",fontFamily:"'Permanent Marker',cursive",fontSize:13,color:"#1a1a1a",textAlign:"center",width:"100%",padding:0}}/>
                    :(item.caption||<span style={{color:"#ccc",fontSize:10,fontFamily:"'Nunito',sans-serif"}}>{editing?"double-click to write":""}</span>)
                  }
                </div>}
              </div>
              {isSel&&lod==='full'&&<><div onMouseDown={e=>startRotate(e,item.id)} onTouchStart={e=>startRotate(e,item.id)} style={hdl("top")}>↻</div><div onMouseDown={e=>startResize(e,item.id)} onTouchStart={e=>startResize(e,item.id)} style={hdl("br")}>⤡</div>{item.type==='photo'&&item.url&&<div onClick={e=>{e.stopPropagation();cutOutPhoto(item);}} style={{position:"absolute",top:-10,left:-10,height:20,borderRadius:10,background:cuttingOut?"#888":"#2a9d8f",color:"white",fontSize:10,display:"flex",alignItems:"center",justifyContent:"center",cursor:cuttingOut?"default":"pointer",zIndex:10,padding:"0 8px",fontFamily:"'Nunito',sans-serif",fontWeight:700}}>{cuttingOut?"⏳":"✂️ Cut"}</div>}<div onMouseDown={e=>{e.stopPropagation();setItems(p=>p.filter(i=>i.id!==item.id));setSelected(null);}} style={{position:"absolute",top:-10,right:-10,width:20,height:20,borderRadius:"50%",background:"#e63946",color:"white",fontSize:12,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",zIndex:10}}>✕</div></>}
            </div>);}
            if(item.type==='doodle'){return(<div key={item.id} style={{position:"absolute",left:item.cx,top:item.cy,zIndex:item.zIndex||1,transform:`translate(-50%,-50%) rotate(${item.rot||0}deg)`,cursor:erasing?"crosshair":(editing?"grab":"default"),userSelect:"none"}} onMouseDown={e=>{if(!erasing)startDrag(e,item.id);}} onTouchStart={e=>{if(!erasing)startDrag(e,item.id);}} onClick={e=>{e.stopPropagation();if(erasing){setItems(p=>p.filter(i=>i.id!==item.id));}else if(editing){setSelected(item.id);}}}>
              <svg width={item.w} height={item.h} viewBox={`0 0 ${item.w} ${item.h}`} style={{overflow:"visible",display:"block"}}>
                <path d={item.path} fill="none" stroke={item.color||"#e63946"} strokeWidth={(item.strokeWidth||3)*1.5} strokeLinecap="round" strokeLinejoin="round" opacity="0.9"/>
              </svg>
              {isSel&&lod==='full'&&<><div onMouseDown={e=>startRotate(e,item.id)} onTouchStart={e=>startRotate(e,item.id)} style={hdl("top")}>↻</div><div onMouseDown={e=>startResize(e,item.id)} onTouchStart={e=>startResize(e,item.id)} style={hdl("br")}>⤡</div><div onMouseDown={e=>{e.stopPropagation();setItems(p=>p.filter(i=>i.id!==item.id));setSelected(null);}} style={{position:"absolute",top:-10,right:-10,width:20,height:20,borderRadius:"50%",background:"#e63946",color:"white",fontSize:12,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",zIndex:10}}>✕</div></>}
            </div>);}
            if(item.type==='cutout'){return(<div key={item.id} style={{position:"absolute",left:item.cx,top:item.cy,zIndex:item.zIndex||1,transform:`translate(-50%,-50%) rotate(${item.rot||0}deg)`,cursor:editing?"grab":"default",userSelect:"none"}} onMouseDown={e=>startDrag(e,item.id)} onTouchStart={e=>startDrag(e,item.id)} onClick={e=>{if(editing){e.stopPropagation();setSelected(item.id);}}} onMouseEnter={e=>{if(!editing){e.currentTarget.style.transform=`translate(-50%,-50%) rotate(${(item.rot||0)*0.3}deg) scale(1.06)`;e.currentTarget.style.zIndex=99;}}} onMouseLeave={e=>{if(!editing){e.currentTarget.style.transform=`translate(-50%,-50%) rotate(${item.rot||0}deg) scale(1)`;e.currentTarget.style.zIndex=item.zIndex;}}}>
              <img src={item.url} style={{width:item.w||200,height:item.h||200,objectFit:"cover",display:"block",borderRadius:4,filter:"drop-shadow(2px 4px 8px rgba(0,0,0,0.3))"}} alt=""/>
              {isSel&&lod==='full'&&<><div onMouseDown={e=>startRotate(e,item.id)} onTouchStart={e=>startRotate(e,item.id)} style={hdl("top")}>↻</div><div onMouseDown={e=>startResize(e,item.id)} onTouchStart={e=>startResize(e,item.id)} style={hdl("br")}>⤡</div>{item.url&&<div onClick={e=>{e.stopPropagation();cutOutPhoto(item);}} style={{position:"absolute",top:-10,left:-10,height:20,borderRadius:10,background:cuttingOut?"#888":"#2a9d8f",color:"white",fontSize:10,display:"flex",alignItems:"center",justifyContent:"center",cursor:cuttingOut?"default":"pointer",zIndex:10,padding:"0 8px",fontFamily:"'Nunito',sans-serif",fontWeight:700}}>{cuttingOut?"⏳":"✂️ Cut"}</div>}<div onMouseDown={e=>{e.stopPropagation();setItems(p=>p.filter(i=>i.id!==item.id));setSelected(null);}} style={{position:"absolute",top:-10,right:-10,width:20,height:20,borderRadius:"50%",background:"#e63946",color:"white",fontSize:12,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",zIndex:10}}>✕</div></>}
            </div>);}
            if(item.type==='markertext'){const isEditingThis=editingText===item.id;const scale=item.scale||1;return(<div key={item.id} style={{position:"absolute",left:item.cx,top:item.cy,zIndex:item.zIndex||1,transform:`translate(-50%,-50%) rotate(${item.rot||0}deg) scale(${scale})`,cursor:editing&&!isEditingThis?"grab":"default",userSelect:"none"}} onMouseDown={e=>{if(!isEditingThis)startDrag(e,item.id);}} onTouchStart={e=>{if(!isEditingThis)startDrag(e,item.id);}} onClick={e=>{if(editing){e.stopPropagation();bringToFront(item.id);setSelected(item.id);}}} onDoubleClick={e=>{if(editing&&lod==='full'){e.stopPropagation();setEditingText(item.id);}}}>
              {isEditingThis
                ?<input autoFocus defaultValue={item.text} onBlur={e=>{setItems(p=>p.map(i=>i.id===item.id?{...i,text:e.target.value}:i));setEditingText(null);}} onKeyDown={e=>{if(e.key==='Enter')e.currentTarget.blur();if(e.key==='Escape')setEditingText(null);}} onClick={e=>e.stopPropagation()} style={{background:"transparent",border:"none",borderBottom:`2px solid ${item.color||"#1a1a1a"}`,outline:"none",fontFamily:"'Permanent Marker',cursive",fontSize:24,color:item.color||"#1a1a1a",textAlign:"center",minWidth:100,padding:"2px 4px"}}/>
                :<div style={{fontFamily:"'Permanent Marker',cursive",fontSize:24,color:item.color||"#1a1a1a",whiteSpace:"nowrap",textShadow:"1px 1px 0 rgba(0,0,0,0.05)"}}>{item.text||<span style={{opacity:0.3}}>type here</span>}</div>
              }
              {isSel&&!isEditingThis&&lod==='full'&&<><div onMouseDown={e=>startRotate(e,item.id)} onTouchStart={e=>startRotate(e,item.id)} style={hdl("top")}>↻</div><div onMouseDown={e=>startResize(e,item.id)} onTouchStart={e=>startResize(e,item.id)} style={hdl("br")}>⤡</div><div style={{position:"absolute",top:-42,left:"50%",transform:"translateX(-50%)",display:"flex",gap:4,background:"rgba(0,0,0,0.75)",borderRadius:16,padding:"4px 8px",zIndex:20}} onClick={e=>e.stopPropagation()} onMouseDown={e=>e.stopPropagation()}>{["#1a1a1a","#e63980","#e63946","#2a9d8f","#e9c46a","#457b9d","#ffffff"].map(c=><div key={c} onClick={()=>setItems(p=>p.map(i=>i.id===item.id?{...i,color:c}:i))} style={{width:14,height:14,borderRadius:"50%",background:c,border:item.color===c?"2px solid #4a90e2":"2px solid rgba(255,255,255,0.3)",cursor:"pointer"}}/>)}<div onClick={()=>{setItems(p=>p.filter(i=>i.id!==item.id));setSelected(null);}} style={{width:16,height:16,borderRadius:4,background:"#e63946",color:"white",fontSize:9,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",marginLeft:3}}>✕</div></div></>}
            </div>);}
            return null;
          })}
        </div>
        {editing&&<div style={{position:"absolute",left:0,top:0,transformOrigin:"0 0",transform:`translate(${view.x}px,${view.y}px) scale(${view.zoom})`,zIndex:9,pointerEvents:"auto"}}>
          {items.filter(i=>i.type==='audio').map(item=>{
            const isSel=editing&&selected===item.id;
            const range=item.range||600;
            return(<div key={item.id} style={{position:"absolute",left:item.cx,top:item.cy,transform:"translate(-50%,-50%)",cursor:"grab",userSelect:"none"}} onMouseDown={e=>startDrag(e,item.id)} onTouchStart={e=>startDrag(e,item.id)} onClick={e=>{e.stopPropagation();setSelected(item.id);}}>
              {isSel&&<div style={{position:"absolute",left:"50%",top:"50%",transform:"translate(-50%,-50%)",width:range*2,height:range*2,borderRadius:"50%",border:"2px dashed rgba(233,196,106,0.5)",background:"radial-gradient(circle,rgba(233,196,106,0.08) 0%,transparent 70%)",pointerEvents:"none"}}/>}
              {isSel&&<div onMouseDown={e=>{e.stopPropagation();e.preventDefault();const startX=e.clientX;const startRange=range;const onMove=ev=>{const dx=ev.clientX-startX;setItems(p=>p.map(i=>i.id===item.id?{...i,range:Math.max(100,startRange+dx)}:i));};const onUp=()=>{window.removeEventListener('mousemove',onMove);window.removeEventListener('mouseup',onUp);};window.addEventListener('mousemove',onMove);window.addEventListener('mouseup',onUp);}} onTouchStart={e=>{e.stopPropagation();const startX=e.touches[0].clientX;const startRange=range;const onMove=ev=>{const dx=ev.touches[0].clientX-startX;setItems(p=>p.map(i=>i.id===item.id?{...i,range:Math.max(100,startRange+dx)}:i));};const onUp=()=>{window.removeEventListener('touchmove',onMove);window.removeEventListener('touchend',onUp);};window.addEventListener('touchmove',onMove);window.addEventListener('touchend',onUp);}} style={{position:"absolute",left:"50%",top:"50%",transform:`translate(${range}px,-50%)`,width:20,height:20,borderRadius:"50%",background:"#e9c46a",border:"2px solid white",boxShadow:"0 2px 6px rgba(0,0,0,0.4)",cursor:"ew-resize",zIndex:15}}/>}
              <div style={{width:96,height:60,borderRadius:8,background:"linear-gradient(160deg,#3a3327,#1f1b14)",boxShadow:isSel?"0 6px 18px rgba(0,0,0,0.4),0 0 0 2px rgba(74,144,226,0.6)":"0 5px 14px rgba(0,0,0,0.35)",position:"relative"}}>
                <div style={{position:"absolute",top:7,left:9,right:9,height:18,borderRadius:4,background:"#d9c7a3",display:"flex",alignItems:"center",justifyContent:"space-around"}}><div style={{width:9,height:9,borderRadius:"50%",background:"#1f1b14"}}/><div style={{width:9,height:9,borderRadius:"50%",background:"#1f1b14"}}/></div>
                <div style={{position:"absolute",bottom:5,left:0,right:0,textAlign:"center",fontSize:9,color:"#e9c46a",fontFamily:"'Nunito',sans-serif",fontWeight:700,letterSpacing:"0.04em"}}>{item.loop?"↻ LOOP":"▶ ONCE"}</div>
              </div>
              {isSel&&<div style={{position:"absolute",top:-44,left:"50%",transform:"translateX(-50%)",display:"flex",gap:5,background:"rgba(0,0,0,0.8)",borderRadius:18,padding:"5px 8px",zIndex:20}} onClick={e=>e.stopPropagation()} onMouseDown={e=>e.stopPropagation()}>
                <button onClick={()=>setItems(p=>p.map(i=>i.id===item.id?{...i,loop:!i.loop}:i))} style={{background:"rgba(255,255,255,0.12)",border:"none",borderRadius:12,padding:"3px 10px",color:"#fff",fontFamily:"'Nunito',sans-serif",fontSize:10,fontWeight:700,cursor:"pointer"}}>{item.loop?"↻ Loop":"▶ Once"}</button>
                <button onClick={()=>{setItems(p=>p.filter(i=>i.id!==item.id));setSelected(null);}} style={{background:"#e63946",border:"none",borderRadius:12,padding:"3px 9px",color:"#fff",fontFamily:"'Nunito',sans-serif",fontSize:10,fontWeight:700,cursor:"pointer"}}>✕</button>
              </div>}
            </div>);
          })}
        </div>}
        {currentPath&&<svg style={{position:"absolute",left:0,top:0,width:"100%",height:"100%",pointerEvents:"none",zIndex:8,overflow:"visible",transform:`translate(${view.x}px,${view.y}px) scale(${view.zoom})`,transformOrigin:"0 0"}}>
          <path d={currentPath} fill="none" stroke={doodleColor} strokeWidth={doodleWidth*1.5/view.zoom} strokeLinecap="round" strokeLinejoin="round" opacity="0.9"/>
        </svg>}
        <button className="edit-wall-mobile" onClick={()=>{setEditing(e=>!e);setSelected(null);setEditingText(null);setShowStickers(false);}} style={{position:"absolute",top:12,right:12,zIndex:60,display:"none",alignItems:"center",gap:6,padding:"8px 14px",borderRadius:24,border:"none",cursor:"pointer",fontFamily:"'Nunito',sans-serif",fontSize:11,fontWeight:700,background:editing?"#2a9d8f":"rgba(44,38,32,0.85)",color:"#fff",boxShadow:"0 2px 8px rgba(0,0,0,0.3)"}}>{editing?"✓ Done":"✏️ Edit"}</button>
        <div className="wall-hint" style={{position:"absolute",left:16,bottom:14,zIndex:60,fontFamily:"'Nunito',sans-serif",fontSize:11,fontWeight:700,letterSpacing:"0.04em",color:"rgba(255,255,255,0.55)",pointerEvents:"none"}}>{doodling?"Draw on the board":"drag to pan · scroll to zoom · Shift + scroll to pan"}</div>
        <div className="zoom-controls" style={{position:"absolute",right:16,bottom:16,zIndex:60,display:"flex",alignItems:"center",gap:6}}>
          <button onClick={()=>zoomBy(1/1.25)} style={{width:32,height:32,borderRadius:9,border:"none",background:"rgba(44,38,32,0.85)",color:"#fff",fontSize:18,cursor:"pointer",lineHeight:1}}>−</button>
          <div style={{minWidth:52,textAlign:"center",background:"rgba(44,38,32,0.85)",color:"#fff",borderRadius:9,padding:"7px 8px",fontFamily:"'Nunito',sans-serif",fontSize:12,fontWeight:700}}>{Math.round(zoom*100)}%</div>
          <button onClick={()=>zoomBy(1.25)} style={{width:32,height:32,borderRadius:9,border:"none",background:"rgba(44,38,32,0.85)",color:"#fff",fontSize:18,cursor:"pointer",lineHeight:1}}>+</button>
          <button onClick={resetView} style={{height:32,borderRadius:9,border:"none",background:"rgba(44,38,32,0.85)",color:"#fff",fontSize:11,fontWeight:700,fontFamily:"'Nunito',sans-serif",cursor:"pointer",padding:"0 12px"}}>Reset</button>
        </div>
      </div>
     {viewPhoto&&<div onClick={()=>setViewPhoto(null)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.92)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",cursor:"zoom-out"}}>
  <img src={viewPhoto.url} style={{maxWidth:"90vw",maxHeight:"90vh",objectFit:"contain",boxShadow:"0 8px 60px rgba(0,0,0,0.6)"}} onClick={e=>e.stopPropagation()}/>
  <div onClick={()=>setViewPhoto(null)} style={{position:"absolute",top:20,right:28,color:"white",fontSize:32,cursor:"pointer"}}>✕</div>
</div>}
    </div>
  );
}

function Bookshelf({onOpenAlbum,shelves,onAddAlbum,onDeleteAlbum,onRenameAlbum,onSetCover,onAddShelf,session}){
  const [hoveredId,setHoveredId]=useState(null);
  const [renamingId,setRenamingId]=useState(null);
  const [uploadingCoverId,setUploadingCoverId]=useState(null);
  const newAlbum=()=>({id:Math.floor(Math.random()*2000000000),name:"New Album",emoji:"📷",height:190,photos:[],comments:[]});

  const handleCoverUpload=async(albumId,file)=>{
    if(!file||!session?.user)return;
    const ALLOWED=['image/jpeg','image/png','image/webp','image/gif','image/avif'];
    if(!ALLOWED.includes(file.type)){alert('Images only');return;}
    if(file.size>10*1024*1024){alert('Max 10MB');return;}
    setUploadingCoverId(albumId);
    const ext=(file.name.split('.').pop()||'jpg').toLowerCase();
    const path=`${session.user.id}/covers/${albumId}_${Date.now()}.${ext}`;
    const{error}=await supabase.storage.from('photos').upload(path,file);
    if(error){console.error('Cover upload error:',error);setUploadingCoverId(null);return;}
    const{data:{publicUrl}}=supabase.storage.from('photos').getPublicUrl(path);
    onSetCover(albumId,publicUrl);
    console.log('[Cover] set cover for album',albumId,'url:',publicUrl);
    setUploadingCoverId(null);
  };
  return(
    <div style={{position:"relative",overflow:"auto",minHeight:"calc(100dvh - 58px)",padding:"40px 40px 70px",background:"#f3ebda",backgroundImage:"radial-gradient(ellipse 90% 60% at 50% -10%,rgba(255,250,238,0.7) 0%,transparent 60%),radial-gradient(ellipse at 50% 120%,rgba(120,90,50,0.10) 0%,transparent 55%)"}}>
      <div style={{position:"absolute",right:26,bottom:70,fontSize:60,pointerEvents:"none",opacity:0.85,filter:"drop-shadow(0 8px 10px rgba(0,0,0,0.12))"}}>🪴</div>
      <div style={{position:"absolute",right:120,top:74,fontSize:20,transform:"rotate(12deg)",pointerEvents:"none",opacity:0.55}}>✨</div>
      <div style={{position:"absolute",left:"42%",top:26,fontSize:16,transform:"rotate(-10deg)",pointerEvents:"none",opacity:0.45}}>💛</div>
      <div style={{position:"relative",zIndex:2,marginBottom:34}}>
        <div style={{fontFamily:"'Caveat',cursive",fontSize:44,fontWeight:700,color:"#473a2a",lineHeight:0.9}}>My Library <span style={{color:"#e88a96"}}>♥</span></div>
        <div style={{fontFamily:"'Nunito',sans-serif",fontSize:12,color:"#a99878",letterSpacing:"0.12em",textTransform:"uppercase",marginTop:4}}>Click any book to open it</div>
      </div>
      {shelves.map((shelf)=>(
        <div key={shelf.id} style={{marginBottom:46,position:"relative",zIndex:2}}>
          <div style={{display:"flex",alignItems:"flex-end",flexWrap:"wrap",gap:24,paddingLeft:18,paddingBottom:6,minHeight:184}}>
            {shelf.albums.map((album)=>{
              const theme=BOOK_THEMES[(album.id-1)%BOOK_THEMES.length];
              const rnd=seededRandom(album.id*313);
              const tilt=(rnd()-0.5)*2.2;
              const cover=album.photos&&album.photos[0];
              return(
                <div key={album.id} style={{position:"relative"}} onMouseEnter={()=>setHoveredId(album.id)} onMouseLeave={()=>setHoveredId(null)}>
                  {/* Hover controls */}
                  {hoveredId===album.id&&!renamingId&&<div style={{position:"absolute",top:-32,left:"50%",transform:"translateX(-50%)",display:"flex",gap:4,zIndex:20,whiteSpace:"nowrap"}} onClick={e=>e.stopPropagation()}>
                    <button onClick={e=>{e.stopPropagation();setRenamingId(album.id);}} style={{background:"#4a90e2",color:"white",border:"none",borderRadius:12,padding:"3px 9px",fontFamily:"'Nunito',sans-serif",fontSize:10,fontWeight:700,cursor:"pointer"}}>✏ Rename</button>
                    <label style={{background:"#2a9d8f",color:"white",border:"none",borderRadius:12,padding:"3px 9px",fontFamily:"'Nunito',sans-serif",fontSize:10,fontWeight:700,cursor:uploadingCoverId===album.id?"default":"pointer",opacity:uploadingCoverId===album.id?0.6:1}}>
                      {uploadingCoverId===album.id?"⏳":"🖼 Cover"}
                      <input type="file" accept="image/*" style={{display:"none"}} onChange={e=>handleCoverUpload(album.id,e.target.files[0])} disabled={uploadingCoverId===album.id}/>
                    </label>
                    <button onClick={e=>{e.stopPropagation();onDeleteAlbum(album.id);}} style={{background:"#e63946",color:"white",border:"none",borderRadius:12,padding:"3px 9px",fontFamily:"'Nunito',sans-serif",fontSize:10,fontWeight:700,cursor:"pointer"}}>✕</button>
                  </div>}
                  {/* Inline rename input */}
                  {renamingId===album.id&&<div onClick={e=>e.stopPropagation()} style={{position:"absolute",top:-40,left:"50%",transform:"translateX(-50%)",background:"#2c2620",borderRadius:8,padding:"6px 10px",zIndex:20,boxShadow:"0 4px 16px rgba(0,0,0,0.5)",whiteSpace:"nowrap",display:"flex",gap:6,alignItems:"center"}}>
                    <input autoFocus defaultValue={album.name} onBlur={e=>{onRenameAlbum(album.id,e.target.value||album.name);setRenamingId(null);}} onKeyDown={e=>{if(e.key==='Enter')e.currentTarget.blur();if(e.key==='Escape')setRenamingId(null);}} style={{background:"transparent",border:"none",borderBottom:"1px solid #c8a96e",outline:"none",color:"white",fontFamily:"'Caveat',cursive",fontSize:16,width:140,display:"block"}}/>
                    <span onClick={()=>setRenamingId(null)} style={{color:"#888",cursor:"pointer",fontSize:12}}>✕</span>
                  </div>}
                  <div onClick={()=>onOpenAlbum(album)} style={{width:128,height:172,borderRadius:"5px 11px 11px 5px",cursor:"pointer",position:"relative",overflow:"hidden",background:`linear-gradient(150deg,${theme.c1},${theme.c2})`,boxShadow:`0 13px 22px rgba(110,75,25,0.28),inset 8px 0 11px ${theme.shadow},inset -2px 0 3px rgba(255,255,255,0.4)`,transform:`rotate(${tilt}deg)`,transformOrigin:"bottom center",transition:"transform 0.22s,box-shadow 0.22s",userSelect:"none"}}
                    onMouseEnter={e=>{e.currentTarget.style.transform=`rotate(${tilt}deg) translateY(-12px)`;e.currentTarget.style.boxShadow=`0 24px 38px rgba(110,75,25,0.40),inset 8px 0 11px ${theme.shadow},inset -2px 0 3px rgba(255,255,255,0.4)`;}}
                    onMouseLeave={e=>{e.currentTarget.style.transform=`rotate(${tilt}deg)`;e.currentTarget.style.boxShadow=`0 13px 22px rgba(110,75,25,0.28),inset 8px 0 11px ${theme.shadow},inset -2px 0 3px rgba(255,255,255,0.4)`;}}>
                    <div style={{position:"absolute",left:8,top:0,bottom:0,width:2,background:"rgba(255,255,255,0.3)"}}/><div style={{position:"absolute",top:13,left:9,right:8,textAlign:"center",fontFamily:"'Caveat',cursive",fontSize:17,fontWeight:700,color:theme.text,lineHeight:0.98,maxHeight:40,overflow:"hidden"}}>{album.name}</div>
                    <div style={{position:"absolute",bottom:14,left:"50%",transform:"translateX(-50%) rotate(-4deg)",background:"#fff",padding:"5px 5px 11px",boxShadow:"0 4px 9px rgba(0,0,0,0.22)",width:80}}>
                      {album.coverUrl
                        ?<img src={album.coverUrl} style={{width:"100%",height:54,objectFit:"cover",display:"block"}} alt="cover"/>
                        :<div style={{height:54,background:cover?cover.color:"#f3ead9",display:"flex",alignItems:"center",justifyContent:"center",fontSize:28}}>{cover?cover.emoji:album.emoji}</div>
                      }
                    </div>
                    
                  </div>
                </div>
              );
            })}
            <div onClick={()=>onAddAlbum(shelf.id,newAlbum())} style={{width:128,height:172,border:"2px dashed rgba(150,120,80,0.4)",borderRadius:9,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:4,cursor:"pointer",color:"#a08a64",fontFamily:"'Nunito',sans-serif",fontSize:11,fontWeight:700,letterSpacing:"0.05em",textTransform:"uppercase",textAlign:"center"}} onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(150,120,80,0.7)";e.currentTarget.style.color="#7a6442";}} onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(150,120,80,0.4)";e.currentTarget.style.color="#a08a64";}}><span style={{fontSize:30,lineHeight:1}}>+</span>Add New Book</div>
          </div>
          <div style={{height:18,borderRadius:"3px 3px 5px 5px",backgroundColor:"#b07f44",backgroundImage:"repeating-linear-gradient(90deg,rgba(255,255,255,0.05) 0px,rgba(255,255,255,0.05) 2px,transparent 2px,transparent 24px),linear-gradient(to bottom,#cf9c5e 0%,#b07f44 55%,#8c5f30 100%)",boxShadow:"0 14px 22px rgba(90,55,18,0.34)"}}><div style={{height:3,background:"rgba(255,246,228,0.4)"}}/></div>
          <div style={{height:16,background:"linear-gradient(to bottom,rgba(80,55,25,0.35),transparent)"}}/>
        </div>
      ))}
      <div onClick={onAddShelf} style={{marginTop:6,marginLeft:18,display:"inline-flex",alignItems:"center",gap:8,fontFamily:"'Nunito',sans-serif",fontSize:11,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:"#a08a64",cursor:"pointer",position:"relative",zIndex:2}} onMouseEnter={e=>e.currentTarget.style.color="#7a6442"} onMouseLeave={e=>e.currentTarget.style.color="#a08a64"}><span style={{fontSize:20,lineHeight:1}}>+</span> New Shelf</div>
    </div>
  );
}

function PhotoBook({album,onClose,session}){
  const [stickersByPage,setStickersByPage]=useState({});
  const [page,setPage]=useState(0);
  const [pendingPage,setPendingPage]=useState(1);
  const [flipping,setFlipping]=useState(false);
  const [flipDir,setFlipDir]=useState("forward");
  const [positions,setPositions]=useState(()=>initBookPositions(album.photos));
  const [maxZ,setMaxZ]=useState(album.photos.length+1);
  const [selectedId,setSelectedId]=useState(null);
  const [selectedType,setSelectedType]=useState(null);
  const [filmLifted,setFilmLifted]=useState(false);
  const [showStickers,setShowStickers]=useState(false);
  const [comments,setComments]=useState(album.comments);
  const [newComment,setNewComment]=useState("");
  const [newAuthor,setNewAuthor]=useState("");
  const [viewPhoto,setViewPhoto]=useState(null);
  const [uploadingBook,setUploadingBook]=useState(false);
  const dragStart=useRef(null);
  const didBookDrag=useRef(false);
  const pageRef=useRef(null);
  const touchStartX=useRef(null);
  const pageStateRef=useRef(page);
  useEffect(()=>{pageStateRef.current=page;},[page]);

  // Pages grow dynamically as photos are added
  const maxStickerPage=Object.keys(stickersByPage).reduce((max,k)=>{
    const items=stickersByPage[k];
    return items&&items.length>0?Math.max(max,Number(k)):max;
  },-1);
  const pagesFromPhotos=Math.ceil(album.photos.length/4);
  const pagesFromStickers=maxStickerPage+1;
  const contentPages=Math.max(1,pagesFromPhotos,pagesFromStickers)+1; // +1 always leaves a blank page to add to
  const totalPages=contentPages+1; // +1 for guest book

  const hasLoaded=useRef(false);
  useEffect(()=>{
    if(!session?.user)return;
    supabase.from('album_states').select('data').eq('user_id',session.user.id).eq('album_id',album.id).maybeSingle().then(({data,error})=>{
      if(error)console.error('[PhotoBook] load error:',error);
      if(data?.data?.positions)setPositions(p=>({...p,...data.data.positions}));
      if(data?.data?.stickersByPage)setStickersByPage(data.data.stickersByPage);
      hasLoaded.current=true;
    });
  },[]);
  const saveBookData=async(p,s)=>{
    if(!session?.user)return;
    const{error}=await supabase.from('album_states').upsert({user_id:session.user.id,album_id:album.id,data:{positions:p,stickersByPage:s}},{onConflict:'user_id,album_id'});
    if(error)console.error('[PhotoBook] save error:',error);
  };
  useEffect(()=>{
    if(!hasLoaded.current)return;
    saveBookData(positions,stickersByPage);
  },[positions,stickersByPage]);
  const isBackPage=p=>p===totalPages-1;
  const goNext=()=>{if(flipping||page>=totalPages-1)return;const n=page+1;setPendingPage(n);setFlipDir("forward");setFlipping(true);setTimeout(()=>{setPage(n);setFlipping(false);},700);};
  const goPrev=()=>{if(flipping||page===0)return;const p=page-1;setPendingPage(p);setFlipDir("backward");setFlipping(true);setTimeout(()=>{setPage(p);setFlipping(false);},700);};
  const onTouchStart=e=>{touchStartX.current=e.touches[0].clientX;};
  const onTouchEnd=e=>{if(touchStartX.current===null)return;const dx=e.changedTouches[0].clientX-touchStartX.current;if(dx<-50)goNext();else if(dx>50)goPrev();touchStartX.current=null;};
  const bringToFront=(id,type)=>{const z=maxZ+1;setMaxZ(z);if(type==='photo')setPositions(p=>({...p,[id]:{...p[id],zIndex:z}}));else setStickersByPage(prev=>({...prev,[pageStateRef.current]:(prev[pageStateRef.current]||[]).map(s=>s.id===id?{...s,zIndex:z}:s)}));return z;};
  const startMove=(e,id,type)=>{if(!filmLifted)return;e.stopPropagation();bringToFront(id,type);setSelectedId(id);setSelectedType(type);const pos=type==='photo'?positions[id]:(stickersByPage[pageStateRef.current]||[]).find(s=>s.id===id);dragStart.current={mode:'move',id,type,page:pageStateRef.current,mouseX:e.clientX,mouseY:e.clientY,cx:pos.cx,cy:pos.cy};};
  const startRotate=(e,id,type)=>{e.preventDefault();e.stopPropagation();const pos=type==='photo'?positions[id]:(stickersByPage[pageStateRef.current]||[]).find(s=>s.id===id);const c=pageRef.current?.getBoundingClientRect();if(!c)return;dragStart.current={mode:'rotate',id,type,page:pageStateRef.current,startAngle:Math.atan2(e.clientY-(c.top+pos.cy),e.clientX-(c.left+pos.cx))*(180/Math.PI),startRot:pos.rot,canvasCx:pos.cx,canvasCy:pos.cy};};
  const startResize=(e,id,type)=>{e.preventDefault();e.stopPropagation();const pos=type==='photo'?positions[id]:(stickersByPage[pageStateRef.current]||[]).find(s=>s.id===id);const isPhotoItem=type==='sticker'&&!!pos.url;dragStart.current={mode:'resize',id,type,page:pageStateRef.current,mouseX:e.clientX,mouseY:e.clientY,startW:pos.w||pos.size||60,startH:pos.h||pos.size||60,rotRad:(pos.rot||0)*Math.PI/180,isPhotoItem};};
  useEffect(()=>{
    const onMove=e=>{const d=dragStart.current;if(!d)return;didBookDrag.current=true;const dx=e.clientX-d.mouseX,dy=e.clientY-d.mouseY;
      if(d.mode==='move'){if(d.type==='photo')setPositions(p=>({...p,[d.id]:{...p[d.id],cx:d.cx+dx,cy:d.cy+dy}}));else setStickersByPage(prev=>({...prev,[d.page]:(prev[d.page]||[]).map(s=>s.id===d.id?{...s,cx:d.cx+dx,cy:d.cy+dy}:s)}));}
      else if(d.mode==='rotate'){const c=pageRef.current?.getBoundingClientRect();if(!c)return;const angle=Math.atan2(e.clientY-(c.top+d.canvasCy),e.clientX-(c.left+d.canvasCx))*(180/Math.PI);const r=d.startRot+(angle-d.startAngle);if(d.type==='photo')setPositions(p=>({...p,[d.id]:{...p[d.id],rot:r}}));else setStickersByPage(prev=>({...prev,[d.page]:(prev[d.page]||[]).map(s=>s.id===d.id?{...s,rot:r}:s)}));}
      else if(d.mode==='resize'){const cos=Math.cos(d.rotRad),sin=Math.sin(d.rotRad);const lx=cos*dx+sin*dy,ly=-sin*dx+cos*dy;if(d.type==='sticker'){if(d.isPhotoItem)setStickersByPage(prev=>({...prev,[d.page]:(prev[d.page]||[]).map(s=>s.id===d.id?{...s,w:Math.max(40,d.startW+lx*2),h:Math.max(30,d.startH+ly*2)}:s)}));else setStickersByPage(prev=>({...prev,[d.page]:(prev[d.page]||[]).map(s=>s.id===d.id?{...s,size:Math.max(28,d.startW+Math.max(lx,ly)*2)}:s)}));}else setPositions(p=>({...p,[d.id]:{...p[d.id],w:Math.max(60,d.startW+lx*2),h:Math.max(50,d.startH+ly*2)}}));}
    };
    const onUp=()=>{dragStart.current=null;};
    window.addEventListener('mousemove',onMove);window.addEventListener('mouseup',onUp);
    return()=>{window.removeEventListener('mousemove',onMove);window.removeEventListener('mouseup',onUp);};
  },[]);
  const addSticker=emoji=>{const rnd=seededRandom(Date.now()%9999);setStickersByPage(prev=>({...prev,[page]:[...(prev[page]||[]),{id:Date.now(),emoji,cx:180+rnd()*280,cy:100+rnd()*240,size:50,rot:(rnd()-0.5)*28,zIndex:maxZ+1}]}));setMaxZ(z=>z+1);};
  const addPhotoToBook=async(file)=>{
    if(!file||!session?.user)return;
    const ALLOWED_TYPES=['image/jpeg','image/png','image/gif','image/webp','image/avif'];
    const ALLOWED_EXTS=['jpg','jpeg','png','gif','webp','avif'];
    const ext=(file.name.split('.').pop()||'').toLowerCase();
    if(!ALLOWED_TYPES.includes(file.type)||!ALLOWED_EXTS.includes(ext)){
      alert('Only image files (JPEG, PNG, GIF, WebP, AVIF) are allowed.');
      return;
    }
    if(file.size>10*1024*1024){alert('File must be under 10MB.');return;}
    setUploadingBook(true);
    const name=`${session.user.id}/${Date.now()}.${ext}`;
    const{error}=await supabase.storage.from('photos').upload(name,file);
    if(error){setUploadingBook(false);return;}
    const{data:{publicUrl}}=supabase.storage.from('photos').getPublicUrl(name);
    const objectUrl=URL.createObjectURL(file);
    const img=new Image();
    img.onload=()=>{
      URL.revokeObjectURL(objectUrl);
      // Consistent size for all photos
      const photoW=180;const photoH=140;
      // Grid layout: 3 columns, evenly spaced
      const existing=(stickersByPage[page]||[]).filter(s=>s.url);
      const count=existing.length;
      const cols=3;
      const col=count%cols;
      const row=Math.floor(count/cols);
      const startX=120;const startY=100;const gapX=200;const gapY=180;
      const cx=startX+col*gapX;
      const cy=startY+row*gapY;
      setStickersByPage(prev=>({...prev,[page]:[...(prev[page]||[]),{id:Date.now(),url:publicUrl,cx,cy,w:photoW,h:photoH,rot:0,zIndex:maxZ+1}]}));
      setMaxZ(z=>z+1);setUploadingBook(false);
    };
    img.onerror=()=>{URL.revokeObjectURL(objectUrl);setUploadingBook(false);};
    img.src=objectUrl;
  };
  const submitComment=()=>{if(!newComment.trim()||!newAuthor.trim())return;setComments(c=>[...c,{id:Date.now(),author:newAuthor,text:newComment,date:new Date().toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"})}]);setNewComment("");setNewAuthor("");};
  const renderPage=pageNum=>{
    if(isBackPage(pageNum))return(
      <div style={{height:"100%",overflowY:"auto",padding:"28px 36px",background:"linear-gradient(160deg,#fdfaf4 0%,#f5eedf 100%)"}}>
        <div style={{fontFamily:"'Caveat',cursive",fontSize:32,color:"#2c2c2c",borderBottom:"2px solid #c8a96e",paddingBottom:10,marginBottom:24}}>📖 Guest Book</div>
        {comments.length===0&&<div style={{fontFamily:"'Caveat',cursive",fontSize:18,color:"#bbb",textAlign:"center",marginTop:40}}>Be the first to write in the guest book...</div>}
        {comments.map(c=>(
          <div key={c.id} style={{marginBottom:24,paddingBottom:20,borderBottom:"1px dashed #ddd"}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
              <span style={{fontFamily:"'Caveat',cursive",fontSize:20,fontWeight:700}}>{c.author}</span>
              <span style={{fontFamily:"'Nunito',sans-serif",fontSize:11,color:"#bbb"}}>{c.date}</span>
            </div>
            <div style={{fontFamily:"'Caveat',cursive",fontSize:18,color:"#555"}}>{c.text}</div>
          </div>
        ))}
        <div style={{background:"rgba(200,169,110,0.08)",border:"1px dashed #c8a96e",borderRadius:4,padding:"18px 20px",marginTop:12}}>
          <input value={newAuthor} onChange={e=>setNewAuthor(e.target.value)} placeholder="Your name" style={{border:"none",borderBottom:"1.5px solid #bbb",background:"transparent",fontFamily:"'Caveat',cursive",fontSize:18,color:"#333",outline:"none",width:"100%",padding:"4px 0",marginBottom:12}}/>
          <textarea value={newComment} onChange={e=>setNewComment(e.target.value)} placeholder="Leave a message..." style={{border:"none",borderBottom:"1.5px solid #bbb",background:"transparent",fontFamily:"'Caveat',cursive",fontSize:18,color:"#333",outline:"none",width:"100%",padding:"4px 0",resize:"none",height:60,display:"block"}}/>
          <button onClick={submitComment} style={{marginTop:12,background:"#2c2c2c",color:"#f5f0e8",border:"none",borderRadius:20,padding:"8px 22px",fontFamily:"'Nunito',sans-serif",fontSize:12,fontWeight:700,cursor:"pointer"}}>Sign it ✍️</button>
        </div>
      </div>
    );
    const pagePhotos=album.photos.slice(pageNum*4,pageNum*4+4);
    const isCurrentPage=pageNum===page;
    const stickers=stickersByPage[pageNum]||[];
    const allItems=[...pagePhotos.filter(p=>!positions[p.id]?.hidden).map(p=>({...p,itemType:'photo',zIdx:positions[p.id]?.zIndex||1})),...stickers.map(s=>({...s,itemType:'sticker',zIdx:s.zIndex||1}))].sort((a,b)=>a.zIdx-b.zIdx);
    return(
      <div ref={isCurrentPage?pageRef:null} style={{width:"100%",height:"100%",position:"relative",background:"linear-gradient(160deg,#fdfaf4 0%,#f5eedf 100%)",display:"flex",flexDirection:"column"}} onClick={()=>{if(filmLifted&&isCurrentPage){if(didBookDrag.current){didBookDrag.current=false;return;}setSelectedId(null);setSelectedType(null);}}}>
        {isCurrentPage&&!filmLifted&&<div style={{position:"absolute",inset:0,zIndex:30,background:"linear-gradient(135deg,rgba(255,255,255,0.22) 0%,rgba(200,185,160,0.1) 50%,rgba(255,255,255,0.08) 100%)",pointerEvents:"none"}}/>}
        <div style={{flex:1,position:"relative",overflow:"hidden"}}>
          {allItems.map(item=>{
            if(item.itemType==='sticker'){
              const s=item;
              const isSel=isCurrentPage&&filmLifted&&selectedId===s.id;
              return(
                <div key={`s-${s.id}`} style={{position:"absolute",left:s.cx,top:s.cy,zIndex:s.zIndex||1,transform:`translate(-50%,-50%) rotate(${s.rot||0}deg)`,cursor:filmLifted&&isCurrentPage?"grab":"pointer"}} onMouseDown={e=>{if(filmLifted&&isCurrentPage){e.stopPropagation();bringToFront(s.id,'sticker');setSelectedId(s.id);setSelectedType('sticker');startMove(e,s.id,'sticker');}}} onClick={e=>{e.stopPropagation();if(s.url&&!didBookDrag.current)setViewPhoto(s);}}>
                  {s.url?<img src={s.url} style={{width:s.w||100,height:s.h||80,objectFit:"cover",display:"block"}} alt=""/>:<div style={{fontSize:s.size||48,lineHeight:1}}>{s.emoji}</div>}
                  {isSel&&<><div style={{position:"absolute",inset:-4,border:"1.5px dashed rgba(80,120,255,0.5)",borderRadius:4,pointerEvents:"none"}}/><div onMouseDown={e=>startRotate(e,s.id,'sticker')} style={hdl("top")}>↻</div><div onMouseDown={e=>startResize(e,s.id,'sticker')} style={hdl("br")}/><div onMouseDown={e=>{e.stopPropagation();setStickersByPage(prev=>({...prev,[pageStateRef.current]:(prev[pageStateRef.current]||[]).filter(x=>x.id!==s.id)}));setSelectedId(null);}} style={{position:"absolute",top:-10,right:-10,width:20,height:20,borderRadius:"50%",background:"#e63946",color:"white",fontSize:12,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",zIndex:12}}>✕</div></>}
                </div>
              );
            }
            const photo=item;
            const pos=positions[photo.id];
            if(!pos)return null;
            const isSel=isCurrentPage&&filmLifted&&selectedId===photo.id;
            return(
              <div key={`p-${photo.id}`} style={{position:"absolute",left:pos.cx,top:pos.cy,width:pos.w,height:pos.h,transform:`translate(-50%,-50%) rotate(${pos.rot}deg)`,zIndex:pos.zIndex,background:"white",padding:"7px",boxShadow:"2px 5px 18px rgba(0,0,0,0.22)",cursor:"pointer"}} onMouseDown={e=>{e.stopPropagation();if(filmLifted&&isCurrentPage)startMove(e,photo.id,'photo');}} onClick={e=>{e.stopPropagation();if(didBookDrag.current)return;if(filmLifted){bringToFront(photo.id,'photo');setSelectedId(photo.id);setSelectedType('photo');}setViewPhoto(photo);}}>
                <div style={{width:"100%",height:"100%",background:photo.color,display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{fontSize:Math.min(pos.w,pos.h)*0.4}}>{photo.emoji}</div></div>
                {isSel&&<><div onMouseDown={e=>startRotate(e,photo.id,'photo')} style={hdl("top")}>↻</div><div onMouseDown={e=>startResize(e,photo.id,'photo')} style={hdl("br")}>⤡</div><div onMouseDown={e=>{e.stopPropagation();setPositions(p=>({...p,[photo.id]:{...p[photo.id],hidden:true}}));setSelectedId(null);}} style={{position:"absolute",top:-10,right:-10,width:20,height:20,borderRadius:"50%",background:"#e63946",color:"white",fontSize:12,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",zIndex:12}}>✕</div></>}
              </div>
            );
          })}
        </div>
        {showStickers&&isCurrentPage&&filmLifted&&<div style={{background:"#2c2c2c",borderTop:"2px solid #c8a96e",padding:"10px 16px",flexShrink:0}}><div style={{display:"flex",flexWrap:"wrap",gap:5}}>{STICKERS.slice(0,20).map((em,i)=><button key={i} onClick={()=>addSticker(em)} style={{background:"rgba(255,255,255,0.06)",border:"none",borderRadius:7,padding:"5px",fontSize:20,cursor:"pointer"}}>{em}</button>)}</div></div>}
      </div>
    );
  };
  const flipOrigin=flipDir==="forward"?"left center":"right center";
  const frontT=flipping?(flipDir==="forward"?"rotateY(-180deg)":"rotateY(180deg)"):"rotateY(0deg)";
  const backT=flipping?"rotateY(0deg)":(flipDir==="forward"?"rotateY(180deg)":"rotateY(-180deg)");
  return(
    <div style={{position:"fixed",inset:0,zIndex:200,background:"#faf7f2",display:"flex",flexDirection:"column",top:58}}>
      <style>{`@keyframes peelIn{from{opacity:0;transform:perspective(800px) rotateX(6deg) translateY(16px) scale(0.97);}to{opacity:1;transform:none;}}.bnav{background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.12);cursor:pointer;border-radius:50%;width:40px;height:40px;display:flex;align-items:center;justify-content:center;font-size:16px;color:#f5f0e8;}.bnav:hover:not(:disabled){background:rgba(255,255,255,0.16);}.bnav:disabled{opacity:0.2;cursor:default;}`}</style>
      <div style={{background:"#faf7f2",width:"100%",flex:1,display:"flex",flexDirection:"column",overflow:"hidden",animation:"peelIn 0.4s ease"}}>
        <div style={{background:"#2c2c2c",color:"#f5f0e8",padding:"10px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"3px solid #c8a96e",flexShrink:0}}>
          <div>
            <div style={{fontFamily:"'Caveat',cursive",fontSize:24}}>{album.name}</div>
            <div style={{fontFamily:"'Nunito',sans-serif",fontSize:10,color:"#999",letterSpacing:"0.1em",textTransform:"uppercase"}}>{isBackPage(page)?"Guest Book":`Page ${page+1} of ${totalPages-1}`}</div>
          </div>
          <div style={{display:"flex",gap:8}}>
            {!isBackPage(page)&&<>
              <button onClick={()=>{setFilmLifted(f=>!f);if(filmLifted)setShowStickers(false);}} style={{background:filmLifted?"#c8a96e":"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.2)",color:filmLifted?"#1a1a1a":"#f5f0e8",borderRadius:20,padding:"4px 12px",fontFamily:"'Nunito',sans-serif",fontSize:10,fontWeight:700,cursor:"pointer"}}>{filmLifted?"📌 Film on":"🖐 Lift film"}</button>
              <label style={{background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.2)",color:"#f5f0e8",borderRadius:20,padding:"4px 12px",fontFamily:"'Nunito',sans-serif",fontSize:10,fontWeight:700,cursor:uploadingBook?"default":"pointer",opacity:uploadingBook?0.6:1,display:"inline-flex",alignItems:"center"}}>{uploadingBook?"⏳":"📷 Add photo"}<input type="file" accept="image/*" style={{display:"none"}} multiple onChange={e=>{Array.from(e.target.files).forEach((f,i)=>setTimeout(()=>addPhotoToBook(f),i*100));e.target.value='';}} disabled={uploadingBook}/></label>{filmLifted&&<button onClick={()=>setShowStickers(s=>!s)} style={{background:showStickers?"#e9c46a":"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.2)",color:showStickers?"#1a1a1a":"#f5f0e8",borderRadius:20,padding:"4px 12px",fontFamily:"'Nunito',sans-serif",fontSize:10,fontWeight:700,cursor:"pointer"}}>⭐</button>}
            </>}
            <button onClick={()=>{saveBookData(positions,stickersByPage);onClose();}} style={{background:"none",border:"1px solid rgba(255,255,255,0.2)",color:"#aaa",borderRadius:"50%",width:30,height:30,cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
          </div>
        </div>
        <div style={{flex:1,position:"relative",overflow:"hidden",perspective:"1400px"}} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
          <div style={{position:"absolute",inset:0,transformOrigin:flipOrigin,transform:frontT,transition:flipping?"transform 0.7s cubic-bezier(0.4,0,0.2,1)":"none",backfaceVisibility:"hidden",WebkitBackfaceVisibility:"hidden"}}>{renderPage(page)}</div>
          <div style={{position:"absolute",inset:0,transformOrigin:flipOrigin,transform:backT,transition:flipping?"transform 0.7s cubic-bezier(0.4,0,0.2,1)":"none",backfaceVisibility:"hidden",WebkitBackfaceVisibility:"hidden"}}>{renderPage(pendingPage)}</div>
          {flipping&&<div style={{position:"absolute",inset:0,zIndex:10,pointerEvents:"none",background:flipDir==="forward"?"linear-gradient(to right,rgba(0,0,0,0.18) 0%,transparent 30%)":"linear-gradient(to left,rgba(0,0,0,0.18) 0%,transparent 30%)"}}/>}
        </div>
        <div style={{background:"#2c2c2c",padding:"9px 18px",display:"flex",alignItems:"center",justifyContent:"space-between",borderTop:"3px solid #c8a96e"}}>
          <button className="bnav" disabled={page===0||flipping} onClick={goPrev}>◀</button>
          <div style={{display:"flex",gap:8}}>{[...Array(totalPages)].map((_,i)=><div key={i} onClick={()=>{if(!flipping){setPendingPage(i);setFlipDir(i>page?"forward":"backward");setFlipping(true);setTimeout(()=>{setPage(i);setFlipping(false);},700);}}} style={{width:i===page?20:8,height:8,borderRadius:4,background:i===totalPages-1?(i===page?"#c8a96e":"#555"):(i===page?"#f5f0e8":"#555"),cursor:"pointer",transition:"all 0.2s"}}/>)}</div>
          <button className="bnav" disabled={page===totalPages-1||flipping} onClick={goNext}>▶</button>
        </div>
      </div>
      {viewPhoto&&<div onClick={()=>setViewPhoto(null)} style={{position:"fixed",inset:0,zIndex:300,background:"rgba(0,0,0,0.96)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"zoom-out"}}>
        {viewPhoto.url
          ?<img src={viewPhoto.url} style={{maxWidth:"100vw",maxHeight:"100vh",objectFit:"contain",display:"block"}} alt={viewPhoto.caption||""}/>
          :<div style={{background:"white",padding:"8px 8px 32px 8px",maxWidth:"min(80vh,560px)",width:"90%",transform:"rotate(-1deg)",boxShadow:"0 30px 80px rgba(0,0,0,0.6)"}}>
            <div style={{background:viewPhoto.color,aspectRatio:"1",display:"flex",alignItems:"center",justifyContent:"center",fontSize:120}}>{viewPhoto.emoji}</div>
            {viewPhoto.caption&&<div style={{marginTop:10,fontFamily:"'Caveat',cursive",fontSize:20,color:"#555",textAlign:"center"}}>{viewPhoto.caption}</div>}
          </div>
        }
        <div onClick={()=>setViewPhoto(null)} style={{position:"absolute",top:20,right:28,color:"white",fontSize:32,cursor:"pointer",lineHeight:1,opacity:0.7}}>✕</div>
        {viewPhoto.caption&&viewPhoto.url&&<div style={{position:"absolute",bottom:24,left:"50%",transform:"translateX(-50%)",fontFamily:"'Caveat',cursive",fontSize:20,color:"rgba(255,255,255,0.75)"}}>{viewPhoto.caption}</div>}
      </div>}
    </div>
  );
}

function SharedWallView({items:initialItems,label}){
  const [items,setItems]=useState(initialItems||[]);
  const [loading,setLoading]=useState(false);
  const [view,setView]=useState({x:80,y:80,zoom:1});
  const [vp,setVp]=useState({w:1200,h:700});
  const [viewPhoto,setViewPhoto]=useState(null);
  const viewportRef=useRef(null);
  const panStart=useRef(null);
  const didDrag=useRef(false);
  const viewRef=useRef(view);
  useEffect(()=>{viewRef.current=view;},[view]);

  useEffect(()=>{
    const measure=()=>{const el=viewportRef.current;if(el)setVp({w:el.clientWidth,h:el.clientHeight});};
    measure();
    window.addEventListener('resize',measure);
    return()=>window.removeEventListener('resize',measure);
  },[]);

  useEffect(()=>{
    if(initialItems?.length)setItems(initialItems);
  },[initialItems]);

  const rectOf=()=>viewportRef.current?.getBoundingClientRect();
  const onViewportMouseDown=e=>{
    if(e.button!==0)return;
    const v=viewRef.current;
    panStart.current={mx:e.clientX,my:e.clientY,vx:v.x,vy:v.y};
    didDrag.current=false;
  };
  useEffect(()=>{
    const onMove=e=>{if(!panStart.current)return;didDrag.current=true;const p=panStart.current;setView(v=>({...v,x:p.vx+(e.clientX-p.mx),y:p.vy+(e.clientY-p.my)}));};
    const onUp=()=>{panStart.current=null;};
    window.addEventListener('mousemove',onMove);window.addEventListener('mouseup',onUp);
    return()=>{window.removeEventListener('mousemove',onMove);window.removeEventListener('mouseup',onUp);};
  },[]);
  const onWheel=e=>{
    e.preventDefault();
    const r=rectOf();const sx=e.clientX-(r?.left||0),sy=e.clientY-(r?.top||0);
    if(e.shiftKey){setView(v=>({...v,x:v.x-e.deltaX,y:v.y-e.deltaY}));}
    else{setView(v=>{const factor=Math.exp(-e.deltaY*0.0015);const nz=Math.min(3,Math.max(0.05,v.zoom*factor));const wx=(sx-v.x)/v.zoom,wy=(sy-v.y)/v.zoom;return{zoom:nz,x:sx-wx*nz,y:sy-wy*nz};});}
  };
  useEffect(()=>{
    const el=viewportRef.current;if(!el)return;
    el.addEventListener('wheel',onWheel,{passive:false});
    return()=>el.removeEventListener('wheel',onWheel);
  },[]);
  const zoomBy=mult=>{setView(v=>{const nz=Math.min(3,Math.max(0.05,v.zoom*mult));const cx=vp.w/2,cy=vp.h/2;const wx=(cx-v.x)/v.zoom,wy=(cy-v.y)/v.zoom;return{zoom:nz,x:cx-wx*nz,y:cy-wy*nz};});};
  const resetView=()=>setView({x:80,y:80,zoom:1});

  const zoom=view.zoom;
  const margin=300;
  const wL=(0-view.x)/zoom-margin,wT=(0-view.y)/zoom-margin,wR=(vp.w-view.x)/zoom+margin,wB=(vp.h-view.y)/zoom+margin;
  const itemHalf=it=>{if(it.type==='sticker')return(it.size||44);if(it.type==='bubble')return 170;return Math.max(it.w||148,it.h||148);};
  const visible=items.filter(it=>{const h=itemHalf(it);return it.cx+h>=wL&&it.cx-h<=wR&&it.cy+h>=wT&&it.cy-h<=wB;});
  const sorted=[...visible].sort((a,b)=>(a.zIndex||1)-(b.zIndex||1));

  return(
    <div style={{display:"flex",flexDirection:"column",height:"100vh",fontFamily:"'Nunito',sans-serif"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;500;600;700&family=Nunito:wght@400;600;700;800;900&display=swap');*{box-sizing:border-box;margin:0;padding:0;}`}</style>
      <div style={{background:"#ffffff",borderBottom:"1px solid #e8e2d8",padding:"0 24px",display:"flex",alignItems:"center",justifyContent:"space-between",height:58,flexShrink:0,boxShadow:"0 1px 6px rgba(0,0,0,0.06)"}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:26,lineHeight:1}}>📌</span>
          <span style={{fontFamily:"'Nunito',sans-serif",fontWeight:900,fontSize:26,letterSpacing:"-0.02em",color:"#1a1a1a"}}>Pinwall</span>
        </div>
        <div style={{fontFamily:"'Nunito',sans-serif",fontSize:13,color:"#888",display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:16}}>👀</span> You're viewing <strong style={{color:"#2a2118"}}>{label}</strong> — read only
        </div>
        <a href="/" style={{background:"#1a1a1a",color:"#fff",borderRadius:20,padding:"6px 14px",fontFamily:"'Nunito',sans-serif",fontSize:11,fontWeight:700,textDecoration:"none"}}>{"Create your own →"}</a>
      </div>
      <div ref={viewportRef} onMouseDown={onViewportMouseDown} onClick={()=>{if(didDrag.current){didDrag.current=false;}}} style={{flex:1,position:"relative",overflow:"hidden",cursor:"grab",background:"#c6a06a",backgroundImage:`radial-gradient(ellipse 120% 90% at 50% -5%,rgba(255,244,222,0.35) 0%,transparent 55%),radial-gradient(ellipse at 88% 108%,rgba(110,78,42,0.32) 0%,transparent 50%),url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='cork'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0.25'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23cork)' opacity='0.4'/%3E%3C/svg%3E")`,backgroundSize:"100% 100%,100% 100%,150px 150px",userSelect:"none"}}>
        <div style={{position:"absolute",inset:0,boxShadow:"inset 0 0 90px rgba(0,0,0,0.22)",pointerEvents:"none",zIndex:5}}/>
        {loading&&<div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",zIndex:10}}><div style={{background:"rgba(255,255,255,0.9)",borderRadius:12,padding:"20px 32px",fontFamily:"'Nunito',sans-serif",fontSize:14,color:"#666"}}>Loading wall...</div></div>}
        <div style={{position:"absolute",left:0,top:0,transformOrigin:"0 0",transform:`translate(${view.x}px,${view.y}px) scale(${view.zoom})`}}>
          {sorted.map(item=>{
            const pinColor=PIN_COLORS[(item.id||0)%PIN_COLORS.length];
            if(item.type==='sticker')return(
              <div key={item.id} style={{position:"absolute",left:item.cx,top:item.cy,zIndex:item.zIndex||1,transform:`translate(-50%,-50%) rotate(${item.rot||0}deg)`,userSelect:"none",pointerEvents:"none"}}>
                <div style={{fontSize:item.size||44,lineHeight:1,filter:"drop-shadow(1px 3px 6px rgba(0,0,0,0.22))"}}>{item.emoji}</div>
              </div>
            );
            if(item.type==='bubble')return(
              <div key={item.id} style={{position:"absolute",left:item.cx,top:item.cy,zIndex:item.zIndex||1,transform:`translate(-50%,-50%) rotate(${item.rot||0}deg) scale(${item.scale||1})`,userSelect:"none",pointerEvents:"none"}}>
                <div style={{position:"absolute",top:-10,left:"50%",transform:"translateX(-50%)",width:18,height:18,borderRadius:"50%",background:"radial-gradient(circle at 35% 35%,#f0d060,#b8941e)",boxShadow:"0 2px 6px rgba(0,0,0,0.35)",zIndex:2}}/>
                <div style={{background:item.color||"#ffb6c8",padding:"18px 20px",minWidth:140,minHeight:80,boxShadow:"3px 5px 14px rgba(0,0,0,0.2)",position:"relative"}}>
                  <div style={{fontFamily:"'Permanent Marker',cursive",fontSize:18,color:"#1a1a1a",lineHeight:1.5,whiteSpace:"pre-wrap",wordBreak:"break-word"}}>{item.text||""}</div>
                </div>
              </div>
            );
            if(item.type==='polaroid'||item.type==='photo')return(
              <div key={item.id} style={{position:"absolute",left:item.cx,top:item.cy,zIndex:item.zIndex||1,transform:`translate(-50%,-50%) rotate(${item.rot||0}deg)`,cursor:item.type==='photo'?"pointer":"default",userSelect:"none"}}
                onClick={()=>{if(!didDrag.current&&item.type==='photo')setViewPhoto(item);}}
                onMouseEnter={e=>{if(item.type==='photo'){e.currentTarget.style.transform=`translate(-50%,-50%) rotate(${(item.rot||0)*0.3}deg) scale(1.06)`;e.currentTarget.style.zIndex=99;}}}
                onMouseLeave={e=>{if(item.type==='photo'){e.currentTarget.style.transform=`translate(-50%,-50%) rotate(${item.rot||0}deg) scale(1)`;e.currentTarget.style.zIndex=item.zIndex;}}}>
                <div style={{position:"absolute",top:-14,left:"50%",transform:"translateX(-50%)",width:22,height:22,borderRadius:"50%",background:`radial-gradient(circle at 35% 35%,${pinColor}ee,${pinColor})`,boxShadow:"0 3px 10px rgba(0,0,0,0.45),inset 0 1px 2px rgba(255,255,255,0.4)",zIndex:2}}/>
                <div style={{background:"white",padding:item.type==='photo'?"5px 5px 30px 5px":"8px 8px 36px 8px",boxShadow:"0 8px 20px rgba(0,0,0,0.25)",width:item.w||148}}>
                  {item.type==='photo'?<img src={item.url} style={{width:"100%",height:item.h||148,objectFit:"cover",display:"block"}} alt=""/>:<div style={{width:"100%",height:item.h||148,background:item.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:Math.min(item.w||148,item.h||148)*0.4}}>{item.emoji}</div>}
                  {zoom>=0.55&&<div style={{marginTop:6,fontFamily:"'Permanent Marker',cursive",fontSize:13,color:"#1a1a1a",textAlign:"center",lineHeight:1.2}}>{item.caption||""}</div>}
                </div>
              </div>
            );
            if(item.type==='doodle')return(
              <div key={item.id} style={{position:"absolute",left:item.cx,top:item.cy,zIndex:item.zIndex||1,transform:`translate(-50%,-50%) rotate(${item.rot||0}deg)`,pointerEvents:"none"}}>
                <svg width={item.w} height={item.h} viewBox={`0 0 ${item.w} ${item.h}`} style={{overflow:"visible",display:"block"}}>
                  <path d={item.path} fill="none" stroke={item.color||"#1a1a1a"} strokeWidth={(item.strokeWidth||3)*1.5} strokeLinecap="round" strokeLinejoin="round" opacity="0.9"/>
                </svg>
              </div>
            );
            if(item.type==='speech')return(
              <div key={item.id} style={{position:"absolute",left:item.cx,top:item.cy,zIndex:item.zIndex||1,transform:`translate(-50%,-50%) rotate(${item.rot||0}deg) scale(${item.scale||1})`,pointerEvents:"none",minWidth:100,maxWidth:240}}>
                <div style={{background:item.color||"#fff",borderRadius:18,padding:"12px 16px",boxShadow:"2px 4px 14px rgba(0,0,0,0.18)",position:"relative",minWidth:100}}>
                  <div style={{fontFamily:"'Caveat',cursive",fontSize:20,color:"#333",lineHeight:1.4,whiteSpace:"pre-wrap",wordBreak:"break-word"}}>{item.text||""}</div>
                </div>
                <div style={{position:"absolute",width:0,height:0,...{bottom:{bottom:-12,left:24,borderLeft:"10px solid transparent",borderRight:"10px solid transparent",borderTop:`12px solid ${item.color||"#fff"}`},top:{top:-12,left:24,borderLeft:"10px solid transparent",borderRight:"10px solid transparent",borderBottom:`12px solid ${item.color||"#fff"}`}}[item.tailDir||'bottom']||{}}}/>
              </div>
            );
            if(item.type==='cutout')return(
              <div key={item.id} style={{position:"absolute",left:item.cx,top:item.cy,zIndex:item.zIndex||1,transform:`translate(-50%,-50%) rotate(${item.rot||0}deg)`,pointerEvents:"none"}}>
                <img src={item.url} style={{width:item.w||200,height:item.h||200,objectFit:"cover",display:"block",borderRadius:4,filter:"drop-shadow(2px 4px 8px rgba(0,0,0,0.3))"}} alt=""/>
              </div>
            );
            if(item.type==='markertext')return(
              <div key={item.id} style={{position:"absolute",left:item.cx,top:item.cy,zIndex:item.zIndex||1,transform:`translate(-50%,-50%) rotate(${item.rot||0}deg) scale(${item.scale||1})`,pointerEvents:"none"}}>
                <div style={{fontFamily:"'Permanent Marker',cursive",fontSize:24,color:item.color||"#1a1a1a",whiteSpace:"nowrap"}}>{item.text||""}</div>
              </div>
            );
            return null;
          })}
        </div>
        <div style={{position:"absolute",left:16,bottom:14,zIndex:60,fontFamily:"'Nunito',sans-serif",fontSize:11,fontWeight:700,letterSpacing:"0.04em",color:"rgba(255,255,255,0.55)",pointerEvents:"none"}}>drag to pan · scroll to zoom</div>
        <div style={{position:"absolute",right:16,bottom:16,zIndex:60,display:"flex",alignItems:"center",gap:6}}>
          <button onClick={()=>zoomBy(1/1.25)} style={{width:32,height:32,borderRadius:9,border:"none",background:"rgba(44,38,32,0.85)",color:"#fff",fontSize:18,cursor:"pointer",lineHeight:1}}>−</button>
          <div style={{minWidth:52,textAlign:"center",background:"rgba(44,38,32,0.85)",color:"#fff",borderRadius:9,padding:"7px 8px",fontFamily:"'Nunito',sans-serif",fontSize:12,fontWeight:700}}>{Math.round(zoom*100)}%</div>
          <button onClick={()=>zoomBy(1.25)} style={{width:32,height:32,borderRadius:9,border:"none",background:"rgba(44,38,32,0.85)",color:"#fff",fontSize:18,cursor:"pointer",lineHeight:1}}>+</button>
          <button onClick={resetView} style={{height:32,borderRadius:9,border:"none",background:"rgba(44,38,32,0.85)",color:"#fff",fontSize:11,fontWeight:700,fontFamily:"'Nunito',sans-serif",cursor:"pointer",padding:"0 12px"}}>Reset</button>
        </div>
      </div>
      {viewPhoto&&<div onClick={()=>setViewPhoto(null)} style={{position:"fixed",inset:0,zIndex:300,background:"rgba(0,0,0,0.96)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"zoom-out"}}>
        <img src={viewPhoto.url} style={{maxWidth:"100vw",maxHeight:"100vh",objectFit:"contain",display:"block"}} alt={viewPhoto.caption||""}/>
        <div onClick={()=>setViewPhoto(null)} style={{position:"absolute",top:20,right:28,color:"white",fontSize:32,cursor:"pointer",lineHeight:1,opacity:0.7}}>✕</div>
        {viewPhoto.caption&&<div style={{position:"absolute",bottom:24,left:"50%",transform:"translateX(-50%)",fontFamily:"'Caveat',cursive",fontSize:20,color:"rgba(255,255,255,0.75)"}}>{viewPhoto.caption}</div>}
      </div>}
    </div>
  );
}

export default function Pinwall(){
  const [view,setView]=useState("wall");
  const [openAlbum,setOpenAlbum]=useState(null);
  const [session,setSession]=useState(null);
  const [shelves,setShelves]=useState([{id:1,albums:[]}]);
  const [shareToken,setShareToken]=useState(null);
  const [shareCopied,setShareCopied]=useState(false);
  const [muted,setMuted]=useState(false);
  const [sharedView,setSharedView]=useState(null);
  const [friends,setFriends]=useState([]);
  const [viewingFriend,setViewingFriend]=useState(null);
  const [username,setUsername]=useState(null);
  const [needsUsername,setNeedsUsername]=useState(false);
  const [usernameInput,setUsernameInput]=useState("");
  const [usernameError,setUsernameError]=useState("");
  const [searchQuery,setSearchQuery]=useState("");
  const [searchResults,setSearchResults]=useState([]);
  const [searching,setSearching]=useState(false);
  const shelfLoaded=useRef(false);
  const shelfSaveTimeout=useRef(null);

  // Check if we're loading a shared wall from URL
  useEffect(()=>{
    const params=new URLSearchParams(window.location.search);
    const token=params.get('share');
    if(!token)return;
    supabase.rpc('get_shared_wall',{token_id:token}).then(({data,error})=>{
      if(error||!data){console.error('Invalid share token',error);return;}
      setSharedView({ownerId:data.owner_id,label:data.label||'Pinwall',items:data.items,token});
    });
  },[]);

  useEffect(()=>{
    supabase.auth.getSession().then(({data:{session}})=>setSession(session));
    const{data:{subscription}}=supabase.auth.onAuthStateChange((_,session)=>setSession(session));
    return()=>subscription.unsubscribe();
  },[]);

  useEffect(()=>{
    if(!session?.user)return;
    // Load or create share token for this user
    supabase.from('share_tokens').select('id').eq('owner_id',session.user.id).maybeSingle().then(async({data})=>{
      if(data?.id){setShareToken(data.id);return;}
      const{data:created}=await supabase.from('share_tokens').insert({owner_id:session.user.id,label:'My Pinwall'}).select('id').single();
      if(created?.id)setShareToken(created.id);
    });
    // Load friends
    supabase.from('friends').select('id,friend_token,nickname,added_at').eq('user_id',session.user.id).then(({data})=>{
      if(data)setFriends(data);
    });
    // Load profile (username)
    supabase.from('profiles').select('username').eq('id',session.user.id).maybeSingle().then(({data})=>{
      if(data?.username){setUsername(data.username);setNeedsUsername(false);}
      else setNeedsUsername(true);
    });
  },[session]);

  useEffect(()=>{
    if(!session?.user)return;
    supabase.from('shelves').select('albums').eq('user_id',session.user.id).maybeSingle().then(({data,error})=>{
      if(error)console.error('[Shelf load] error:',error);
      if(data?.albums?.length){
        const loaded=data.albums;
        setShelves(loaded[0]?.albums ? loaded : [{id:1,albums:loaded}]);
      }
      shelfLoaded.current=true;
    });
  },[session]);

  useEffect(()=>{
    if(!session?.user||!shelfLoaded.current)return;
    clearTimeout(shelfSaveTimeout.current);
    shelfSaveTimeout.current=setTimeout(async()=>{
      const{error}=await supabase.from('shelves').upsert({user_id:session.user.id,albums:shelves},{onConflict:'user_id'});
      if(error)console.error('[Shelf save] error:',error);
    },1500);
    return()=>clearTimeout(shelfSaveTimeout.current);
  },[shelves,session]);

  const addFriend=async(token,nickname)=>{
    if(!session?.user||!token)return;
    const{data,error}=await supabase.from('friends').insert({user_id:session.user.id,friend_token:token,nickname:nickname||'Friend'}).select().single();
    if(error){if(error.code==='23505')alert('Already added!');else console.error(error);return;}
    if(data)setFriends(prev=>[...prev,data]);
  };

  const viewFriendWall=async(friendToken,nickname)=>{
    const{data,error}=await supabase.rpc('get_shared_wall',{token_id:friendToken});
    if(error||!data){alert('Could not load wall');return;}
    setViewingFriend({items:data.items||[],nickname});
  };

  const removeFriend=async(friendId)=>{
    await supabase.from('friends').delete().eq('id',friendId);
    setFriends(prev=>prev.filter(f=>f.id!==friendId));
  };

  const saveUsername=async()=>{
    if(!usernameInput.trim()||usernameInput.trim().length<3){setUsernameError("At least 3 characters");return;}
    const clean=usernameInput.trim().toLowerCase().replace(/[^a-z0-9_]/g,'');
    if(clean.length<3){setUsernameError("Letters, numbers, underscores only");return;}
    const{error}=await supabase.from('profiles').insert({id:session.user.id,username:clean});
    if(error){if(error.code==='23505')setUsernameError("Username taken");else setUsernameError(error.message);return;}
    setUsername(clean);setNeedsUsername(false);
  };

  const searchUsers=async()=>{
    if(!searchQuery.trim())return;
    setSearching(true);
    const{data,error}=await supabase.rpc('search_users',{search_term:searchQuery.trim()});
    if(error)console.error('Search error:',error);
    setSearchResults(data||[]);
    setSearching(false);
  };

  const addFriendFromSearch=async(userId,uname,tokenId)=>{
    if(!tokenId){alert('This user has no share token yet');return;}
    const{data,error}=await supabase.from('friends').insert({user_id:session.user.id,friend_token:tokenId,nickname:uname}).select().single();
    if(error){if(error.code==='23505')alert('Already added!');else console.error(error);return;}
    if(data)setFriends(prev=>[...prev,data]);
    setSearchResults(prev=>prev.filter(r=>r.user_id!==userId));
  };

  const copyShareLink=async()=>{
    if(!shareToken)return;
    const url=`${window.location.origin}${window.location.pathname}?share=${shareToken}`;
    await navigator.clipboard.writeText(url);
    setShareCopied(true);
    setTimeout(()=>setShareCopied(false),2500);
  };

  // Shared wall view
  if(sharedView){
    // If logged in, show option to add as friend
    if(session?.user&&sharedView.ownerId!==session.user.id){
      return(
        <div style={{display:"flex",flexDirection:"column",height:"100vh",fontFamily:"'Nunito',sans-serif"}}>
          <div style={{background:"#fff",padding:"12px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"1px solid #e8e2d8",flexShrink:0}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:22}}>📌</span>
              <span style={{fontWeight:900,fontSize:20,color:"#1a1a1a"}}>Pinwall</span>
            </div>
            <div style={{fontFamily:"'Nunito',sans-serif",fontSize:13,color:"#888"}}>
              👀 Viewing {sharedView.label}
            </div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>{addFriend(sharedView.token,sharedView.label);alert('Added as friend!');}} style={{background:"#2a9d8f",color:"#fff",border:"none",borderRadius:20,padding:"6px 14px",fontFamily:"'Nunito',sans-serif",fontSize:11,fontWeight:700,cursor:"pointer"}}>➕ Add as friend</button>
              <button onClick={()=>{setSharedView(null);window.history.pushState({},'',window.location.pathname);}} style={{background:"#1a1a1a",color:"#fff",border:"none",borderRadius:20,padding:"6px 14px",fontFamily:"'Nunito',sans-serif",fontSize:11,fontWeight:700,cursor:"pointer"}}>Go to my wall</button>
            </div>
          </div>
          <div style={{flex:1}}><SharedWallView items={sharedView.items||[]} label={sharedView.label}/></div>
        </div>
      );
    }
    return <SharedWallView items={sharedView.items||[]} label={sharedView.label}/>;
  }

  if(!session) return <Auth/>;

  if(needsUsername) return(
    <div style={{minHeight:"100vh",background:"#efe5d4",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{background:"#fff",borderRadius:12,padding:"40px 32px",maxWidth:360,width:"90%",textAlign:"center",boxShadow:"0 8px 40px rgba(0,0,0,0.12)"}}>
        <div style={{fontSize:36,marginBottom:12}}>👋</div>
        <div style={{fontFamily:"'Nunito',sans-serif",fontSize:22,fontWeight:900,marginBottom:6}}>Choose a username</div>
        <div style={{fontFamily:"'Nunito',sans-serif",fontSize:13,color:"#888",marginBottom:24}}>Friends will find you by this name</div>
        <input value={usernameInput} onChange={e=>setUsernameInput(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g,''))} placeholder="e.g. sean_92" onKeyDown={e=>{if(e.key==='Enter')saveUsername();}} style={{width:"100%",padding:"12px 14px",border:"2px solid #ddd",borderRadius:8,fontFamily:"'Nunito',sans-serif",fontSize:16,outline:"none",marginBottom:8,textAlign:"center"}}/>
        {usernameError&&<div style={{fontFamily:"'Nunito',sans-serif",fontSize:12,color:"#e63946",marginBottom:8}}>{usernameError}</div>}
        <div style={{fontFamily:"'Nunito',sans-serif",fontSize:11,color:"#bbb",marginBottom:20}}>Lowercase letters, numbers, underscores. Min 3 chars.</div>
        <button onClick={saveUsername} style={{width:"100%",background:"#1a1a1a",color:"white",border:"none",borderRadius:28,padding:"14px",fontFamily:"'Nunito',sans-serif",fontSize:14,fontWeight:700,cursor:"pointer"}}>Continue</button>
      </div>
    </div>
  );

  return(
    <div style={{fontFamily:"'Nunito',sans-serif",background:"#f3ead9",minHeight:"100vh"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;500;600;700&family=Nunito:wght@400;600;700;800;900&family=Permanent+Marker&display=swap');*{box-sizing:border-box;margin:0;padding:0;}::-webkit-scrollbar{width:6px;height:6px}::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.15);border-radius:3px}@media(max-width:768px){.pinwall-nav{height:44px!important;padding:0 10px!important}.pinwall-nav .logo-text{font-size:18px!important}.zoom-controls{display:none!important}.wall-hint{display:none!important}.wall-toolbar{padding:6px 10px!important}.wall-toolbar .tb-pill{padding:3px!important;gap:0!important}.wall-toolbar .tb-btn{padding:5px 8px!important;font-size:11px!important;gap:4px!important}.wall-toolbar .tb-btn span{font-size:12px!important}.edit-wall-desktop{display:none!important}.edit-wall-mobile{display:inline-flex!important}}`}</style>
      <div className="pinwall-nav" style={{background:"#ffffff",borderBottom:"1px solid #e8e2d8",padding:"0 24px",display:"flex",alignItems:"center",justifyContent:"space-between",height:58,position:"sticky",top:0,zIndex:100,boxShadow:"0 1px 6px rgba(0,0,0,0.06)"}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:22,lineHeight:1}}>📌</span>
          <span className="logo-text" style={{fontFamily:"'Nunito',sans-serif",fontWeight:900,fontSize:22,letterSpacing:"-0.02em",color:"#1a1a1a"}}>Pinwall</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:2}}>
          {[["wall","📌","My Wall"],["shelf","📚","Library"],["friends","👥","Friends"]].map(([v,icon,label])=>(
            <button key={v} onClick={()=>{setView(v);if(v==='wall'&&openAlbum)setOpenAlbum(null);}} style={{background:"none",color:view===v?"#1a1a1a":"#888",border:"none",borderRadius:20,padding:"6px 12px",fontFamily:"'Nunito',sans-serif",fontSize:12,fontWeight:700,cursor:"pointer",borderBottom:view===v?"2px solid #1a1a1a":"2px solid transparent",display:"flex",flexDirection:"column",alignItems:"center",gap:1,lineHeight:1}}><span style={{fontSize:16}}>{icon}</span><span className="nav-label" style={{fontSize:10}}>{label}</span></button>
          ))}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <button onClick={()=>setMuted(m=>!m)} style={{display:"inline-flex",alignItems:"center",width:30,height:30,borderRadius:"50%",border:"none",background:muted?"#e63946":"rgba(0,0,0,0.06)",color:muted?"#fff":"#888",fontSize:14,cursor:"pointer",justifyContent:"center"}}>{muted?"🔇":"🔊"}</button>
          <button onClick={copyShareLink} style={{display:"inline-flex",alignItems:"center",gap:4,background:shareCopied?"#2a9d8f":"#1a1a1a",color:"#fff",border:"none",borderRadius:20,padding:"6px 12px",fontFamily:"'Nunito',sans-serif",fontSize:11,fontWeight:700,cursor:"pointer"}}>
            {shareCopied?"✓":"🔗"}
          </button>
          <div onClick={()=>supabase.auth.signOut()} style={{width:30,height:30,borderRadius:"50%",background:"linear-gradient(135deg,#e85d5d,#c0392b)",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Nunito',sans-serif",fontWeight:700,fontSize:12,cursor:"pointer"}}>{(session.user.email?.[0]||'?').toUpperCase()}</div>
        </div>
      </div>
      {view==="wall"&&<HorizontalWall session={session} muted={muted}/>}
      {view==="shelf"&&<Bookshelf onOpenAlbum={setOpenAlbum} shelves={shelves} onAddAlbum={(shelfId,album)=>setShelves(prev=>prev.map(s=>s.id===shelfId?{...s,albums:[...s.albums,album]}:s))} onDeleteAlbum={id=>{setShelves(prev=>prev.map(s=>({...s,albums:s.albums.filter(a=>a.id!==id)})));if(openAlbum?.id===id)setOpenAlbum(null);}} onRenameAlbum={(id,name)=>{setShelves(prev=>prev.map(s=>({...s,albums:s.albums.map(a=>a.id===id?{...a,name}:a)})));if(openAlbum?.id===id)setOpenAlbum(prev=>({...prev,name}));}} onSetCover={(id,url)=>setShelves(prev=>prev.map(s=>({...s,albums:s.albums.map(a=>a.id===id?{...a,coverUrl:url}:a)})))} onAddShelf={()=>setShelves(prev=>[...prev,{id:Math.floor(Math.random()*2000000000),albums:[]}])} session={session}/>}
      {view==="friends"&&(
        <div style={{padding:"40px",minHeight:"calc(100dvh - 58px)",background:"#efe5d4"}}>
          <div style={{fontFamily:"'Nunito',sans-serif",fontSize:28,fontWeight:900,color:"#463a29",marginBottom:8}}>Friends</div>
          <div style={{fontFamily:"'Nunito',sans-serif",fontSize:13,color:"#a99878",marginBottom:24}}>Find friends by username or share your link.</div>
          
          <div style={{display:"flex",gap:8,marginBottom:24,maxWidth:400}}>
            <input value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')searchUsers();}} placeholder="Search by username..." style={{flex:1,padding:"10px 14px",border:"2px solid #ddd",borderRadius:8,fontFamily:"'Nunito',sans-serif",fontSize:14,outline:"none"}}/>
            <button onClick={searchUsers} disabled={searching} style={{background:"#1a1a1a",color:"#fff",border:"none",borderRadius:8,padding:"10px 18px",fontFamily:"'Nunito',sans-serif",fontSize:12,fontWeight:700,cursor:"pointer",opacity:searching?0.6:1}}>{searching?"...":"Search"}</button>
          </div>

          {searchResults.length>0&&<div style={{marginBottom:28}}>
            <div style={{fontFamily:"'Nunito',sans-serif",fontSize:12,fontWeight:700,color:"#a99878",marginBottom:10,textTransform:"uppercase",letterSpacing:"0.1em"}}>Results</div>
            <div style={{display:"flex",flexDirection:"column",gap:8,maxWidth:400}}>
              {searchResults.map(r=>(
                <div key={r.user_id} style={{background:"#fff",borderRadius:8,padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",boxShadow:"0 1px 6px rgba(0,0,0,0.06)"}}>
                  <span style={{fontFamily:"'Nunito',sans-serif",fontSize:14,fontWeight:700,color:"#2a2118"}}>@{r.username}</span>
                  <button onClick={()=>addFriendFromSearch(r.user_id,r.username,r.token_id)} style={{background:"#2a9d8f",color:"#fff",border:"none",borderRadius:16,padding:"6px 14px",fontFamily:"'Nunito',sans-serif",fontSize:11,fontWeight:700,cursor:"pointer"}}>Add</button>
                </div>
              ))}
            </div>
          </div>}

          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:32}}>
            <button onClick={copyShareLink} style={{background:"#1a1a1a",color:"#fff",border:"none",borderRadius:20,padding:"8px 18px",fontFamily:"'Nunito',sans-serif",fontSize:12,fontWeight:700,cursor:"pointer"}}>{shareCopied?"✓ Copied!":"🔗 Copy my share link"}</button>
            {username&&<span style={{fontFamily:"'Nunito',sans-serif",fontSize:12,color:"#a99878"}}>Your username: <strong>@{username}</strong></span>}
          </div>

          {friends.length===0?<div style={{fontFamily:"'Nunito',sans-serif",fontSize:14,color:"#999",padding:"40px 0",textAlign:"center"}}>No friends added yet. Search for someone or share your link!</div>:(
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:16}}>
              {friends.map(f=>(
                <div key={f.id} style={{background:"#fff",borderRadius:12,padding:"16px",boxShadow:"0 2px 12px rgba(0,0,0,0.08)",display:"flex",flexDirection:"column",gap:10}}>
                  <div style={{fontFamily:"'Nunito',sans-serif",fontSize:16,fontWeight:700,color:"#2a2118"}}>@{f.nickname}</div>
                  <div style={{fontFamily:"'Nunito',sans-serif",fontSize:10,color:"#bbb"}}>Added {new Date(f.added_at).toLocaleDateString()}</div>
                  <div style={{display:"flex",gap:6,marginTop:"auto"}}>
                    <button onClick={()=>viewFriendWall(f.friend_token,f.nickname)} style={{flex:1,background:"#2a9d8f",color:"#fff",border:"none",borderRadius:16,padding:"7px 0",fontFamily:"'Nunito',sans-serif",fontSize:11,fontWeight:700,cursor:"pointer"}}>View wall</button>
                    <button onClick={()=>removeFriend(f.id)} style={{background:"none",border:"1px solid #ddd",borderRadius:16,padding:"7px 10px",fontFamily:"'Nunito',sans-serif",fontSize:11,color:"#999",cursor:"pointer"}}>✕</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {viewingFriend&&(
        <div style={{position:"fixed",inset:0,zIndex:200,display:"flex",flexDirection:"column",background:"#fff"}}>
          <div style={{background:"#fff",padding:"10px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"1px solid #e8e2d8",flexShrink:0}}>
            <button onClick={()=>setViewingFriend(null)} style={{background:"none",border:"1px solid #ddd",borderRadius:20,padding:"5px 14px",fontFamily:"'Nunito',sans-serif",fontSize:11,fontWeight:700,cursor:"pointer",color:"#888"}}>{"← Back"}</button>
            <div style={{fontFamily:"'Nunito',sans-serif",fontSize:14,fontWeight:700,color:"#2a2118"}}>{viewingFriend.nickname}{"'s Wall"}</div>
            <div style={{fontFamily:"'Nunito',sans-serif",fontSize:11,color:"#888"}}>Read only</div>
          </div>
          <div style={{flex:1}}><SharedWallView items={viewingFriend.items} label={viewingFriend.nickname}/></div>
        </div>
      )}
      {openAlbum&&<PhotoBook album={openAlbum} onClose={()=>setOpenAlbum(null)} session={session}/>}
    </div>
  );
}
