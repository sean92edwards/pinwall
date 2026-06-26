import { useState, useEffect, useRef } from "react";
import { supabase } from "./supabase";
import Auth from "./Auth";
import { removeBackground } from "@imgly/background-removal";

const STICKERS = ["\u{1F496}","⭐","\u2728","\u{1F31F}","\u{1F4AB}","\u{1F389}","\u{1F942}","\u{1F37E}","\u{1F451}","\u{1F380}","\u{1F48E}","\u{1F98B}","\u{1F338}","\u{1F388}","\u{1F38A}","\u{1F49D}","\u26A1","\u{1F525}","\u{1F495}","\u{1F49C}","\u{1F49B}","\u{1F90D}","\u{1F602}","\u{1F60D}","\u{1F973}","\u{1F62D}","\u{1F929}","\u{1F60E}","\u{1F970}","\u{1F605}","\u{1F64C}","\u{1F44F}","\u{1F48B}","\u{1F382}","\u{1F370}","\u{1F964}","\u{1F3C6}","\u{1F381}","\u{1F3B6}","🎵"];

const BUBBLE_COLORS = ["#ffb6c8","#fff9c4","#c8e6ff","#d4f0c8","#e8d4f5","#fde8c8","#ffffff","#ffc0cb","#f0e68c","#b2dfdb","#ffccbc","#d1c4e9","#f8bbd0","#c5cae9","#dcedc8","#ffe0b2"];


function hdl(pos){const b={position:"absolute",zIndex:10,background:"#4a90e2",cursor:"grab",display:"flex",alignItems:"center",justifyContent:"center",color:"white",boxShadow:"0 1px 6px rgba(0,0,0,0.3)",border:"2px solid white"};if(pos==="top")return{...b,top:-30,left:"50%",transform:"translateX(-50%)",width:24,height:24,borderRadius:"50%",fontSize:14};if(pos==="br")return{...b,bottom:-5,right:-5,width:20,height:20,borderRadius:5,fontSize:11,cursor:"se-resize"};}
const PIN_COLORS=["#e63946","#2a9d8f","#e9c46a","#a8dadc","#e76f51","#457b9d"];

