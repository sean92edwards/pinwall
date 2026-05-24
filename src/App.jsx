import { useState, useEffect, useRef } from "react";

const STICKERS = ["⭐","❤️","🌟","✨","🎉","🌈","🌸","🦋","🍀","🎨","🔥","💫","🌺","🦄","🍭","🌙","☀️","🎀","🐚","🍂","🦊","🐝","🍓","🎠","🌊","🪄","🏆","🎯","🎪","🎭","😂","😍","🥳","😭","🤩","😎","🥰","😅","🙌","👏"];

const BOOK_THEMES = [
  {bg:"#2c5f2e",spine:"#1e4220",text:"#a8d5aa",accent:"#5c9e5e"},
  {bg:"#8b1a1a",spine:"#5c1010",text:"#f0c4c4",accent:"#c44444"},
  {bg:"#1a3a5c",spine:"#102540",text:"#a0c4e8",accent:"#3a7abf"},
  {bg:"#5c3d1e",spine:"#3d2810",text:"#e8c99a",accent:"#a07040"},
  {bg:"#3d1a5c",spine:"#280f3d",text:"#c4a0e8",accent:"#7a3abf"},
  {bg:"#1a5c3d",spine:"#103d28",text:"#a0e8c4",accent:"#3abf7a"},
  {bg:"#4a4a1a",spine:"#323210",text:"#e8e49a",accent:"#9a9440"},
];

const BUBBLE_COLORS = ["#ffffff","#fff9c4","#fce4ec","#e3f2fd","#e8f5e9","#fde8c8","#f3e5f5","#e0f7fa"];

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
const ASPECTS = {landscape:{w:230,h:162},portrait:{w:152,h:214},square:{w:180,h:180},wide:{w:270,h:150},tall:{w:132,h:236}};
const SCATTER = [{cx:155,cy:145},{cx:385,cy:118},{cx:125,cy:345},{cx:410,cy:355},{cx:278,cy:470},{cx:530,cy:240}];

const INITIAL_ITEMS = [
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
function tb(bg,col){return{background:bg,color:col,border:"none",borderRadius:20,padding:"7px 15px",fontFamily:"'Lato',sans-serif",fontSize:11,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",cursor:"pointer",boxShadow:"0 1px 4px rgba(0,0,0,0.15)",transition:"opacity 0.15s"};}
function hdl(pos){const b={position:"absolute",zIndex:10,background:"#4a90e2",cursor:"grab",display:"flex",alignItems:"center",justifyContent:"center",color:"white",boxShadow:"0 1px 6px rgba(0,0,0,0.3)",border:"2px solid white"};if(pos==="top")return{...b,top:-30,left:"50%",transform:"translateX(-50%)",width:24,height:24,borderRadius:"50%",fontSize:14};if(pos==="br")return{...b,bottom:-5,right:-5,width:20,height:20,borderRadius:5,fontSize:11,cursor:"se-resize"};}

function HorizontalWall({subscribed}){
  const [items,setItems]=useState(INITIAL_ITEMS);
  const [editing,setEditing]=useState(false);
  const [selected,setSelected]=useState(null);
  const [editingText,setEditingText]=useState(null);
  const [maxZ,setMaxZ]=useState(20);
  const [showStickers,setShowStickers]=useState(false);
  const [showPhotos,setShowPhotos]=useState(false);
  const [adDismissed,setAdDismissed]=useState(false);
  const dragStart=useRef(null);
  const canvasRef=useRef(null);
  const scrollRef=useRef(null);
  const CANVAS_W=Math.max(2800,Math.max(...items.map(i=>i.cx+300)));
  const PIN_COLORS=["#e63946","#2a9d8f","#e9c46a","#a8dadc","#e76f51","#457b9d"];
  const bringToFront=id=>{const z=maxZ+1;setMaxZ(z);setItems(p=>p.map(i=>i.id===id?{...i,zIndex:z}:i));return z;};
  const startDrag=(e,id)=>{if(!editing)return;if(editingText===id)return;e.stopPropagation();bringToFront(id);setSelected(id);const item=items.find(i=>i.id===id);dragStart.current={mode:'move',id,mouseX:e.clientX,mouseY:e.clientY,cx:item.cx,cy:item.cy};};
  const startRotate=(e,id)=>{e.preventDefault();e.stopPropagation();const item=items.find(i=>i.id===id);const canvas=canvasRef.current?.getBoundingClientRect();if(!canvas)return;const screenCx=canvas.left+item.cx,screenCy=canvas.top+item.cy;const startAngle=Math.atan2(e.clientY-screenCy,e.clientX-screenCx)*(180/Math.PI);dragStart.current={mode:'rotate',id,startAngle,startRot:item.rot||0,canvasCx:item.cx,canvasCy:item.cy};};
  const startResize=(e,id)=>{e.preventDefault();e.stopPropagation();const item=items.find(i=>i.id===id);const rotRad=(item.rot||0)*Math.PI/180;dragStart.current={mode:'resize',id,mouseX:e.clientX,mouseY:e.clientY,startW:item.w||item.size||60,startH:item.h||item.size||60,rotRad};};
  useEffect(()=>{
    const onMove=e=>{const d=dragStart.current;if(!d)return;if(d.mode==='move'){const dx=e.clientX-d.mouseX,dy=e.clientY-d.mouseY;setItems(p=>p.map(i=>i.id===d.id?{...i,cx:d.cx+dx,cy:d.cy+dy}:i));}else if(d.mode==='rotate'){const canvas=canvasRef.current?.getBoundingClientRect();if(!canvas)return;const screenCx=canvas.left+d.canvasCx,screenCy=canvas.top+d.canvasCy;const angle=Math.atan2(e.clientY-screenCy,e.clientX-screenCx)*(180/Math.PI);setItems(p=>p.map(i=>i.id===d.id?{...i,rot:d.startRot+(angle-d.startAngle)}:i));}else if(d.mode==='resize'){const dx=e.clientX-d.mouseX,dy=e.clientY-d.mouseY;const cos=Math.cos(d.rotRad),sin=Math.sin(d.rotRad);const lx=cos*dx+sin*dy,ly=-sin*dx+cos*dy;setItems(p=>p.map(i=>{if(i.id!==d.id)return i;if(i.type==='sticker')return{...i,size:Math.max(24,d.startW+Math.max(lx,ly)*2)};if(i.type==='bubble')return{...i,scale:Math.max(0.5,1+(lx+ly)*0.003)};return{...i,w:Math.max(80,d.startW+lx*2),h:Math.max(60,d.startH+ly*2)};}));}};
    const onUp=()=>{dragStart.current=null;};
    window.addEventListener('mousemove',onMove);window.addEventListener('mouseup',onUp);
    return()=>{window.removeEventListener('mousemove',onMove);window.removeEventListener('mouseup',onUp);};
  },[]);
  const addSticker=emoji=>{const sl=scrollRef.current?.scrollLeft||0;setItems(p=>[{id:Date.now(),type:'sticker',emoji,cx:sl+80+Math.random()*300,cy:60+Math.random()*320,rot:(Math.random()-0.5)*30,size:50,zIndex:maxZ+1},...p]);setMaxZ(z=>z+1);setShowStickers(false);};
  const addBubble=()=>{const sl=scrollRef.current?.scrollLeft||0;const id=Date.now();setItems(p=>[{id,type:'bubble',text:"",cx:sl+120+Math.random()*250,cy:120+Math.random()*220,rot:(Math.random()-0.5)*8,color:"#ffffff",zIndex:maxZ+1},...p]);setMaxZ(z=>z+1);setEditing(true);setSelected(id);setEditingText(id);};
  const addPhoto=photo=>{const sl=scrollRef.current?.scrollLeft||0;const id=Date.now();setItems(p=>[{id,type:'polaroid',emoji:photo.emoji,caption:photo.caption,color:photo.color,cx:sl+100+Math.random()*280,cy:80+Math.random()*260,rot:(Math.random()-0.5)*12,w:148,h:148,zIndex:maxZ+1},...p]);setMaxZ(z=>z+1);setShowPhotos(false);};
  const sorted=[...items].sort((a,b)=>(a.zIndex||1)-(b.zIndex||1));
  return(
    <div style={{display:"flex",flexDirection:"column",height:"calc(100vh - 58px)"}}>
      <div style={{background:"#f5f0e8",borderBottom:"2px solid #ddd8ce",padding:"8px 20px",display:"flex",alignItems:"center",gap:10,flexShrink:0,flexWrap:"wrap",zIndex:90,position:"relative"}}>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <div style={{position:"relative"}}>
            <button onClick={()=>{setShowPhotos(p=>!p);setShowStickers(false);}} style={tb("#1a1a1a","#f5f0e8")}>📷 Photo</button>
            {showPhotos&&<div onClick={e=>e.stopPropagation()} style={{position:"absolute",top:40,left:0,background:"white",border:"1px solid #e0d8cc",borderRadius:10,padding:14,zIndex:200,boxShadow:"0 8px 32px rgba(0,0,0,0.15)",width:290}}>
              <div style={{fontFamily:"'Lato',sans-serif",fontSize:10,fontWeight:700,color:"#aaa",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:10}}>Pick a photo to pin</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
                {ALBUMS.flatMap(a=>a.photos).slice(0,12).map((p,i)=>(
                  <div key={i} onClick={()=>addPhoto(p)} style={{background:p.color,borderRadius:6,height:56,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:26,boxShadow:"0 2px 6px rgba(0,0,0,0.08)",transition:"transform 0.15s"}}
                    onMouseEnter={e=>e.currentTarget.style.transform="scale(1.08)"}
                    onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>{p.emoji}</div>
                ))}
              </div>
            </div>}
          </div>
          <div style={{position:"relative"}}>
            <button onClick={()=>{setShowStickers(s=>!s);setShowPhotos(false);}} style={tb("#e9c46a","#1a1a1a")}>⭐ Sticker</button>
            {showStickers&&<div onClick={e=>e.stopPropagation()} style={{position:"absolute",top:40,left:0,background:"#2c2c2c",border:"1px solid #3a3a3a",borderRadius:10,padding:12,zIndex:200,boxShadow:"0 8px 32px rgba(0,0,0,0.4)",width:256}}>
              <div style={{fontFamily:"'Lato',sans-serif",fontSize:10,fontWeight:700,color:"#666",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:8}}>Tap to add</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                {STICKERS.map((em,i)=><button key={i} onClick={()=>addSticker(em)} style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:7,padding:"5px 6px",fontSize:20,cursor:"pointer",lineHeight:1}} onMouseEnter={e=>e.currentTarget.style.transform="scale(1.3)"} onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>{em}</button>)}
              </div>
            </div>}
          </div>
          <button onClick={addBubble} style={tb("#a8dadc","#1a1a1a")}>💬 Bubble</button>
        </div>
        <div style={{marginLeft:"auto",display:"flex",gap:8,alignItems:"center"}}>
          {editing&&<span style={{fontFamily:"'Lato',sans-serif",fontSize:11,color:"#aaa"}}>drag · ↻ rotate · ⤡ resize · double-click bubble to edit</span>}
          <button onClick={()=>{setEditing(e=>!e);setSelected(null);setEditingText(null);setShowStickers(false);setShowPhotos(false);}} style={tb(editing?"#2a9d8f":"#2c2c2c",editing?"white":"#f5f0e8")}>{editing?"✓ Done":"✏️ Edit wall"}</button>
        </div>
      </div>
      <div ref={scrollRef} style={{flex:1,overflowX:"auto",overflowY:"hidden"}} onClick={()=>{if(editing){setSelected(null);setEditingText(null);setShowStickers(false);setShowPhotos(false);}}}>
        <div ref={canvasRef} style={{width:CANVAS_W,height:"100%",position:"relative",background:"#b8904a",backgroundImage:`radial-gradient(ellipse at 8% 50%,rgba(180,130,50,0.5) 0%,transparent 35%),radial-gradient(ellipse at 92% 30%,rgba(100,60,10,0.35) 0%,transparent 30%),url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0.4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.3'/%3E%3C/svg%3E")`,userSelect:"none"}}>
          <div style={{position:"absolute",inset:0,boxShadow:"inset 0 0 80px rgba(0,0,0,0.22)",pointerEvents:"none",zIndex:5}}/>
          <div style={{position:"absolute",top:14,left:18,fontFamily:"'Lato',sans-serif",fontSize:10,fontWeight:700,color:"rgba(255,255,255,0.3)",letterSpacing:"0.18em",textTransform:"uppercase",zIndex:4,pointerEvents:"none"}}>← Newest</div>
          <div style={{position:"absolute",top:14,right:18,fontFamily:"'Lato',sans-serif",fontSize:10,fontWeight:700,color:"rgba(255,255,255,0.15)",letterSpacing:"0.18em",textTransform:"uppercase",zIndex:4,pointerEvents:"none"}}>Oldest →</div>
          {sorted.map(item=>{
            const isSel=editing&&selected===item.id;
            if(item.type==='sticker')return(<div key={item.id} style={{position:"absolute",left:item.cx,top:item.cy,zIndex:item.zIndex||1,transform:`translate(-50%,-50%) rotate(${item.rot||0}deg)`,cursor:editing?"grab":"default",userSelect:"none"}} onMouseDown={e=>startDrag(e,item.id)}><div style={{fontSize:item.size||44,lineHeight:1,filter:"drop-shadow(1px 3px 6px rgba(0,0,0,0.22))"}}>{item.emoji}</div>{isSel&&<><div style={{position:"absolute",inset:-5,border:"1.5px dashed rgba(74,144,226,0.65)",borderRadius:6,pointerEvents:"none"}}/><div onMouseDown={e=>startRotate(e,item.id)} style={hdl("top")}>↻</div><div onMouseDown={e=>startResize(e,item.id)} style={hdl("br")}/></>}</div>);
            if(item.type==='bubble'){const isEditingThis=editingText===item.id;const scale=item.scale||1;return(<div key={item.id} style={{position:"absolute",left:item.cx,top:item.cy,zIndex:item.zIndex||1,transform:`translate(-50%,-50%) rotate(${item.rot||0}deg) scale(${scale})`,cursor:editing&&!isEditingThis?"grab":"default",userSelect:"none",minWidth:120,maxWidth:260}} onMouseDown={e=>{if(!isEditingThis)startDrag(e,item.id);}} onClick={e=>{if(editing){e.stopPropagation();bringToFront(item.id);setSelected(item.id);}}} onDoubleClick={e=>{if(editing){e.stopPropagation();setEditingText(item.id);}}}>
              <div style={{background:item.color||"#fff",borderRadius:18,padding:"10px 16px 12px",boxShadow:"2px 4px 18px rgba(0,0,0,0.2)",border:isSel?"1.5px dashed rgba(74,144,226,0.6)":"1.5px solid rgba(0,0,0,0.06)"}}>
                {isEditingThis?<textarea autoFocus defaultValue={item.text} onBlur={e=>{setItems(p=>p.map(i=>i.id===item.id?{...i,text:e.target.value}:i));setEditingText(null);}} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();setItems(p=>p.map(i=>i.id===item.id?{...i,text:e.target.value}:i));setEditingText(null);}}} placeholder="Type your message..." style={{background:"transparent",border:"none",outline:"none",fontFamily:"'Caveat',cursive",fontSize:19,color:"#333",resize:"none",width:180,minHeight:52,lineHeight:1.4,display:"block"}}/>:<div style={{fontFamily:"'Caveat',cursive",fontSize:19,color:"#333",lineHeight:1.4,whiteSpace:"pre-wrap",wordBreak:"break-word",minWidth:80,minHeight:28}}>{item.text||<span style={{color:"#bbb"}}>...</span>}</div>}
              </div>
              <div style={{position:"absolute",bottom:-13,left:26,width:0,height:0,borderLeft:"9px solid transparent",borderRight:"9px solid transparent",borderTop:`13px solid ${item.color||"#fff"}`}}/>
              {isSel&&!isEditingThis&&<><div onMouseDown={e=>startRotate(e,item.id)} style={hdl("top")}>↻</div><div onMouseDown={e=>startResize(e,item.id)} style={hdl("br")}>⤡</div><div style={{position:"absolute",top:-46,left:"50%",transform:"translateX(-50%)",display:"flex",gap:5,background:"rgba(0,0,0,0.75)",borderRadius:20,padding:"5px 8px",zIndex:20}} onClick={e=>e.stopPropagation()} onMouseDown={e=>e.stopPropagation()}>{BUBBLE_COLORS.map(c=><div key={c} onClick={()=>setItems(p=>p.map(i=>i.id===item.id?{...i,color:c}:i))} style={{width:16,height:16,borderRadius:"50%",background:c,border:item.color===c?"2px solid #4a90e2":"2px solid transparent",cursor:"pointer"}}/>)}</div></>}
            </div>);}
            if(item.type==='polaroid'){const pinColor=PIN_COLORS[item.id%PIN_COLORS.length];return(<div key={item.id} style={{position:"absolute",left:item.cx,top:item.cy,zIndex:item.zIndex||1,transform:`translate(-50%,-50%) rotate(${item.rot||0}deg)`,cursor:editing?"grab":"pointer",userSelect:"none"}} onMouseDown={e=>startDrag(e,item.id)} onMouseEnter={e=>{if(!editing){e.currentTarget.style.transform=`translate(-50%,-50%) rotate(${(item.rot||0)*0.3}deg) scale(1.06)`;e.currentTarget.style.zIndex=99;}}} onMouseLeave={e=>{if(!editing){e.currentTarget.style.transform=`translate(-50%,-50%) rotate(${item.rot||0}deg) scale(1)`;e.currentTarget.style.zIndex=item.zIndex;}}}>
              <div style={{position:"absolute",top:-12,left:"50%",transform:"translateX(-50%)",width:20,height:20,borderRadius:"50%",background:pinColor,boxShadow:"0 2px 8px rgba(0,0,0,0.35)",border:"2px solid rgba(255,255,255,0.5)",zIndex:2}}/>
              <div style={{background:"white",padding:"8px 8px 34px 8px",boxShadow:isSel?"5px 8px 28px rgba(0,0,0,0.35),0 0 0 2px rgba(74,144,226,0.55)":"4px 8px 22px rgba(0,0,0,0.3)",width:item.w||148}}>
                <div style={{width:"100%",height:item.h||148,background:item.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:Math.min(item.w||148,item.h||148)*0.4}}>{item.emoji}</div>
                <div style={{marginTop:5,fontFamily:"'Caveat',cursive",fontSize:14,color:"#444",textAlign:"center"}}>{item.caption}</div>
              </div>
              {isSel&&<><div onMouseDown={e=>startRotate(e,item.id)} style={hdl("top")}>↻</div><div onMouseDown={e=>startResize(e,item.id)} style={hdl("br")}>⤡</div></>}
            </div>);}
            return null;
          })}
        </div>
      </div>
      {!adDismissed&&!subscribed&&<div style={{background:"#f0ede8",borderTop:"1px solid #ddd",padding:"7px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}><span style={{fontFamily:"'Lato',sans-serif",fontSize:12,color:"#888"}}>📢 <strong style={{color:"#555"}}>Ad:</strong> Photobox — print your Pinwall as a poster.</span><button onClick={()=>setAdDismissed(true)} style={{background:"none",border:"1px solid #ccc",borderRadius:12,padding:"3px 10px",fontSize:11,color:"#aaa",cursor:"pointer"}}>✕</button></div>}
    </div>
  );
}function Bookshelf({onOpenAlbum}){
  const booksPerShelf=5;
  const shelves=[];
  for(let i=0;i<ALBUMS.length;i+=booksPerShelf)shelves.push(ALBUMS.slice(i,i+booksPerShelf));
  return(
    <div style={{background:"#0f0a06",minHeight:"calc(100vh - 58px)",padding:"44px 32px 60px",backgroundImage:"radial-gradient(ellipse at 50% 0%,rgba(120,80,20,0.14) 0%,transparent 55%)"}}>
      <div style={{fontFamily:"'Playfair Display',serif",fontSize:28,fontWeight:700,color:"#c8a96e",marginBottom:6}}>Your Library</div>
      <div style={{fontFamily:"'Lato',sans-serif",fontSize:12,color:"#444",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:44}}>Click any book to open it</div>
      {shelves.map((shelf,si)=>(
        <div key={si} style={{marginBottom:52}}>
          <div style={{display:"flex",alignItems:"flex-end",gap:0,paddingLeft:10,paddingRight:10,position:"relative"}}>
            {shelf.map((album,bi)=>{
              const theme=BOOK_THEMES[(album.id-1)%BOOK_THEMES.length];
              const rnd=seededRandom(album.id*313);
              const tilt=(rnd()-0.5)*2.5;
              return(
                <div key={album.id} style={{marginLeft:bi===2?10:0,display:"flex",alignItems:"flex-end"}}>
                  <div onClick={()=>onOpenAlbum(album)} style={{width:66,height:album.height,background:`linear-gradient(to right,${theme.spine} 0%,${theme.bg} 10%,${theme.bg} 90%,${theme.spine} 100%)`,cursor:"pointer",position:"relative",boxShadow:`3px 0 10px rgba(0,0,0,0.55),inset 3px 0 6px rgba(0,0,0,0.2)`,borderRadius:"1px 4px 4px 1px",transform:`rotate(${tilt}deg)`,transformOrigin:"bottom center",transition:"transform 0.2s,box-shadow 0.2s",userSelect:"none",borderTop:`3px solid ${theme.accent}`}}
                    onMouseEnter={e=>{e.currentTarget.style.transform=`rotate(${tilt}deg) translateY(-16px)`;e.currentTarget.style.boxShadow=`3px 10px 28px rgba(0,0,0,0.7),inset 3px 0 6px rgba(0,0,0,0.2)`;}}
                    onMouseLeave={e=>{e.currentTarget.style.transform=`rotate(${tilt}deg)`;e.currentTarget.style.boxShadow=`3px 0 10px rgba(0,0,0,0.55),inset 3px 0 6px rgba(0,0,0,0.2)`;}}>
                    <div style={{position:"absolute",top:14,left:0,right:0,textAlign:"center",fontSize:18}}>{album.emoji}</div>
                    <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",paddingTop:42,paddingBottom:18}}>
                      <div style={{writingMode:"vertical-rl",textOrientation:"mixed",transform:"rotate(180deg)",fontFamily:"'Caveat',cursive",fontSize:14,color:theme.text,textAlign:"center",lineHeight:1.2,maxHeight:"100%",overflow:"hidden",padding:"0 4px"}}>{album.name}</div>
                    </div>
                    <div style={{position:"absolute",bottom:14,left:8,right:8,height:1,background:theme.accent,opacity:0.4}}/>
                    <div style={{position:"absolute",top:3,bottom:3,right:-3,width:4,background:"linear-gradient(to right,#e0d4bc,#f5f0e8)",borderRadius:"0 2px 2px 0"}}/>
                  </div>
                </div>
              );
            })}
            {si===shelves.length-1&&<div style={{marginLeft:10}}><div style={{width:66,height:172,border:"2px dashed rgba(200,169,110,0.2)",borderRadius:3,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"rgba(200,169,110,0.35)",fontSize:26}} onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(200,169,110,0.5)";e.currentTarget.style.color="rgba(200,169,110,0.6)";}} onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(200,169,110,0.2)";e.currentTarget.style.color="rgba(200,169,110,0.35)";}}>+</div></div>}
          </div>
          <div style={{height:22,background:"linear-gradient(to bottom,#7a5c2e,#5c3d1e)",boxShadow:"0 6px 18px rgba(0,0,0,0.65)",borderRadius:"0 0 3px 3px"}}><div style={{height:2,background:"rgba(255,255,255,0.09)"}}/></div>
          <div style={{height:14,background:"linear-gradient(to bottom,rgba(0,0,0,0.45),transparent)"}}/>
        </div>
      ))}
    </div>
  );
}