function HorizontalWall({session,muted,editing,setEditing,username}){
  const [items,setItems]=useState(session?[]:[]);
  useEffect(()=>{
    if(!session){fetch('/demo-wall.json').then(r=>r.json()).then(data=>{
      if(Array.isArray(data)){if(data.length)setItems(data);}
      else if(data?.items?.length){setItems(data.items);if(data.homeView)setView(data.homeView);}
    }).catch(()=>{});}
  },[]);
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
  const [photoComments,setPhotoComments]=useState([]);
  const [commentText,setCommentText]=useState("");
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
  const [homeToast,setHomeToast]=useState(false);
  const clearedDoodles=useRef([]);
  const [vp,setVp]=useState({w:1200,h:700});
  const [showZoom,setShowZoom]=useState(true);
  const zoomTimeout=useRef(null);
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
    setShowZoom(true);
    if(zoomTimeout.current)clearTimeout(zoomTimeout.current);
    zoomTimeout.current=setTimeout(()=>setShowZoom(false),3000);
    return()=>{if(zoomTimeout.current)clearTimeout(zoomTimeout.current);};
  },[view]);

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
      // Load home view from localStorage (only on fresh page load, not tab switches)
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

  // Load comments when viewing a photo
  useEffect(()=>{
    if(!viewPhoto||!session?.user)return;
    supabase.from('photo_comments').select('*').eq('wall_owner_id',session.user.id).eq('photo_id',viewPhoto.id).order('created_at',{ascending:true}).then(({data})=>{
      setPhotoComments(data||[]);
    });
  },[viewPhoto]);

  const postComment=async()=>{
    if(!commentText.trim()||!viewPhoto||!session?.user||!username)return;
    const{data,error}=await supabase.from('photo_comments').insert({wall_owner_id:session.user.id,photo_id:viewPhoto.id,author_id:session.user.id,author_name:username,text:commentText.trim()}).select().single();
    if(error){console.error(error);return;}
    if(data)setPhotoComments(prev=>[...prev,data]);
    setCommentText("");
  };

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
    const thumbName=`${session.user.id}/thumbs/${Date.now()}.webp`;
    // Generate thumbnail
    const thumbBlob=await new Promise(resolve=>{
      const img=new Image();
      img.onload=()=>{
        const max=400;const ratio=img.width/img.height;
        const w=ratio>=1?max:max*ratio;const h=ratio>=1?max/ratio:max;
        const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
        const ctx=canvas.getContext('2d');ctx.drawImage(img,0,0,w,h);
        canvas.toBlob(b=>resolve(b),'image/webp',0.7);
      };
      img.onerror=()=>resolve(null);
      img.src=URL.createObjectURL(file);
    });
    // Upload full image
    const{error}=await supabase.storage.from('photos').upload(fileName,file);
    if(error){console.error('Upload error:',error);setUploading(false);return;}
    const{data:{publicUrl}}=supabase.storage.from('photos').getPublicUrl(fileName);
    // Upload thumbnail
    let thumbUrl=publicUrl;
    if(thumbBlob){
      const{error:thumbErr}=await supabase.storage.from('photos').upload(thumbName,thumbBlob,{contentType:'image/webp'});
      if(!thumbErr){thumbUrl=supabase.storage.from('photos').getPublicUrl(thumbName).data.publicUrl;}
    }
    const c=centerWorld();
    const objectUrl=URL.createObjectURL(file);
    const img=new Image();
    img.onload=()=>{
      URL.revokeObjectURL(objectUrl);
      const maxDim=200;const ratio=img.width/img.height;
      const w=ratio>=1?maxDim:maxDim*ratio;const h=ratio>=1?maxDim/ratio:maxDim;
      // Extract top 3 colors from a small sample
      const sCanvas=document.createElement('canvas');sCanvas.width=16;sCanvas.height=16;
      const sCtx=sCanvas.getContext('2d');sCtx.drawImage(img,0,0,16,16);
      const pixels=sCtx.getImageData(0,0,16,16).data;
      const buckets={};
      for(let i=0;i<pixels.length;i+=4){
        const r=Math.round(pixels[i]/32)*32,g=Math.round(pixels[i+1]/32)*32,b=Math.round(pixels[i+2]/32)*32;
        const key=`${r},${g},${b}`;buckets[key]=(buckets[key]||0)+1;
      }
      const sorted=Object.entries(buckets).sort((a,b)=>b[1]-a[1]);
      const topColors=sorted.slice(0,3).map(([k])=>`rgb(${k})`);
      const dominantColor=topColors[0]||'#d8cdb8';
      setItems(p=>[{id:Date.now(),type:photoModeRef.current==='frameless'?'cutout':'photo',url:publicUrl,thumb:thumbUrl,cx:c.x+(Math.random()-0.5)*140,cy:c.y+(Math.random()-0.5)*140,rot:(Math.random()-0.5)*12,w,h,zIndex:maxZ+1,dominantColor,topColors},...p]);
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
  const isMobile=vp.w<=768;
  const lod=zoom>=(isMobile?0.25:0.30)?'full':'low';
  const margin=isMobile?100:200;
  const wL=(0-view.x)/zoom-margin,wT=(0-view.y)/zoom-margin;
  const wR=(vp.w-view.x)/zoom+margin,wB=(vp.h-view.y)/zoom+margin;
  const itemHalf=it=>{if(it.type==='sticker')return(it.size||44);if(it.type==='bubble'||it.type==='speech')return 170;if(it.type==='doodle')return Math.max(it.w||100,it.h||100)/2;if(it.type==='markertext')return 300;return Math.max(it.w||148,it.h||148);};
  const visible=items.filter(it=>{const h=itemHalf(it);return it.cx+h>=wL&&it.cx-h<=wR&&it.cy+h>=wT&&it.cy-h<=wB;});
  const sorted=[...visible].sort((a,b)=>(a.zIndex||1)-(b.zIndex||1));

  // Audio proximity playback
  const audioRefs=useRef({});
  const audioFade=useRef(1);
  const audioFadeInterval=useRef(null);
  useEffect(()=>{
    if(view.zoom<0.25){
      // Start fading out over 2 seconds if not already
      if(!audioFadeInterval.current&&audioFade.current>0){
        audioFadeInterval.current=setInterval(()=>{
          audioFade.current=Math.max(0,audioFade.current-0.05);
          // Update volumes during fade
          Object.values(audioRefs.current).forEach(a=>{
            if(a._targetVol!==undefined) a.volume=a._targetVol*audioFade.current;
            if(audioFade.current===0&&!a.paused) a.pause();
          });
          if(audioFade.current<=0){clearInterval(audioFadeInterval.current);audioFadeInterval.current=null;}
        },100);
      }
    } else {
      // Restore immediately
      if(audioFadeInterval.current){clearInterval(audioFadeInterval.current);audioFadeInterval.current=null;}
      audioFade.current=1;
    }
  },[view.zoom]);
  useEffect(()=>{
    const audioItems=items.filter(i=>i.type==='audio'&&i.url);
    const centerX=(vp.w/2-view.x)/view.zoom;
    const centerY=(vp.h/2-view.y)/view.zoom;
    audioItems.forEach(item=>{
      const dist=Math.hypot(item.cx-centerX,item.cy-centerY);
      const range=item.range||600;
      const t=Math.max(0,Math.min(1,1-dist/range));
      const baseVol=muted?0:t*t;
      const vol=baseVol*audioFade.current;
      if(!audioRefs.current[item.id]){
        const a=new Audio(item.url);
        a.loop=!!item.loop;
        a.volume=vol;
        a._targetVol=baseVol;
        if(vol>0)a.play().catch(()=>{});
        audioRefs.current[item.id]=a;
      } else {
        const a=audioRefs.current[item.id];
        a.loop=!!item.loop;
        a._targetVol=baseVol;
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
    <div style={{height:"100dvh",position:"relative",display:"flex",flexDirection:"column"}}>
      {homeToast&&<div style={{position:"absolute",bottom:80,left:"50%",transform:"translateX(-50%)",zIndex:300,background:"rgba(0,0,0,0.8)",color:"#fff",borderRadius:20,padding:"8px 18px",fontFamily:"'Nunito',sans-serif",fontSize:12,fontWeight:700,animation:"slideUp 0.2s ease"}}>Home view set ✓</div>}
      {editing&&<div className="wall-toolbar" style={{position:"absolute",bottom:24,left:"50%",transform:"translateX(-50%)",zIndex:200,display:"flex",alignItems:"center",gap:8,animation:"slideUp 0.2s ease"}}>
        <div className="tb-pill" style={{display:"flex",alignItems:"center",gap:2,background:"rgba(255,253,248,0.97)",borderRadius:30,padding:6,border:"1px solid #e0d5c0",boxShadow:"0 4px 20px rgba(0,0,0,0.18)",backdropFilter:"blur(8px)"}}>
          <div style={{position:"relative"}}>
            <button onClick={()=>setShowPhotoMenu(s=>!s)} className="tb-btn" style={{display:"inline-flex",alignItems:"center",gap:6,padding:"7px 15px",borderRadius:24,border:"none",background:showPhotoMenu?"#ece4d4":"transparent",fontFamily:"'Nunito',sans-serif",fontSize:13,fontWeight:700,color:"#3a3327",cursor:uploading?"default":"pointer",opacity:uploading?0.55:1}} onMouseEnter={e=>{if(!showPhotoMenu)e.currentTarget.style.background="#ece4d4";}} onMouseLeave={e=>{if(!showPhotoMenu)e.currentTarget.style.background="transparent";}}>
              <span style={{fontSize:15}}>{uploading?"⏳":"📷"}</span>{uploading?"Uploading�":"Photo"}
            </button>
            {showPhotoMenu&&<div onClick={e=>e.stopPropagation()} style={{position:"absolute",bottom:50,left:"50%",transform:"translateX(-50%)",background:"#fffdf8",border:"1px solid #ece1cf",borderRadius:12,padding:10,zIndex:200,boxShadow:"0 12px 36px rgba(80,60,20,0.22)",width:170}}>
              <label style={{display:"flex",alignItems:"center",gap:8,width:"100%",padding:"8px 10px",border:"none",background:"transparent",borderRadius:8,fontFamily:"'Nunito',sans-serif",fontSize:12,fontWeight:700,color:"#3a3327",cursor:"pointer"}} onMouseEnter={e=>e.currentTarget.style.background="#f3ecdf"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>🖼️ Polaroid<input type="file" accept="image/*" multiple style={{display:"none"}} onChange={e=>{photoModeRef.current='polaroid';Array.from(e.target.files).forEach((f,i)=>setTimeout(()=>addPhoto(f),i*100));e.target.value='';setShowPhotoMenu(false);}} disabled={uploading}/></label>
              <label style={{display:"flex",alignItems:"center",gap:8,width:"100%",padding:"8px 10px",border:"none",background:"transparent",borderRadius:8,fontFamily:"'Nunito',sans-serif",fontSize:12,fontWeight:700,color:"#3a3327",cursor:"pointer"}} onMouseEnter={e=>e.currentTarget.style.background="#f3ecdf"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>📐 Frameless<input type="file" accept="image/*" multiple style={{display:"none"}} onChange={e=>{photoModeRef.current='frameless';Array.from(e.target.files).forEach((f,i)=>setTimeout(()=>addPhoto(f),i*100));e.target.value='';setShowPhotoMenu(false);}} disabled={uploading}/></label>
            </div>}
          </div>
          <div style={{width:1,height:20,background:"#d8cdb8"}}/>
          <div style={{position:"relative"}}>
            <button onClick={()=>setShowStickers(s=>!s)} style={{display:"inline-flex",alignItems:"center",gap:6,padding:"7px 15px",borderRadius:24,border:"none",background:showStickers?"#ece4d4":"transparent",fontFamily:"'Nunito',sans-serif",fontSize:13,fontWeight:700,color:"#3a3327",cursor:"pointer"}} onMouseEnter={e=>{if(!showStickers)e.currentTarget.style.background="#ece4d4";}} onMouseLeave={e=>{if(!showStickers)e.currentTarget.style.background="transparent";}}><span style={{fontSize:15}}>⭐</span>Sticker</button>
            {showStickers&&<div onClick={e=>e.stopPropagation()} style={{position:"absolute",bottom:50,left:"50%",transform:"translateX(-50%)",background:"#fffdf8",border:"1px solid #ece1cf",borderRadius:14,padding:12,zIndex:200,boxShadow:"0 12px 36px rgba(80,60,20,0.22)",width:264}}>
              <div style={{fontFamily:"'Nunito',sans-serif",fontSize:10,fontWeight:700,color:"#b9a888",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:8}}>Tap to add</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                {STICKERS.map((em,i)=><button key={i} onClick={()=>addSticker(em)} style={{background:"#f6efe2",border:"1px solid #ece1cf",borderRadius:9,padding:"5px 6px",fontSize:20,cursor:"pointer",lineHeight:1,transition:"transform 0.12s"}} onMouseEnter={e=>e.currentTarget.style.transform="scale(1.25)"} onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>{em}</button>)}
              </div>
            </div>}
          </div>
          <div style={{width:1,height:20,background:"#d8cdb8"}}/>
          <div style={{position:"relative"}}>
            <button onClick={()=>setShowNoteMenu(s=>!s)} style={{display:"inline-flex",alignItems:"center",gap:6,padding:"7px 15px",borderRadius:24,border:"none",background:showNoteMenu?"#ece4d4":"transparent",fontFamily:"'Nunito',sans-serif",fontSize:13,fontWeight:700,color:"#3a3327",cursor:"pointer"}} onMouseEnter={e=>{if(!showNoteMenu)e.currentTarget.style.background="#ece4d4";}} onMouseLeave={e=>{if(!showNoteMenu)e.currentTarget.style.background="transparent";}}><span style={{fontSize:15}}>📝</span>Note</button>
            {showNoteMenu&&<div onClick={e=>e.stopPropagation()} style={{position:"absolute",bottom:50,left:"50%",transform:"translateX(-50%)",background:"#fffdf8",border:"1px solid #ece1cf",borderRadius:12,padding:10,zIndex:200,boxShadow:"0 12px 36px rgba(80,60,20,0.22)",width:160}}>
              <button onClick={()=>{addBubble();setShowNoteMenu(false);}} style={{display:"flex",alignItems:"center",gap:8,width:"100%",padding:"8px 10px",border:"none",background:"transparent",borderRadius:8,fontFamily:"'Nunito',sans-serif",fontSize:12,fontWeight:700,color:"#3a3327",cursor:"pointer",textAlign:"left"}} onMouseEnter={e=>e.currentTarget.style.background="#f3ecdf"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>📝 Sticky Note</button>
              <button onClick={()=>{addSpeechBubble();setShowNoteMenu(false);}} style={{display:"flex",alignItems:"center",gap:8,width:"100%",padding:"8px 10px",border:"none",background:"transparent",borderRadius:8,fontFamily:"'Nunito',sans-serif",fontSize:12,fontWeight:700,color:"#3a3327",cursor:"pointer",textAlign:"left"}} onMouseEnter={e=>e.currentTarget.style.background="#f3ecdf"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>💬 Speech Bubble</button>
            </div>}
          </div>
          <div style={{width:1,height:20,background:"#d8cdb8"}}/>
          <button onClick={()=>{setDoodling(d=>!d);if(doodling){setCurrentPath(null);setErasing(false);}}} style={{display:"inline-flex",alignItems:"center",gap:6,padding:"7px 15px",borderRadius:24,border:"none",background:doodling?"#ece4d4":"transparent",fontFamily:"'Nunito',sans-serif",fontSize:13,fontWeight:700,color:"#3a3327",cursor:"pointer"}} onMouseEnter={e=>{if(!doodling)e.currentTarget.style.background="#ece4d4";}} onMouseLeave={e=>{if(!doodling)e.currentTarget.style.background="transparent";}}><span style={{fontSize:15}}>✏️</span>Doodle</button>
          <div style={{width:1,height:20,background:"#d8cdb8"}}/>
          <button onClick={()=>{const hv={x:view.x,y:view.y,zoom:view.zoom};setHomeView(hv);setHomeViewSet(true);localStorage.setItem('pinwall_home_view',JSON.stringify(hv));setHomeToast(true);setTimeout(()=>setHomeToast(false),2000);}} style={{display:"inline-flex",alignItems:"center",gap:6,padding:"7px 15px",borderRadius:24,border:"none",background:"transparent",fontFamily:"'Nunito',sans-serif",fontSize:13,fontWeight:700,color:"#3a3327",cursor:"pointer"}}><span style={{fontSize:15}}>📍</span>Home</button>
          <div style={{width:1,height:20,background:"#d8cdb8"}}/>
          <label style={{display:"inline-flex",alignItems:"center",gap:6,padding:"7px 15px",borderRadius:24,cursor:uploadingAudio?"default":"pointer",fontFamily:"'Nunito',sans-serif",fontSize:13,fontWeight:700,color:"#3a3327",opacity:uploadingAudio?0.6:1}}><span style={{fontSize:15}}>{uploadingAudio?"⏳":"🎵"}</span>Sound<input type="file" accept="audio/*" style={{display:"none"}} onChange={e=>{addAudio(e.target.files[0]);e.target.value='';}} disabled={uploadingAudio}/></label>
        </div>
        {doodling&&<div style={{position:"absolute",left:"50%",transform:"translateX(-50%)",bottom:56,display:"flex",gap:6,alignItems:"center",background:"rgba(0,0,0,0.8)",borderRadius:20,padding:"6px 12px",zIndex:200}}>
          {["#1a1a1a","#e63980","#e63946","#ff6b35","#2a9d8f","#e9c46a","#457b9d","#7b2d8b","#4a9e4a","#ff9ecd","#ffffff"].map(c=><div key={c} onClick={()=>setDoodleColor(c)} style={{width:20,height:20,borderRadius:"50%",background:c,border:doodleColor===c?"2px solid #4a90e2":"2px solid rgba(255,255,255,0.3)",cursor:"pointer"}}/>)}
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
      </div>}
      <div ref={viewportRef} onMouseDown={onViewportMouseDown} onClick={onViewportClick} style={{flex:1,position:"relative",overflow:"hidden",cursor:doodling?"crosshair":(editing?"default":"grab"),touchAction:"none",background:"#c6a06a",backgroundImage:`radial-gradient(ellipse 120% 90% at 50% -5%,rgba(255,244,222,0.35) 0%,transparent 55%),radial-gradient(ellipse at 88% 108%,rgba(110,78,42,0.32) 0%,transparent 50%),url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='cork'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0.25'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23cork)' opacity='0.4'/%3E%3C/svg%3E")`,backgroundSize:"100% 100%,100% 100%,150px 150px",userSelect:"none"}}>
      <div style={{position:"absolute",inset:0,boxShadow:"inset 0 0 90px rgba(0,0,0,0.22)",pointerEvents:"none",zIndex:5}}/>
        <div style={{position:"absolute",left:0,top:0,transformOrigin:"0 0",transform:`translate(${view.x}px,${view.y}px) scale(${view.zoom})`,pointerEvents:(doodling&&!erasing)?"none":"auto"}}>
          {sorted.map(item=>{
            const isSel=editing&&selected===item.id;

            if(item.type==='audio'){
              return null; // Audio rendered separately on top
            }
            if(lod==='low'&&(item.type==='photo'||item.type==='polaroid'||item.type==='cutout')&&item.url){
              const w=item.w||148;const h=item.h||148;
              const col=item.dominantColor||'#d8cdb8';
              return(<div key={item.id} style={{position:"absolute",left:item.cx,top:item.cy,width:w,height:h,transform:`translate(-50%,-50%) rotate(${item.rot||0}deg)`,borderRadius:4,zIndex:item.zIndex||1,boxShadow:"0 4px 10px rgba(0,0,0,0.15)",background:col}}/>);
            }
            if(lod==='low'&&item.type!=='doodle'&&item.type!=='markertext'){
              const w=item.type==='sticker'?(item.size||44):(item.type==='bubble'?150*(item.scale||1):(item.w||148));
              const h=item.type==='sticker'?(item.size||44):(item.type==='bubble'?70*(item.scale||1):(item.h||148));
              const col=item.type==='sticker'?"#e6c25c":(item.color||"#ffffff");
              return(<div key={item.id} style={{position:"absolute",left:item.cx,top:item.cy,width:w,height:h,transform:`translate(-50%,-50%) rotate(${item.rot||0}deg)`,background:col,borderRadius:item.type==='sticker'?"50%":6,zIndex:item.zIndex||1,boxShadow:"0 6px 14px rgba(0,0,0,0.18)"}}/>);
            }
            if(item.type==='sticker')return(<div key={item.id} style={{position:"absolute",left:item.cx,top:item.cy,zIndex:item.zIndex||1,transform:`translate(-50%,-50%) rotate(${item.rot||0}deg)`,cursor:editing?"grab":"default",userSelect:"none"}} onMouseDown={e=>startDrag(e,item.id)} onTouchStart={e=>startDrag(e,item.id)} onClick={e=>{if(editing){e.stopPropagation();setSelected(item.id);}}}><div style={{fontSize:item.size||44,lineHeight:1,filter:"drop-shadow(1px 3px 6px rgba(0,0,0,0.22))"}}>{item.emoji}</div>{isSel&&lod==='full'&&<><div style={{position:"absolute",inset:-5,border:"1.5px dashed rgba(74,144,226,0.65)",borderRadius:6,pointerEvents:"none"}}/><div onMouseDown={e=>startRotate(e,item.id)} onTouchStart={e=>startRotate(e,item.id)} style={hdl("top")}>↻</div><div onMouseDown={e=>startResize(e,item.id)} onTouchStart={e=>startResize(e,item.id)} style={hdl("br")}/><div onMouseDown={e=>{e.stopPropagation();setItems(p=>p.filter(i=>i.id!==item.id));setSelected(null);}} style={{position:"absolute",top:-10,right:-10,width:20,height:20,borderRadius:"50%",background:"#e63946",color:"white",fontSize:12,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",zIndex:10}}>✕</div></>}</div>);
            if(item.type==='bubble'){const isEditingThis=editingText===item.id;const scale=item.scale||1;const pinColor=PIN_COLORS[(item.id||0)%PIN_COLORS.length];return(<div key={item.id} style={{position:"absolute",left:item.cx,top:item.cy,zIndex:item.zIndex||1,transform:`translate(-50%,-50%) rotate(${item.rot||0}deg) scale(${scale})`,cursor:editing&&!isEditingThis?"grab":"default",userSelect:"none"}} onMouseDown={e=>{if(!isEditingThis)startDrag(e,item.id);}} onTouchStart={e=>{if(!isEditingThis)startDrag(e,item.id);}} onClick={e=>{if(editing){e.stopPropagation();bringToFront(item.id);setSelected(item.id);}}} onDoubleClick={e=>{if(editing&&lod==='full'){e.stopPropagation();setEditingText(item.id);}}}>
              <div style={{position:"absolute",top:-10,left:"50%",transform:"translateX(-50%)",width:18,height:18,borderRadius:"50%",background:"radial-gradient(circle at 35% 35%,#f0d060,#b8941e)",boxShadow:"0 2px 6px rgba(0,0,0,0.35)",zIndex:2}}/>
              <div style={{background:item.color||"#ffb6c8",padding:"18px 20px",minWidth:140,minHeight:80,boxShadow:isSel?"0 6px 20px rgba(0,0,0,0.25),0 0 0 2px rgba(74,144,226,0.55)":"3px 5px 14px rgba(0,0,0,0.2)",position:"relative"}}>
                {isEditingThis?<textarea autoFocus defaultValue={item.text} onBlur={e=>{setItems(p=>p.map(i=>i.id===item.id?{...i,text:e.target.value}:i));setEditingText(null);}} placeholder="Write here..." style={{background:"transparent",border:"none",outline:"none",fontFamily:"'Permanent Marker',cursive",fontSize:18,color:"#1a1a1a",resize:"none",minWidth:120,minHeight:60,lineHeight:1.5,display:"block",whiteSpace:"pre",overflowWrap:"normal"}}/>:<div style={{fontFamily:"'Permanent Marker',cursive",fontSize:18,color:"#1a1a1a",lineHeight:1.5,whiteSpace:"pre-wrap",minWidth:80,minHeight:28}}>{item.text||<span style={{color:"rgba(0,0,0,0.2)"}}>...</span>}</div>}
              </div>
              {isSel&&!isEditingThis&&lod==='full'&&<><div onMouseDown={e=>startRotate(e,item.id)} onTouchStart={e=>startRotate(e,item.id)} style={hdl("top")}>↻</div><div onMouseDown={e=>startResize(e,item.id)} onTouchStart={e=>startResize(e,item.id)} style={hdl("br")}>⤡</div><div style={{position:"absolute",top:-46,left:"50%",transform:"translateX(-50%)",display:"flex",gap:5,background:"rgba(0,0,0,0.75)",borderRadius:20,padding:"5px 8px",zIndex:20}} onClick={e=>e.stopPropagation()} onMouseDown={e=>e.stopPropagation()}>{BUBBLE_COLORS.map(c=><div key={c} onClick={()=>setItems(p=>p.map(i=>i.id===item.id?{...i,color:c}:i))} style={{width:16,height:16,borderRadius:"50%",background:c,border:item.color===c?"2px solid #4a90e2":"2px solid transparent",cursor:"pointer"}}/>)}<div onClick={()=>{setItems(p=>p.filter(i=>i.id!==item.id));setSelected(null);}} style={{width:20,height:20,borderRadius:4,background:"#e63946",color:"white",fontSize:11,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",marginLeft:2}}>✕</div></div></>}
             </div>);}
            if(item.type==='speech'){const isEditingThis=editingText===item.id;const scale=item.scale||1;const tailDir=item.tailDir||'bottom';const tailStyles={bottom:{bottom:-12,left:24,borderLeft:"10px solid transparent",borderRight:"10px solid transparent",borderTop:`12px solid ${item.color||"#fff"}`},top:{top:-12,left:24,borderLeft:"10px solid transparent",borderRight:"10px solid transparent",borderBottom:`12px solid ${item.color||"#fff"}`},left:{left:-12,top:20,borderTop:"10px solid transparent",borderBottom:"10px solid transparent",borderRight:`12px solid ${item.color||"#fff"}`},right:{right:-12,top:20,borderTop:"10px solid transparent",borderBottom:"10px solid transparent",borderLeft:`12px solid ${item.color||"#fff"}`}};return(<div key={item.id} style={{position:"absolute",left:item.cx,top:item.cy,zIndex:item.zIndex||1,transform:`translate(-50%,-50%) rotate(${item.rot||0}deg) scale(${scale})`,cursor:editing&&!isEditingThis?"grab":"default",userSelect:"none",minWidth:100,maxWidth:240}} onMouseDown={e=>{if(!isEditingThis)startDrag(e,item.id);}} onTouchStart={e=>{if(!isEditingThis)startDrag(e,item.id);}} onClick={e=>{if(editing){e.stopPropagation();bringToFront(item.id);setSelected(item.id);}}} onDoubleClick={e=>{if(editing&&lod==='full'){e.stopPropagation();setEditingText(item.id);}}}>
              <div style={{background:item.color||"#fff",borderRadius:18,padding:"12px 16px",boxShadow:isSel?"0 6px 20px rgba(0,0,0,0.25),0 0 0 2px rgba(74,144,226,0.55)":"2px 4px 14px rgba(0,0,0,0.18)",border:"none",position:"relative",minWidth:100}}>
                {isEditingThis?<textarea autoFocus defaultValue={item.text} onBlur={e=>{setItems(p=>p.map(i=>i.id===item.id?{...i,text:e.target.value}:i));setEditingText(null);}} placeholder="Type here..." style={{background:"transparent",border:"none",outline:"none",fontFamily:"'Caveat',cursive",fontSize:20,color:"#333",resize:"none",minWidth:120,minHeight:44,lineHeight:1.4,display:"block",whiteSpace:"pre",overflowWrap:"normal"}}/>:<div style={{fontFamily:"'Caveat',cursive",fontSize:20,color:"#333",lineHeight:1.4,whiteSpace:"pre-wrap",minWidth:60,minHeight:24}}>{item.text||<span style={{color:"#bbb"}}>...</span>}</div>}
              </div>
              <div style={{position:"absolute",width:0,height:0,...tailStyles[tailDir]}}/>
              {isSel&&!isEditingThis&&lod==='full'&&<><div onMouseDown={e=>startRotate(e,item.id)} onTouchStart={e=>startRotate(e,item.id)} style={hdl("top")}>↻</div><div onMouseDown={e=>startResize(e,item.id)} onTouchStart={e=>startResize(e,item.id)} style={hdl("br")}>⤡</div><div style={{position:"absolute",top:-46,left:"50%",transform:"translateX(-50%)",display:"flex",gap:4,background:"rgba(0,0,0,0.75)",borderRadius:20,padding:"5px 8px",zIndex:20}} onClick={e=>e.stopPropagation()} onMouseDown={e=>e.stopPropagation()}>{BUBBLE_COLORS.map(c=><div key={c} onClick={()=>setItems(p=>p.map(i=>i.id===item.id?{...i,color:c}:i))} style={{width:14,height:14,borderRadius:"50%",background:c,border:item.color===c?"2px solid #4a90e2":"2px solid transparent",cursor:"pointer"}}/>)}<div onClick={()=>{const dirs=['bottom','top','left','right'];const cur=dirs.indexOf(item.tailDir||'bottom');setItems(p=>p.map(i=>i.id===item.id?{...i,tailDir:dirs[(cur+1)%4]}:i));}} style={{width:20,height:20,borderRadius:4,background:"rgba(255,255,255,0.15)",color:"white",fontSize:11,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",marginLeft:3}} title="Flip tail">⇅</div><div onClick={()=>{setItems(p=>p.filter(i=>i.id!==item.id));setSelected(null);}} style={{width:20,height:20,borderRadius:4,background:"#e63946",color:"white",fontSize:11,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",marginLeft:2}}>✕</div></div></>}
            </div>);}
            if(item.type==='polaroid'||item.type==='photo'){const isPhoto=item.type==='photo';const pinColor=PIN_COLORS[(item.id||0)%PIN_COLORS.length];return(<div key={item.id} style={{position:"absolute",left:item.cx,top:item.cy,zIndex:item.zIndex||1,transform:`translate(-50%,-50%) rotate(${item.rot||0}deg)`,cursor:editing?"grab":"pointer",userSelect:"none"}} onMouseDown={e=>startDrag(e,item.id)} onTouchStart={e=>startDrag(e,item.id)} onClick={e=>{if(editing){e.stopPropagation();setSelected(item.id);}else if(item.url){setViewPhoto(item);}}} onMouseEnter={e=>{if(!editing){e.currentTarget.style.transform=`translate(-50%,-50%) rotate(${(item.rot||0)*0.3}deg) scale(1.06)`;e.currentTarget.style.zIndex=99;}}} onMouseLeave={e=>{if(!editing){e.currentTarget.style.transform=`translate(-50%,-50%) rotate(${item.rot||0}deg) scale(1)`;e.currentTarget.style.zIndex=item.zIndex;}}}>
              <div style={{position:"absolute",top:-14,left:"50%",transform:"translateX(-50%)",width:22,height:22,borderRadius:"50%",background:`radial-gradient(circle at 35% 35%,${pinColor}ee,${pinColor})`,boxShadow:"0 3px 10px rgba(0,0,0,0.45),inset 0 1px 2px rgba(255,255,255,0.4)",zIndex:2}}/>
              <div style={{background:"white",padding:isPhoto?"5px 5px 30px 5px":"8px 8px 36px 8px",boxShadow:isSel?"0 14px 34px rgba(0,0,0,0.30),0 0 0 2px rgba(74,144,226,0.55)":"0 8px 20px rgba(0,0,0,0.25),0 2px 4px rgba(0,0,0,0.10)",width:item.w||148,transition:"box-shadow 0.15s"}}>
                {isPhoto?<img src={item.url} decoding="async" style={{width:"100%",height:item.h||148,objectFit:"cover",display:"block",background:item.dominantColor||"#e8e0d4"}} alt=""/>:<div style={{width:"100%",height:item.h||148,background:item.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:Math.min(item.w||148,item.h||148)*0.4}}>{item.emoji}</div>}
                {lod==='full'&&<div onDoubleClick={e=>{if(editing){e.stopPropagation();setEditingCaption(item.id);}}} style={{marginTop:6,fontFamily:"'Permanent Marker',cursive",fontSize:13,color:"#1a1a1a",textAlign:"center",lineHeight:1.3,minHeight:16,cursor:editing?"text":"default"}}>
                  {editingCaption===item.id
                    ?<input autoFocus defaultValue={item.caption||""} onBlur={e=>{setItems(p=>p.map(i=>i.id===item.id?{...i,caption:e.target.value}:i));setEditingCaption(null);}} onKeyDown={e=>{if(e.key==='Enter')e.currentTarget.blur();if(e.key==='Escape')setEditingCaption(null);}} onClick={e=>e.stopPropagation()} style={{background:"transparent",border:"none",borderBottom:"1px solid #ccc",outline:"none",fontFamily:"'Permanent Marker',cursive",fontSize:13,color:"#1a1a1a",textAlign:"center",width:"100%",padding:0}}/>
                    :(item.caption||<span style={{color:"#ccc",fontSize:10,fontFamily:"'Nunito',sans-serif"}}>{editing?"double-click to write":""}</span>)
                  }
                </div>}
              </div>
              {isSel&&lod==='full'&&<><div onMouseDown={e=>startRotate(e,item.id)} onTouchStart={e=>startRotate(e,item.id)} style={hdl("top")}>↻</div><div onMouseDown={e=>startResize(e,item.id)} onTouchStart={e=>startResize(e,item.id)} style={hdl("br")}>⤡</div>{item.type==='photo'&&item.url&&<div onClick={e=>{e.stopPropagation();cutOutPhoto(item);}} style={{position:"absolute",top:-10,left:-10,height:20,borderRadius:10,background:cuttingOut?"#888":"#2a9d8f",color:"white",fontSize:10,display:"flex",alignItems:"center",justifyContent:"center",cursor:cuttingOut?"default":"pointer",zIndex:10,padding:"0 8px",fontFamily:"'Nunito',sans-serif",fontWeight:700}}>{cuttingOut?"u{23F3}":"✂️ Cut"}</div>}<div onMouseDown={e=>{e.stopPropagation();setItems(p=>p.filter(i=>i.id!==item.id));setSelected(null);}} style={{position:"absolute",top:-10,right:-10,width:20,height:20,borderRadius:"50%",background:"#e63946",color:"white",fontSize:12,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",zIndex:10}}>✕</div></>}
            </div>);}
            if(item.type==='doodle'){
              if(!isSel){
                // Render as path only (no bounding box) - handled in doodle layer below
                return null;
              }
              return(<div key={item.id} style={{position:"absolute",left:item.cx,top:item.cy,zIndex:item.zIndex||1,transform:`translate(-50%,-50%) rotate(${item.rot||0}deg)`,cursor:erasing?"crosshair":(editing?"grab":"default"),userSelect:"none",width:item.w,height:item.h}} onMouseDown={e=>{if(!erasing)startDrag(e,item.id);}} onTouchStart={e=>{if(!erasing)startDrag(e,item.id);}} onClick={e=>{e.stopPropagation();if(erasing){setItems(p=>p.filter(i=>i.id!==item.id));}else if(editing){setSelected(item.id);}}}>
              <div style={{position:"absolute",inset:-4,border:"1.5px dashed rgba(74,144,226,0.6)",borderRadius:4,pointerEvents:"none"}}/>
              <div onMouseDown={e=>startRotate(e,item.id)} onTouchStart={e=>startRotate(e,item.id)} style={hdl("top")}>↻</div><div onMouseDown={e=>startResize(e,item.id)} onTouchStart={e=>startResize(e,item.id)} style={hdl("br")}>⤡</div><div onMouseDown={e=>{e.stopPropagation();setItems(p=>p.filter(i=>i.id!==item.id));setSelected(null);}} style={{position:"absolute",top:-10,right:-10,width:20,height:20,borderRadius:"50%",background:"#e63946",color:"white",fontSize:12,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",zIndex:10}}>✕</div>
            </div>);}
            if(item.type==='cutout'){return(<div key={item.id} style={{position:"absolute",left:item.cx,top:item.cy,zIndex:item.zIndex||1,transform:`translate(-50%,-50%) rotate(${item.rot||0}deg)`,cursor:editing?"grab":"pointer",userSelect:"none"}} onMouseDown={e=>startDrag(e,item.id)} onTouchStart={e=>startDrag(e,item.id)} onClick={e=>{if(editing){e.stopPropagation();setSelected(item.id);}else if(item.url){setViewPhoto(item);}}} onMouseEnter={e=>{if(!editing){e.currentTarget.style.transform=`translate(-50%,-50%) rotate(${(item.rot||0)*0.3}deg) scale(1.06)`;e.currentTarget.style.zIndex=99;}}} onMouseLeave={e=>{if(!editing){e.currentTarget.style.transform=`translate(-50%,-50%) rotate(${item.rot||0}deg) scale(1)`;e.currentTarget.style.zIndex=item.zIndex;}}}>
              <img src={item.url} decoding="async" style={{width:item.w||200,height:item.h||200,objectFit:"cover",display:"block",borderRadius:4}} alt=""/>
              {isSel&&lod==='full'&&<><div onMouseDown={e=>startRotate(e,item.id)} onTouchStart={e=>startRotate(e,item.id)} style={hdl("top")}>↻</div><div onMouseDown={e=>startResize(e,item.id)} onTouchStart={e=>startResize(e,item.id)} style={hdl("br")}>⤡</div>{item.url&&<div onClick={e=>{e.stopPropagation();cutOutPhoto(item);}} style={{position:"absolute",top:-10,left:-10,height:20,borderRadius:10,background:cuttingOut?"#888":"#2a9d8f",color:"white",fontSize:10,display:"flex",alignItems:"center",justifyContent:"center",cursor:cuttingOut?"default":"pointer",zIndex:10,padding:"0 8px",fontFamily:"'Nunito',sans-serif",fontWeight:700}}>{cuttingOut?"u{23F3}":"✂️ Cut"}</div>}<div onMouseDown={e=>{e.stopPropagation();setItems(p=>p.filter(i=>i.id!==item.id));setSelected(null);}} style={{position:"absolute",top:-10,right:-10,width:20,height:20,borderRadius:"50%",background:"#e63946",color:"white",fontSize:12,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",zIndex:10}}>✕</div></>}
            </div>);}
            if(item.type==='markertext'){if(lod==='low')return null;const isEditingThis=editingText===item.id;const scale=item.scale||1;return(<div key={item.id} style={{position:"absolute",left:item.cx,top:item.cy,zIndex:item.zIndex||1,transform:`translate(-50%,-50%) rotate(${item.rot||0}deg) scale(${scale})`,cursor:editing&&!isEditingThis?"grab":"default",userSelect:"none"}} onMouseDown={e=>{if(!isEditingThis)startDrag(e,item.id);}} onTouchStart={e=>{if(!isEditingThis)startDrag(e,item.id);}} onClick={e=>{if(editing){e.stopPropagation();bringToFront(item.id);setSelected(item.id);}}} onDoubleClick={e=>{if(editing&&lod==='full'){e.stopPropagation();setEditingText(item.id);}}}>
              {isEditingThis
                ?<textarea autoFocus defaultValue={item.text} onBlur={e=>{setItems(p=>p.map(i=>i.id===item.id?{...i,text:e.target.value}:i));setEditingText(null);}} onKeyDown={e=>{if(e.key==='Escape')setEditingText(null);}} onClick={e=>e.stopPropagation()} style={{background:"transparent",border:"none",borderBottom:`2px solid ${item.color||"#1a1a1a"}`,outline:"none",fontFamily:"'Permanent Marker',cursive",fontSize:24,color:item.color||"#1a1a1a",textAlign:"center",minWidth:100,padding:"2px 4px",resize:"none",lineHeight:1.4,display:"block",whiteSpace:"pre",overflowWrap:"normal",wordBreak:"keep-all"}}/>
                :<div style={{fontFamily:"'Permanent Marker',cursive",fontSize:24,color:item.color||"#1a1a1a",whiteSpace:"pre",textShadow:"1px 1px 0 rgba(0,0,0,0.05)"}}>{item.text||<span style={{opacity:0.3}}>type here</span>}</div>
              }
              {isSel&&!isEditingThis&&lod==='full'&&<><div onMouseDown={e=>startRotate(e,item.id)} onTouchStart={e=>startRotate(e,item.id)} style={hdl("top")}>↻</div><div onMouseDown={e=>startResize(e,item.id)} onTouchStart={e=>startResize(e,item.id)} style={hdl("br")}>⤡</div><div style={{position:"absolute",top:-42,left:"50%",transform:"translateX(-50%)",display:"flex",gap:4,background:"rgba(0,0,0,0.75)",borderRadius:16,padding:"4px 8px",zIndex:20}} onClick={e=>e.stopPropagation()} onMouseDown={e=>e.stopPropagation()}>{["#1a1a1a","#e63980","#e63946","#ff6b35","#2a9d8f","#e9c46a","#457b9d","#7b2d8b","#4a9e4a","#ff9ecd","#ffffff"].map(c=><div key={c} onClick={()=>setItems(p=>p.map(i=>i.id===item.id?{...i,color:c}:i))} style={{width:14,height:14,borderRadius:"50%",background:c,border:item.color===c?"2px solid #4a90e2":"2px solid rgba(255,255,255,0.3)",cursor:"pointer"}}/>)}<div onClick={()=>{setItems(p=>p.filter(i=>i.id!==item.id));setSelected(null);}} style={{width:16,height:16,borderRadius:4,background:"#e63946",color:"white",fontSize:9,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",marginLeft:3}}>✕</div></div></>}
            </div>);}
            return null;
          })}
        </div>
        <svg style={{position:"absolute",left:0,top:0,width:"100%",height:"100%",pointerEvents:erasing?"auto":"none",zIndex:6,overflow:"visible",transform:`translate(${view.x}px,${view.y}px) scale(${view.zoom})`,transformOrigin:"0 0"}}>
          {items.filter(i=>i.type==='doodle').filter(it=>{const h=Math.max(it.w||100,it.h||100)/2;return it.cx+h>=wL&&it.cx-h<=wR&&it.cy+h>=wT&&it.cy-h<=wB;}).map(item=>(
            <path key={item.id} d={item.path} fill="none" stroke={item.color||"#1a1a1a"} strokeWidth={(item.strokeWidth||3)*1.5} strokeLinecap="round" strokeLinejoin="round" opacity="0.9" transform={`translate(${item.cx-item.w/2},${item.cy-item.h/2})`} onClick={erasing?()=>setItems(p=>p.filter(i=>i.id!==item.id)):undefined} style={{cursor:erasing?"crosshair":"default",pointerEvents:erasing?"auto":"none"}}/>
          ))}
        </svg>
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
        <div className="zoom-controls" style={{position:"absolute",right:16,bottom:16,zIndex:60,display:"flex",alignItems:"center",gap:6,opacity:showZoom?1:0,transition:"opacity 0.4s ease",pointerEvents:showZoom?"auto":"none"}}>
          <button onClick={()=>zoomBy(1/1.25)} style={{width:32,height:32,borderRadius:9,border:"none",background:"rgba(44,38,32,0.85)",color:"#fff",fontSize:18,cursor:"pointer",lineHeight:1}}>-</button>
          <div style={{minWidth:52,textAlign:"center",background:"rgba(44,38,32,0.85)",color:"#fff",borderRadius:9,padding:"7px 8px",fontFamily:"'Nunito',sans-serif",fontSize:12,fontWeight:700}}>{Math.round(zoom*100)}%</div>
          <button onClick={()=>zoomBy(1.25)} style={{width:32,height:32,borderRadius:9,border:"none",background:"rgba(44,38,32,0.85)",color:"#fff",fontSize:18,cursor:"pointer",lineHeight:1}}>+</button>
          <button onClick={resetView} style={{height:32,borderRadius:9,border:"none",background:"rgba(44,38,32,0.85)",color:"#fff",fontSize:11,fontWeight:700,fontFamily:"'Nunito',sans-serif",cursor:"pointer",padding:"0 12px"}}>Reset</button>
        </div>
      </div>
      {viewPhoto&&<div className="photo-modal" onClick={()=>{setViewPhoto(null);setPhotoComments([]);setCommentText("");}} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.92)",zIndex:1000,display:"flex",alignItems:"stretch"}}>
        <div className="photo-modal-img" style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",cursor:"zoom-out"}}>
          <img src={viewPhoto.url} style={{maxWidth:"100%",maxHeight:"100%",objectFit:"contain",padding:20}} onClick={e=>e.stopPropagation()} alt=""/>
        </div>
        <div className="photo-modal-comments" onClick={e=>e.stopPropagation()} style={{width:300,background:"#fff",display:"flex",flexDirection:"column",cursor:"default"}}>
          <div style={{padding:"16px",borderBottom:"1px solid #eee",fontFamily:"'Nunito',sans-serif",fontSize:14,fontWeight:800}}>Comments</div>
          <div style={{flex:1,overflowY:"auto",padding:"12px 16px"}}>
            {photoComments.length===0&&<div style={{fontFamily:"'Nunito',sans-serif",fontSize:12,color:"#999",textAlign:"center",padding:"30px 0"}}>No comments yet</div>}
            {photoComments.map(c=>(
              <div key={c.id} style={{marginBottom:12,display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                <div>
                  <div style={{fontFamily:"'Nunito',sans-serif",fontSize:11,fontWeight:700,color:"#2a2118"}}>@{c.author_name}</div>
                  <div style={{fontFamily:"'Nunito',sans-serif",fontSize:12,color:"#555",marginTop:2}}>{c.text}</div>
                  <div style={{fontFamily:"'Nunito',sans-serif",fontSize:9,color:"#bbb",marginTop:2}}>{new Date(c.created_at).toLocaleDateString()}</div>
                </div>
                {session?.user&&(c.author_id===session.user.id||c.wall_owner_id===session.user.id)&&<button onClick={async()=>{await supabase.from('photo_comments').delete().eq('id',c.id);setPhotoComments(p=>p.filter(x=>x.id!==c.id));}} style={{background:"none",border:"none",color:"#ccc",fontSize:14,cursor:"pointer",padding:"0 4px",lineHeight:1}}>✕</button>}
              </div>
            ))}
          </div>
          <div style={{padding:"12px 16px",borderTop:"1px solid #eee",display:"flex",gap:6}}>
            <input value={commentText} onChange={e=>setCommentText(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')postComment();}} placeholder="Write a comment..." style={{flex:1,padding:"8px 10px",border:"1px solid #ddd",borderRadius:8,fontFamily:"'Nunito',sans-serif",fontSize:12,outline:"none"}}/>
            <button onClick={postComment} style={{background:"#1a1a1a",color:"#fff",border:"none",borderRadius:8,padding:"8px 12px",fontFamily:"'Nunito',sans-serif",fontSize:11,fontWeight:700,cursor:"pointer"}}>Post</button>
          </div>
        </div>
        <div className="photo-modal-close" onClick={()=>{setViewPhoto(null);setPhotoComments([]);setCommentText("");}} style={{position:"absolute",top:20,right:320,color:"white",fontSize:32,cursor:"pointer"}}>✕</div>
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
          <span style={{fontSize:16}}>👀</span> You're viewing <strong style={{color:"#2a2118"}}>{label}</strong> � read only
        </div>
        <a href="/" style={{background:"#1a1a1a",color:"#fff",borderRadius:20,padding:"6px 14px",fontFamily:"'Nunito',sans-serif",fontSize:11,fontWeight:700,textDecoration:"none"}}>{"Create your own ?"}</a>
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
        <div style={{position:"absolute",right:16,bottom:16,zIndex:60,display:"flex",alignItems:"center",gap:6}}>
          <button onClick={()=>zoomBy(1/1.25)} style={{width:32,height:32,borderRadius:9,border:"none",background:"rgba(44,38,32,0.85)",color:"#fff",fontSize:18,cursor:"pointer",lineHeight:1}}>-</button>
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
  const [session,setSession]=useState(null);
  const [shareToken,setShareToken]=useState(null);
  const [shareCopied,setShareCopied]=useState(false);
  const [muted,setMuted]=useState(true);
  const [audioHint,setAudioHint]=useState(true);
  const [editing,setEditing]=useState(false);
  const [showFriendsPanel,setShowFriendsPanel]=useState(false);
  const [demoMode,setDemoMode]=useState(false);
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
              <span style={{fontSize:22}}>??</span>
              <span style={{fontWeight:900,fontSize:20,color:"#1a1a1a"}}>Pinwall</span>
            </div>
            <div style={{fontFamily:"'Nunito',sans-serif",fontSize:13,color:"#888"}}>
              👀 Viewing {sharedView.label}
            </div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>{addFriend(sharedView.token,sharedView.label);alert('Added as friend!');}} style={{background:"#2a9d8f",color:"#fff",border:"none",borderRadius:20,padding:"6px 14px",fontFamily:"'Nunito',sans-serif",fontSize:11,fontWeight:700,cursor:"pointer"}}>? Add as friend</button>
              <button onClick={()=>{setSharedView(null);window.history.pushState({},'',window.location.pathname);}} style={{background:"#1a1a1a",color:"#fff",border:"none",borderRadius:20,padding:"6px 14px",fontFamily:"'Nunito',sans-serif",fontSize:11,fontWeight:700,cursor:"pointer"}}>Go to my wall</button>
            </div>
          </div>
          <div style={{flex:1}}><SharedWallView items={sharedView.items||[]} label={sharedView.label}/></div>
        </div>
      );
    }
    return <SharedWallView items={sharedView.items||[]} label={sharedView.label}/>;
  }

  if(!session&&!demoMode) return <Auth onTryDemo={()=>setDemoMode(true)}/>;

  if(demoMode){
    return(
      <div style={{fontFamily:"'Nunito',sans-serif",background:"#f3ead9",minHeight:"100vh"}}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;500;600;700&family=Nunito:wght@400;600;700;800;900&family=Permanent+Marker&display=swap');*{box-sizing:border-box;margin:0;padding:0;}@keyframes slideUp{from{transform:translateX(-50%) translateY(20px);opacity:0}to{transform:translateX(-50%) translateY(0);opacity:1}}@media(max-width:768px){.wall-toolbar{padding:6px 10px!important;bottom:60px!important}.wall-toolbar .tb-pill{padding:3px!important;gap:0!important}.wall-toolbar .tb-btn{padding:5px 8px!important;font-size:0!important;gap:4px!important}.wall-toolbar .tb-btn span{font-size:12px!important}.wall-toolbar .tb-pill button,.wall-toolbar .tb-pill label{font-size:0!important}.wall-toolbar .tb-pill button span,.wall-toolbar .tb-pill label span{font-size:14px!important}.photo-modal{flex-direction:column!important}.photo-modal-img{min-height:55vh!important}.photo-modal-comments{width:100%!important;max-height:40vh!important}.photo-modal-close{top:10px!important;right:10px!important}}`}</style>
        <div style={{position:"fixed",top:0,left:0,right:0,zIndex:100,padding:"16px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",pointerEvents:"none"}}>
          <div style={{display:"flex",alignItems:"center",gap:8,pointerEvents:"auto"}}>
            <span style={{fontSize:22,lineHeight:1,filter:"drop-shadow(0 2px 4px rgba(0,0,0,0.3))"}}>📌</span>
            <span style={{fontFamily:"'Nunito',sans-serif",fontWeight:900,fontSize:22,letterSpacing:"-0.02em",color:"#fff",textShadow:"0 2px 6px rgba(0,0,0,0.4)"}}>Pinwall Demo</span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8,pointerEvents:"auto"}}>
            <button onClick={()=>setEditing(e=>!e)} style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:36,height:36,borderRadius:"50%",border:"none",cursor:"pointer",fontSize:14,background:editing?"#2a9d8f":"rgba(30,30,30,0.7)",color:"#fff",boxShadow:"0 2px 6px rgba(0,0,0,0.25)"}}>{editing?"✓":"✏️"}</button>
            <button onClick={()=>setDemoMode(false)} style={{display:"inline-flex",alignItems:"center",gap:6,padding:"8px 16px",borderRadius:24,border:"none",cursor:"pointer",fontFamily:"'Nunito',sans-serif",fontSize:12,fontWeight:700,background:"rgba(30,30,30,0.85)",color:"#fff",boxShadow:"0 2px 8px rgba(0,0,0,0.3)"}}>Sign up to save</button>
          </div>
        </div>
        <HorizontalWall session={null} muted={false} editing={editing} setEditing={setEditing} username="demo"/>
      </div>
    );
  }

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
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;500;600;700&family=Nunito:wght@400;600;700;800;900&family=Permanent+Marker&display=swap');*{box-sizing:border-box;margin:0;padding:0;}::-webkit-scrollbar{width:6px;height:6px}::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.15);border-radius:3px}@media(max-width:768px){.pinwall-nav{height:44px!important;padding:0 10px!important}.pinwall-nav .logo-text{font-size:18px!important}.zoom-controls{display:none!important}.wall-toolbar{padding:6px 10px!important}.wall-toolbar .tb-pill{padding:3px!important;gap:0!important}.wall-toolbar .tb-btn{padding:5px 8px!important;font-size:0!important;gap:4px!important}.wall-toolbar .tb-btn span{font-size:12px!important}.wall-toolbar .tb-pill button,.wall-toolbar .tb-pill label{font-size:0!important}.wall-toolbar .tb-pill button span,.wall-toolbar .tb-pill label span{font-size:14px!important}.wall-toolbar{bottom:60px!important}.photo-modal-img{min-height:55vh!important}.photo-modal-comments{width:100%!important;max-height:40vh!important}.photo-modal-close{top:10px!important;right:10px!important}.photo-modal{flex-direction:column!important}}@keyframes slideUp{from{transform:translateX(-50%) translateY(20px);opacity:0}to{transform:translateX(-50%) translateY(0);opacity:1}}`}</style>
      <div className="pinwall-nav" style={{position:"fixed",top:0,left:0,right:0,zIndex:100,padding:"16px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",pointerEvents:"none"}}>
        <div style={{display:"flex",alignItems:"center",gap:8,pointerEvents:"auto"}}>
          <span style={{fontSize:22,lineHeight:1,filter:"drop-shadow(0 2px 4px rgba(0,0,0,0.3))"}}>📌</span>
          <span className="logo-text" style={{fontFamily:"'Nunito',sans-serif",fontWeight:900,fontSize:22,letterSpacing:"-0.02em",color:"#fff",textShadow:"0 2px 6px rgba(0,0,0,0.4)"}}>Pinwall</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8,pointerEvents:"auto"}}>
          <button onClick={()=>setEditing(e=>!e)} style={{display:"inline-flex",alignItems:"center",justifyContent:"center",padding:"8px 16px",borderRadius:24,border:"none",cursor:"pointer",fontSize:12,fontFamily:"'Nunito',sans-serif",fontWeight:700,background:editing?"#2a9d8f":"rgba(30,30,30,0.85)",color:"#fff",boxShadow:"0 2px 8px rgba(0,0,0,0.3)",gap:6}}>{editing?"✓ Done":"✏️ Edit wall"}</button>
          <div style={{position:"relative"}}>
            <button onClick={()=>{setMuted(m=>!m);setAudioHint(false);}} style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:36,height:36,borderRadius:"50%",border:"none",background:"rgba(30,30,30,0.7)",color:"#fff",fontSize:15,cursor:"pointer",boxShadow:"0 2px 6px rgba(0,0,0,0.25)"}}>{muted?"🔇":"🔊"}</button>
            {audioHint&&muted&&<div style={{position:"absolute",top:44,left:"50%",transform:"translateX(-50%)",background:"rgba(0,0,0,0.85)",borderRadius:10,padding:"8px 12px",whiteSpace:"nowrap",zIndex:200,boxShadow:"0 4px 12px rgba(0,0,0,0.3)"}}>
              <div style={{fontFamily:"'Nunito',sans-serif",fontSize:11,fontWeight:700,color:"#fff",textAlign:"center"}}>This wall has sound 🎵</div>
              <div style={{fontFamily:"'Nunito',sans-serif",fontSize:10,color:"rgba(255,255,255,0.6)",textAlign:"center",marginTop:2}}>Tap to activate</div>
              <div style={{position:"absolute",top:-5,left:"50%",transform:"translateX(-50%)",width:0,height:0,borderLeft:"6px solid transparent",borderRight:"6px solid transparent",borderBottom:"6px solid rgba(0,0,0,0.85)"}}/>
            </div>}
          </div>
          <div style={{position:"relative"}}>
            <button onClick={()=>setShowFriendsPanel(s=>!s)} style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:36,height:36,borderRadius:"50%",border:"none",background:showFriendsPanel?"#2a9d8f":"rgba(30,30,30,0.7)",color:"#fff",fontSize:15,cursor:"pointer",boxShadow:"0 2px 6px rgba(0,0,0,0.25)"}}>👥</button>
            {showFriendsPanel&&<div onClick={e=>e.stopPropagation()} style={{position:"absolute",top:44,right:0,width:320,maxHeight:420,background:"#fff",borderRadius:12,boxShadow:"0 8px 32px rgba(0,0,0,0.18)",border:"1px solid #e8e2d8",zIndex:300,overflow:"hidden",display:"flex",flexDirection:"column"}}>
              <div style={{padding:"14px 16px",borderBottom:"1px solid #eee"}}>
                <div style={{fontFamily:"'Nunito',sans-serif",fontSize:15,fontWeight:800,color:"#1a1a1a",marginBottom:8}}>Friends</div>
                <div style={{display:"flex",gap:6}}>
                  <input value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')searchUsers();}} placeholder="Search username..." style={{flex:1,padding:"7px 10px",border:"1px solid #ddd",borderRadius:8,fontFamily:"'Nunito',sans-serif",fontSize:12,outline:"none"}}/>
                  <button onClick={searchUsers} disabled={searching} style={{background:"#1a1a1a",color:"#fff",border:"none",borderRadius:8,padding:"7px 12px",fontFamily:"'Nunito',sans-serif",fontSize:11,fontWeight:700,cursor:"pointer",opacity:searching?0.6:1}}>Go</button>
                </div>
              </div>
              <div style={{flex:1,overflowY:"auto",padding:"10px 16px"}}>
                {searchResults.length>0&&<div style={{marginBottom:12}}>{searchResults.map(r=>(<div key={r.user_id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid #f0f0f0"}}><span style={{fontFamily:"'Nunito',sans-serif",fontSize:12,fontWeight:700}}>@{r.username}</span><button onClick={()=>addFriendFromSearch(r.user_id,r.username,r.token_id)} style={{background:"#2a9d8f",color:"#fff",border:"none",borderRadius:12,padding:"4px 10px",fontFamily:"'Nunito',sans-serif",fontSize:10,fontWeight:700,cursor:"pointer"}}>Add</button></div>))}</div>}
                {friends.length===0&&searchResults.length===0&&<div style={{fontFamily:"'Nunito',sans-serif",fontSize:12,color:"#999",textAlign:"center",padding:"20px 0"}}>No friends yet</div>}
                {friends.map(f=>(<div key={f.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid #f5f5f5"}}><span style={{fontFamily:"'Nunito',sans-serif",fontSize:12,fontWeight:700}}>@{f.nickname}</span><div style={{display:"flex",gap:4}}><button onClick={()=>{viewFriendWall(f.friend_token,f.nickname);setShowFriendsPanel(false);}} style={{background:"#2a9d8f",color:"#fff",border:"none",borderRadius:10,padding:"4px 8px",fontFamily:"'Nunito',sans-serif",fontSize:10,fontWeight:700,cursor:"pointer"}}>View</button><button onClick={()=>removeFriend(f.id)} style={{background:"none",border:"1px solid #ddd",borderRadius:10,padding:"4px 6px",fontSize:10,color:"#999",cursor:"pointer"}}>x</button></div></div>))}
              </div>
              <div style={{padding:"10px 16px",borderTop:"1px solid #eee"}}>
                <button onClick={copyShareLink} style={{width:"100%",background:"#1a1a1a",color:"#fff",border:"none",borderRadius:20,padding:"8px",fontFamily:"'Nunito',sans-serif",fontSize:11,fontWeight:700,cursor:"pointer"}}>{shareCopied?"Copied!":"Copy share link"}</button>
              </div>
            </div>}
          </div>
          <div onClick={()=>{window.__pinwall_view_applied=false;supabase.auth.signOut();}} style={{width:36,height:36,borderRadius:"50%",background:"linear-gradient(135deg,#e85d5d,#c0392b)",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Nunito',sans-serif",fontWeight:700,fontSize:13,cursor:"pointer",boxShadow:"0 2px 6px rgba(0,0,0,0.25)"}}>{(session.user.email?.[0]||'?').toUpperCase()}</div>
          {session.user.email==='sean92edwards@gmail.com'&&<button onClick={async()=>{const{data}=await supabase.from('walls').select('items').eq('user_id',session.user.id).single();if(data?.items){const homeView=JSON.parse(localStorage.getItem('pinwall_home_view')||'null');const exportData={items:data.items,homeView};const blob=new Blob([JSON.stringify(exportData)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='demo-wall.json';document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(url);alert('Downloaded demo-wall.json ('+data.items.length+' items'+(homeView?' + home view':'')+')');}}} style={{display:"inline-flex",alignItems:"center",padding:"6px 10px",borderRadius:16,border:"none",background:"rgba(30,30,30,0.7)",color:"#fff",fontSize:9,fontFamily:"'Nunito',sans-serif",fontWeight:700,cursor:"pointer"}}>Export demo</button>}
        </div>
      </div>
      <HorizontalWall session={session} muted={muted} editing={editing} setEditing={setEditing} username={username}/>
      {viewingFriend&&(
        <div style={{position:"fixed",inset:0,zIndex:200,display:"flex",flexDirection:"column",background:"#fff"}}>
          <div style={{background:"#fff",padding:"10px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"1px solid #e8e2d8",flexShrink:0}}>
            <button onClick={()=>setViewingFriend(null)} style={{background:"none",border:"1px solid #ddd",borderRadius:20,padding:"5px 14px",fontFamily:"'Nunito',sans-serif",fontSize:11,fontWeight:700,cursor:"pointer",color:"#888"}}>{"? Back"}</button>
            <div style={{fontFamily:"'Nunito',sans-serif",fontSize:14,fontWeight:700,color:"#2a2118"}}>{viewingFriend.nickname}{"'s Wall"}</div>
            <div style={{fontFamily:"'Nunito',sans-serif",fontSize:11,color:"#888"}}>Read only</div>
          </div>
          <div style={{flex:1}}><SharedWallView items={viewingFriend.items} label={viewingFriend.nickname}/></div>
        </div>
      )}
    </div>
  );
}