function PhotoBook({album,onClose,subscribed}){
  const totalPages=Math.ceil(album.photos.length/4)+1;
  const [page,setPage]=useState(0);const [pendingPage,setPendingPage]=useState(1);
  const [flipping,setFlipping]=useState(false);const [flipDir,setFlipDir]=useState("forward");
  const [positions,setPositions]=useState(()=>initBookPositions(album.photos));
  const [maxZ,setMaxZ]=useState(album.photos.length+1);
  const [stickersByPage,setStickersByPage]=useState({});
  const [selectedId,setSelectedId]=useState(null);const [selectedType,setSelectedType]=useState(null);
  const [filmLifted,setFilmLifted]=useState(false);const [showStickers,setShowStickers]=useState(false);
  const [comments,setComments]=useState(album.comments);
  const [newComment,setNewComment]=useState("");const [newAuthor,setNewAuthor]=useState("");
  const [viewPhoto,setViewPhoto]=useState(null);
  const dragStart=useRef(null);const pageRef=useRef(null);
  const touchStartX=useRef(null);const pageStateRef=useRef(page);
  useEffect(()=>{pageStateRef.current=page;},[page]);
  const isBackPage=p=>p===totalPages-1;
  const goNext=()=>{if(flipping||page>=totalPages-1)return;const n=page+1;setPendingPage(n);setFlipDir("forward");setFlipping(true);setTimeout(()=>{setPage(n);setFlipping(false);},700);};
  const goPrev=()=>{if(flipping||page===0)return;const p=page-1;setPendingPage(p);setFlipDir("backward");setFlipping(true);setTimeout(()=>{setPage(p);setFlipping(false);},700);};
  const onTouchStart=e=>{touchStartX.current=e.touches[0].clientX;};
  const onTouchEnd=e=>{if(touchStartX.current===null)return;const dx=e.changedTouches[0].clientX-touchStartX.current;if(dx<-50)goNext();else if(dx>50)goPrev();touchStartX.current=null;};
  const bringToFront=(id,type)=>{const z=maxZ+1;setMaxZ(z);if(type==='photo')setPositions(p=>({...p,[id]:{...p[id],zIndex:z}}));else setStickersByPage(prev=>({...prev,[pageStateRef.current]:(prev[pageStateRef.current]||[]).map(s=>s.id===id?{...s,zIndex:z}:s)}));return z;};
  const startMove=(e,id,type)=>{if(!filmLifted)return;e.stopPropagation();bringToFront(id,type);setSelectedId(id);setSelectedType(type);const pos=type==='photo'?positions[id]:(stickersByPage[pageStateRef.current]||[]).find(s=>s.id===id);dragStart.current={mode:'move',id,type,page:pageStateRef.current,mouseX:e.clientX,mouseY:e.clientY,cx:pos.cx,cy:pos.cy};};
  const startRotate=(e,id,type)=>{e.preventDefault();e.stopPropagation();const pos=type==='photo'?positions[id]:(stickersByPage[pageStateRef.current]||[]).find(s=>s.id===id);const c=pageRef.current?.getBoundingClientRect();if(!c)return;dragStart.current={mode:'rotate',id,type,page:pageStateRef.current,startAngle:Math.atan2(e.clientY-(c.top+pos.cy),e.clientX-(c.left+pos.cx))*(180/Math.PI),startRot:pos.rot,canvasCx:pos.cx,canvasCy:pos.cy};};
  const startResize=(e,id,type)=>{e.preventDefault();e.stopPropagation();const pos=type==='photo'?positions[id]:(stickersByPage[pageStateRef.current]||[]).find(s=>s.id===id);dragStart.current={mode:'resize',id,type,page:pageStateRef.current,mouseX:e.clientX,mouseY:e.clientY,startW:pos.w||pos.size||60,startH:pos.h||pos.size||60,rotRad:(pos.rot||0)*Math.PI/180};};
  useEffect(()=>{
    const onMove=e=>{const d=dragStart.current;if(!d)return;const dx=e.clientX-d.mouseX,dy=e.clientY-d.mouseY;
      if(d.mode==='move'){if(d.type==='photo')setPositions(p=>({...p,[d.id]:{...p[d.id],cx:d.cx+dx,cy:d.cy+dy}}));else setStickersByPage(prev=>({...prev,[d.page]:(prev[d.page]||[]).map(s=>s.id===d.id?{...s,cx:d.cx+dx,cy:d.cy+dy}:s)}));}
      else if(d.mode==='rotate'){const c=pageRef.current?.getBoundingClientRect();if(!c)return;const angle=Math.atan2(e.clientY-(c.top+d.canvasCy),e.clientX-(c.left+d.canvasCx))*(180/Math.PI);const r=d.startRot+(angle-d.startAngle);if(d.type==='photo')setPositions(p=>({...p,[d.id]:{...p[d.id],rot:r}}));else setStickersByPage(prev=>({...prev,[d.page]:(prev[d.page]||[]).map(s=>s.id===d.id?{...s,rot:r}:s)}));}
      else if(d.mode==='resize'){const cos=Math.cos(d.rotRad),sin=Math.sin(d.rotRad);const lx=cos*dx+sin*dy,ly=-sin*dx+cos*dy;if(d.type==='sticker'){setStickersByPage(prev=>({...prev,[d.page]:(prev[d.page]||[]).map(s=>s.id===d.id?{...s,size:Math.max(28,d.startW+Math.max(lx,ly)*2)}:s)}));}else setPositions(p=>({...p,[d.id]:{...p[d.id],w:Math.max(60,d.startW+lx*2),h:Math.max(50,d.startH+ly*2)}}));}
    };
    const onUp=()=>{dragStart.current=null;};
    window.addEventListener('mousemove',onMove);window.addEventListener('mouseup',onUp);
    return()=>{window.removeEventListener('mousemove',onMove);window.removeEventListener('mouseup',onUp);};
  },[]);
  const addSticker=emoji=>{const rnd=seededRandom(Date.now()%9999);setStickersByPage(prev=>({...prev,[page]:[...(prev[page]||[]),{id:Date.now(),emoji,cx:180+rnd()*280,cy:100+rnd()*240,size:50,rot:(rnd()-0.5)*28,zIndex:maxZ+1}]}));setMaxZ(z=>z+1);};
  const submitComment=()=>{if(!newComment.trim()||!newAuthor.trim())return;setComments(c=>[...c,{id:Date.now(),author:newAuthor,text:newComment,date:new Date().toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"})}]);setNewComment("");setNewAuthor("");};
  const renderPage=pageNum=>{
    if(isBackPage(pageNum))return(<div style={{height:"100%",overflowY:"auto",padding:"28px 36px",background:"linear-gradient(160deg,#fdfaf4 0%,#f5eedf 100%)"}}>
      <div style={{fontFamily:"'Caveat',cursive",fontSize:32,color:"#2c2c2c",borderBottom:"2px solid #c8a96e",paddingBottom:10,marginBottom:24}}>📖 Guest Book</div>
      {comments.length===0&&<div style={{fontFamily:"'Caveat',cursive",fontSize:18,color:"#bbb",textAlign:"center",marginTop:40}}>Be the first to write in the guest book...</div>}
      {comments.map(c=><div key={c.id} style={{marginBottom:24,paddingBottom:20,borderBottom:"1px dashed #ddd"}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontFamily:"'Caveat',cursive",fontSize:20,fontWeight:700}}>{c.author}</span><span style={{fontFamily:"'Lato',sans-serif",fontSize:11,color:"#bbb"}}>{c.date}</span></div><div style={{fontFamily:"'Caveat',cursive",fontSize:18,color:"#555"}}>{c.text}</div></div>)}
      <div style={{background:"rgba(200,169,110,0.08)",border:"1px dashed #c8a96e",borderRadius:4,padding:"18px 20px",marginTop:12}}>
        <input value={newAuthor} onChange={e=>setNewAuthor(e.target.value)} placeholder="Your name" style={{border:"none",borderBottom:"1.5px solid #bbb",background:"transparent",fontFamily:"'Caveat',cursive",fontSize:18,color:"#333",outline:"none",width:"100%",padding:"4px 0",marginBottom:12}}/>
        <textarea value={newComment} onChange={e=>setNewComment(e.target.value)} placeholder="Leave a message..." style={{border:"none",borderBottom:"1.5px solid #bbb",background:"transparent",fontFamily:"'Caveat',cursive",fontSize:18,color:"#333",outline:"none",width:"100%",padding:"4px 0",resize:"none",height:60,display:"block"}}/>
        <button onClick={submitComment} style={{marginTop:12,background:"#2c2c2c",color:"#f5f0e8",border:"none",borderRadius:20,padding:"8px 22px",fontFamily:"'Lato',sans-serif",fontSize:12,fontWeight:700,cursor:"pointer"}}>Sign it ✍️</button>
      </div>
    </div>);
    const pagePhotos=album.photos.slice(pageNum*4,pageNum*4+4);
    const isCurrentPage=pageNum===page;
    const stickers=stickersByPage[pageNum]||[];
    const allItems=[...pagePhotos.map(p=>({...p,itemType:'photo',zIdx:positions[p.id]?.zIndex||1})),...stickers.map(s=>({...s,itemType:'sticker',zIdx:s.zIndex||1}))].sort((a,b)=>a.zIdx-b.zIdx);
    return(<div ref={isCurrentPage?pageRef:null} style={{width:"100%",height:"100%",position:"relative",background:"linear-gradient(160deg,#fdfaf4 0%,#f5eedf 100%)",display:"flex",flexDirection:"column"}} onClick={()=>{if(filmLifted&&isCurrentPage){setSelectedId(null);setSelectedType(null);}}}>
      {isCurrentPage&&!filmLifted&&<div style={{position:"absolute",inset:0,zIndex:30,background:"linear-gradient(135deg,rgba(255,255,255,0.22) 0%,rgba(200,185,160,0.1) 50%,rgba(255,255,255,0.08) 100%)",pointerEvents:"none"}}/>}
      <div style={{flex:1,position:"relative",overflow:"hidden"}}>
        {allItems.map(item=>{
          if(item.itemType==='sticker'){const s=item;const isSel=isCurrentPage&&filmLifted&&selectedId===s.id;return(<div key={`s-${s.id}`} style={{position:"absolute",left:s.cx,top:s.cy,zIndex:s.zIndex||1,transform:`translate(-50%,-50%) rotate(${s.rot||0}deg)`,cursor:filmLifted&&isCurrentPage?"grab":"default"}} onMouseDown={e=>{if(filmLifted&&isCurrentPage){e.stopPropagation();bringToFront(s.id,'sticker');setSelectedId(s.id);setSelectedType('sticker');startMove(e,s.id,'sticker');}}}><div style={{fontSize:s.size||48,lineHeight:1}}>{s.emoji}</div>{isSel&&<><div style={{position:"absolute",inset:-4,border:"1.5px dashed rgba(80,120,255,0.5)",borderRadius:4,pointerEvents:"none"}}/><div onMouseDown={e=>startRotate(e,s.id,'sticker')} style={hdl("top")}>↻</div><div onMouseDown={e=>startResize(e,s.id,'sticker')} style={hdl("br")}/></>}</div>);}
          const photo=item;const pos=positions[photo.id];if(!pos)return null;
          const isSel=isCurrentPage&&filmLifted&&selectedId===photo.id;
          return(<div key={`p-${photo.id}`} style={{position:"absolute",left:pos.cx,top:pos.cy,width:pos.w,height:pos.h,transform:`translate(-50%,-50%) rotate(${pos.rot}deg)`,zIndex:pos.zIndex,background:"white",padding:"7px",boxShadow:"2px 5px 18px rgba(0,0,0,0.22)",cursor:filmLifted&&isCurrentPage?"grab":"pointer"}} onMouseDown={e=>{e.stopPropagation();if(filmLifted&&isCurrentPage)startMove(e,photo.id,'photo');}} onClick={()=>{if(!filmLifted)setViewPhoto(photo);else{bringToFront(photo.id,'photo');setSelectedId(photo.id);setSelectedType('photo');}}}>
            <div style={{width:"100%",height:"100%",background:photo.color,display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{fontSize:Math.min(pos.w,pos.h)*0.4}}>{photo.emoji}</div></div>
            {isSel&&<><div onMouseDown={e=>startRotate(e,photo.id,'photo')} style={hdl("top")}>↻</div><div onMouseDown={e=>startResize(e,photo.id,'photo')} style={hdl("br")}>⤡</div></>}
          </div>);
        })}
      </div>
      {!subscribed&&pageNum%2===1&&isCurrentPage&&<div style={{background:"rgba(240,240,235,0.95)",borderTop:"1px dashed #ccc",padding:"7px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}><div style={{fontFamily:"'Lato',sans-serif",fontSize:12,color:"#666"}}>🖨️ Print this album — Photobox</div><button style={{background:"#1a1a1a",color:"white",border:"none",borderRadius:16,padding:"5px 12px",fontFamily:"'Lato',sans-serif",fontSize:11,fontWeight:700,cursor:"pointer"}}>From £12.99</button></div>}
      {showStickers&&isCurrentPage&&filmLifted&&<div style={{background:"#2c2c2c",borderTop:"2px solid #c8a96e",padding:"10px 16px",flexShrink:0}}><div style={{display:"flex",flexWrap:"wrap",gap:5}}>{STICKERS.slice(0,20).map((em,i)=><button key={i} onClick={()=>addSticker(em)} style={{background:"rgba(255,255,255,0.06)",border:"none",borderRadius:7,padding:"5px",fontSize:20,cursor:"pointer"}}>{em}</button>)}</div></div>}
    </div>);
  };
  const flipOrigin=flipDir==="forward"?"left center":"right center";
  const frontT=flipping?(flipDir==="forward"?"rotateY(-180deg)":"rotateY(180deg)"):"rotateY(0deg)";
  const backT=flipping?"rotateY(0deg)":(flipDir==="forward"?"rotateY(180deg)":"rotateY(-180deg)");
  return(<div style={{position:"fixed",inset:0,zIndex:200,background:"rgba(15,10,5,0.9)",display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(4px)"}}>
    <style>{`@keyframes peelIn{from{opacity:0;transform:perspective(800px) rotateX(6deg) translateY(16px) scale(0.97);}to{opacity:1;transform:none;}}.bnav{background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.12);cursor:pointer;border-radius:50%;width:40px;height:40px;display:flex;align-items:center;justify-content:center;font-size:16px;color:#f5f0e8;}.bnav:hover:not(:disabled){background:rgba(255,255,255,0.16);}.bnav:disabled{opacity:0.2;cursor:default;}`}</style>
    <div style={{background:"#faf7f2",width:"min(94vw,720px)",height:"min(90vh,640px)",borderRadius:3,boxShadow:"0 50px 120px rgba(0,0,0,0.7)",display:"flex",flexDirection:"column",overflow:"hidden",animation:"peelIn 0.4s ease",border:"1px solid #c8b89a"}}>
      <div style={{background:"#2c2c2c",color:"#f5f0e8",padding:"10px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"3px solid #c8a96e",flexShrink:0}}>
        <div><div style={{fontFamily:"'Caveat',cursive",fontSize:24}}>{album.name}</div><div style={{fontFamily:"'Lato',sans-serif",fontSize:10,color:"#999",letterSpacing:"0.1em",textTransform:"uppercase"}}>{isBackPage(page)?"Guest Book":`Page ${page+1} of ${totalPages-1}`}</div></div>
        <div style={{display:"flex",gap:8}}>
          {!isBackPage(page)&&<><button onClick={()=>{setFilmLifted(f=>!f);if(filmLifted)setShowStickers(false);}} style={{background:filmLifted?"#c8a96e":"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.2)",color:filmLifted?"#1a1a1a":"#f5f0e8",borderRadius:20,padding:"4px 12px",fontFamily:"'Lato',sans-serif",fontSize:10,fontWeight:700,cursor:"pointer"}}>{filmLifted?"📌 Film on":"🖐 Lift film"}</button>{filmLifted&&<button onClick={()=>setShowStickers(s=>!s)} style={{background:showStickers?"#e9c46a":"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.2)",color:showStickers?"#1a1a1a":"#f5f0e8",borderRadius:20,padding:"4px 12px",fontFamily:"'Lato',sans-serif",fontSize:10,fontWeight:700,cursor:"pointer"}}>⭐</button>}</>}
          <button onClick={onClose} style={{background:"none",border:"1px solid rgba(255,255,255,0.2)",color:"#aaa",borderRadius:"50%",width:30,height:30,cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
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
    {viewPhoto&&<div onClick={()=>setViewPhoto(null)} style={{position:"fixed",inset:0,zIndex:300,background:"rgba(0,0,0,0.94)",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:16}}><div style={{background:"white",padding:"8px 8px 28px 8px",maxWidth:380,width:"90%",transform:"rotate(-1deg)"}}><div style={{background:viewPhoto.color,height:320,display:"flex",alignItems:"center",justifyContent:"center",fontSize:110}}>{viewPhoto.emoji}</div><div style={{marginTop:8,fontFamily:"'Caveat',cursive",fontSize:18,color:"#555",textAlign:"center"}}>{viewPhoto.caption}</div></div><div style={{fontFamily:"'Lato',sans-serif",fontSize:11,color:"#555",letterSpacing:"0.1em",textTransform:"uppercase"}}>Click anywhere to close</div></div>}
  </div>);
}

export default function Pinwall(){
  const [view,setView]=useState("wall");
  const [openAlbum,setOpenAlbum]=useState(null);
  const [subscribed,setSubscribed]=useState(false);
  const [showSubscribe,setShowSubscribe]=useState(false);
  const [plan,setPlan]=useState("annual");
  return(<div style={{fontFamily:"'Georgia',serif",background:"#1a1a1a",minHeight:"100vh"}}>
    <style>{`@import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&family=Playfair+Display:wght@400;700;900&family=Lato:wght@300;400;700&display=swap');*{box-sizing:border-box;margin:0;padding:0;}::-webkit-scrollbar{width:6px;height:6px}::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.15);border-radius:3px}`}</style>
    <div style={{background:"#f5f0e8",borderBottom:"3px solid #1a1a1a",padding:"0 24px",display:"flex",alignItems:"center",justifyContent:"space-between",height:58,position:"sticky",top:0,zIndex:100}}>
      <div style={{display:"flex",alignItems:"center",gap:12}}>
        <div style={{width:34,height:34,background:"#1a1a1a",borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>📌</div>
        <span style={{fontFamily:"'Playfair Display',serif",fontWeight:900,fontSize:24,letterSpacing:"-0.02em"}}>Pinwall</span>
        <span style={{fontFamily:"'Lato',sans-serif",fontSize:10,fontWeight:700,letterSpacing:"0.18em",textTransform:"uppercase",color:"#aaa",marginTop:5}}>Photos. Not noise.</span>
      </div>
      <div style={{display:"flex",background:"#e8e3db",borderRadius:24,padding:3,gap:2}}>
        {[["wall","📌 My Wall"],["shelf","📚 Library"]].map(([v,label])=>(<button key={v} onClick={()=>setView(v)} style={{background:view===v?"#1a1a1a":"none",color:view===v?"#f5f0e8":"#888",border:"none",borderRadius:20,padding:"6px 16px",fontFamily:"'Lato',sans-serif",fontSize:12,fontWeight:700,cursor:"pointer",transition:"all 0.2s"}}>{label}</button>))}
      </div>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        {subscribed?<div style={{background:"#c8a96e",borderRadius:20,padding:"5px 14px",fontFamily:"'Lato',sans-serif",fontSize:11,fontWeight:700,color:"#1a1a1a"}}>✨ Ad-free</div>:<button onClick={()=>setShowSubscribe(true)} style={{background:"none",border:"2px solid #1a1a1a",borderRadius:20,padding:"5px 14px",fontFamily:"'Lato',sans-serif",fontSize:11,fontWeight:700,cursor:"pointer"}}>Remove ads</button>}
        <div style={{width:36,height:36,borderRadius:"50%",background:"#1a1a1a",color:"#f5f0e8",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Playfair Display',serif",fontWeight:700,fontSize:15}}>S</div>
      </div>
    </div>
    {view==="wall"&&<HorizontalWall subscribed={subscribed}/>}
    {view==="shelf"&&<Bookshelf onOpenAlbum={setOpenAlbum}/>}
    {showSubscribe&&<div onClick={()=>setShowSubscribe(false)} style={{position:"fixed",inset:0,zIndex:400,background:"rgba(0,0,0,0.75)",display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(4px)"}}>
      <div onClick={e=>e.stopPropagation()} style={{background:"white",borderRadius:8,padding:"36px 32px",maxWidth:360,width:"90%",textAlign:"center"}}>
        <div style={{fontSize:36,marginBottom:8}}>✨</div>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:26,fontWeight:700,marginBottom:8}}>Go ad-free</div>
        <div style={{fontFamily:"'Lato',sans-serif",fontSize:13,color:"#888",marginBottom:28,lineHeight:1.6}}>Support Pinwall and remove all ads.</div>
        <div style={{display:"flex",background:"#f0ede8",borderRadius:24,padding:4,marginBottom:24,gap:4}}>
          {["monthly","annual"].map(p=><button key={p} onClick={()=>setPlan(p)} style={{flex:1,background:plan===p?"#1a1a1a":"none",color:plan===p?"white":"#888",border:"none",borderRadius:20,padding:"8px 0",fontFamily:"'Lato',sans-serif",fontSize:12,fontWeight:700,cursor:"pointer"}}>{p==="annual"?"Annual ★":"Monthly"}</button>)}
        </div>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:42,fontWeight:900,marginBottom:4}}>{plan==="annual"?"$18":"$2.49"}<span style={{fontSize:16,fontWeight:400,color:"#aaa"}}>{plan==="annual"?"/year":"/mo"}</span></div>
        {plan==="annual"&&<div style={{fontFamily:"'Lato',sans-serif",fontSize:12,color:"#2a9d8f",fontWeight:700,marginBottom:4}}>Save 40% vs monthly</div>}
        <div style={{fontFamily:"'Lato',sans-serif",fontSize:11,color:"#bbb",marginBottom:24}}>{plan==="annual"?"That's just $1.50 per month":"Cancel anytime"}</div>
        <button onClick={()=>{setSubscribed(true);setShowSubscribe(false);}} style={{width:"100%",background:"#1a1a1a",color:"white",border:"none",borderRadius:28,padding:"14px",fontFamily:"'Lato',sans-serif",fontSize:14,fontWeight:700,cursor:"pointer",marginBottom:10}}>Get started →</button>
        <button onClick={()=>setShowSubscribe(false)} style={{background:"none",border:"none",fontFamily:"'Lato',sans-serif",fontSize:12,color:"#bbb",cursor:"pointer"}}>Maybe later</button>
      </div>
    </div>}
    {openAlbum&&<PhotoBook album={openAlbum} onClose={()=>setOpenAlbum(null)} subscribed={subscribed}/>}
  </div>);
}