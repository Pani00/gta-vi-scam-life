/* CONFIGURACIÓN - cambiá lo que quieras acá
   reservasInicial / cadaMs / sumaMax: contador de reservas (cadaMs 3000 = sube cada 3 segundos)
   ediciones: nombre, precio, imagen y lista de contenido de cada edición (podés agregar o quitar líneas)
   iva: lo que se muestra en el detalle de la compra
   tarjetaNombre, tarjetaUltimos: datos inventados que se ven en el método de pago
   procesoMs: cuánto dura el "Procesando compra..." (3500 = 3,5 segundos)
   pagoAutomatico: false = se paga al tocar el botón "Pagar"; true = procesa solo apenas se abre la ventana */
var CONFIG={
  reservasInicial:20405164,cadaMs:3000,sumaMax:3,
  iva:'$0,00',
  ediciones:[
    {nombre:'Standard',precio:'$79,99',img:'standard.jpg',items:[
      'Juego base completo',
      'Vintage Vice City Pack (comprando antes del 20 de nov de 2026)',
      '1 mes de GTA+ (digital)',
      'Precarga digital desde el 12 de nov de 2026']},
    {nombre:'Ultimate',precio:'$99,99',img:'ultimate.jpg',items:[
      'Juego base completo',
      'Mejora Ultimate Edition (vehículos, armas, ropa y contenido de historia exclusivos)',
      'Vintage Vice City Pack (comprando antes del 20 de nov de 2026)',
      '1 mes de GTA+ (digital)',
      'Precarga digital desde el 12 de nov de 2026']}
  ],
  tarjetaNombre:'Matias Nubesio',tarjetaUltimos:'3232',
  procesoMs:3500,
  pagoAutomatico:false
};

(function(){
  var $=function(i){return document.getElementById(i)};
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var CFG={
    ps:{store:'PLAYSTATION STORE - VINCULAR CUENTA',title:'Ingresá tu PSN ID',ph:'Tu PSN ID',name:'PlayStation 5',check:'PLAYSTATION STORE - CHECKOUT',pick:'PLAYSTATION STORE - ELEGIR EDICIÓN',done:'PLAYSTATION STORE - COMPRA CONFIRMADA',id:'PSN ID'},
    xb:{store:'XBOX - VINCULAR CUENTA',title:'Ingresá tu Gamertag',ph:'Tu Gamertag',name:'Xbox Series X/S',check:'XBOX - CHECKOUT',pick:'XBOX - ELEGIR EDICIÓN',done:'XBOX | MICROSOFT STORE - COMPRA CONFIRMADA',id:'Gamertag'}
  };
  var cur='ps',sel=CONFIG.ediciones[0];

  /* Cuenta regresiva */
  var target=new Date(2026,10,19,0,0,0).getTime();
  function pad(n){return String(n).padStart(2,'0')}
  function tick(){
    var t=Math.max(0,target-Date.now()),s=Math.floor(t/1000);
    $('d').textContent=pad(Math.floor(s/86400));
    $('h').textContent=pad(Math.floor(s%86400/3600));
    $('m').textContent=pad(Math.floor(s%3600/60));
    $('s').textContent=pad(s%60);
  }
  tick();setInterval(tick,1000);

  /* Contador de reservas */
  var res=CONFIG.reservasInicial;
  $('res').textContent=res.toLocaleString('es-AR');
  setInterval(function(){res+=1+Math.floor(Math.random()*CONFIG.sumaMax);$('res').textContent=res.toLocaleString('es-AR')},CONFIG.cadaMs);

  /* Popup */
  var lastBtn=null;
  function el(tag,cls,txt){var e=document.createElement(tag);if(cls)e.className=cls;if(txt)e.textContent=txt;return e}
  function openModal(p,btn){
    cur=p;lastBtn=btn;var c=CFG[p];
    $('modal').className='modal '+p;
    $('mt').textContent=c.store;
    var mb=$('mb');mb.textContent='';
    var back=el('button','back','← Volver a ediciones');back.type='button';back.onclick=closeModal;
    var h=el('h2','',c.title);
    var pr=el('p');pr.append('Vincularemos tu ');pr.append(el('b','','precompra'));pr.append(' a este perfil el día del lanzamiento.');
    var row=el('div','row');
    var inp=el('input');inp.type='text';inp.id='nick';inp.placeholder=c.ph;inp.maxLength=32;inp.autocomplete='off';inp.setAttribute('aria-label',c.ph);
    var go=el('button','go','Buscar');go.type='button';go.id='go';
    row.append(inp,go);
    var err=el('p','err');err.id='err';err.setAttribute('role','alert');
    mb.append(back,h,pr,row,err);
    function submit(){
      var v=inp.value.trim();
      if(!v){err.textContent='Escribí un nickname para continuar.';inp.focus();return}
      err.textContent='';go.disabled=true;go.textContent='Buscando...';
      setTimeout(function(){editions(v)},900);
    }
    go.onclick=submit;
    inp.onkeydown=function(e){if(e.key==='Enter')submit()};
    $('ov').hidden=false;
    setTimeout(function(){inp.focus()},50);
  }
  var payTimer=null,payTxt='';
  function closeModal(){clearTimeout(payTimer);$('ov').hidden=true;if(lastBtn)lastBtn.focus()}
  function editions(nick){
    var c=CFG[cur],mb=$('mb');
    $('modal').className='modal huge '+cur;
    $('mt').textContent=c.pick;
    mb.textContent='';
    var back=el('button','back','← Cambiar de cuenta');back.type='button';
    back.onclick=function(){openModal(cur,lastBtn)};
    var ban=el('div','banner');
    var bi=el('img');bi.src='img/banner.jpg';bi.alt='';bi.onerror=function(){bi.remove()};
    ban.append(bi);
    var h=el('h2','','Grand Theft Auto VI');
    var sub=el('p','','Elegí tu edición');
    var grid=el('div','eds');
    CONFIG.ediciones.forEach(function(ed,i){
      var card=el('div','ed '+(i===1?'hot':''));
      var im=el('div','edimg g'+(i%2));
      var ii=el('img');ii.src='img/'+ed.img;ii.alt='';ii.onerror=function(){ii.remove()};
      im.append(ii);
      var b=el('div','edb');
      var hd=el('div','edh');hd.append(el('span','','Edición '+ed.nombre),el('span','',ed.precio));
      var ul=el('ul');ed.items.forEach(function(t){ul.append(el('li','',t))});
      var btn=el('button','go','Seleccionar →');btn.type='button';
      btn.onclick=function(){sel=ed;checkout(nick)};
      b.append(hd,ul,btn);card.append(im,b);grid.append(card);
    });
    mb.append(back,ban,h,sub,grid);
  }
  function checkout(nick){
    var c=CFG[cur],mb=$('mb'),last4=CONFIG.tarjetaUltimos;
    var M={
      visa:{n:'Visa',sec:'Protegido por Visa Secure 2.0'},
      mc:{n:'Mastercard',sec:'Protegido por Mastercard Identity Check'},
      pp:{n:'PayPal',sec:'Protegido por PayPal'}
    };
    $('modal').className='modal wide '+cur;
    $('mt').textContent=c.check;
    mb.textContent='';
    var back=el('button','back','← Cambiar de edición');back.type='button';
    back.onclick=function(){clearTimeout(payTimer);editions(nick)};

    var prod=el('div','prod'),th=el('div','thumb');
    var img=el('img');img.src='img/miniatura.jpg';img.alt='';
    img.onerror=function(){img.remove()};
    th.append(img);
    var pi=el('div','pinfo');
    pi.append(el('strong','','Grand Theft Auto VI'),el('span','','Edición '+sel.nombre),
      el('small','','Lanzamiento → 19 de noviembre de 2026'),el('small','','Cuenta: '+nick));
    prod.append(th,pi);

    var sum=el('div','sum');
    function line(a,b,cls){var r=el('div','ln '+(cls||''));r.append(el('span','',a),el('span','',b));sum.append(r)}
    line('Edición '+sel.nombre,sel.precio);
    line('IVA (incluido)',CONFIG.iva);
    line('Total',sel.precio,'tot');

    var pml=el('p','pml','MÉTODO DE PAGO');
    var tabs=el('div','tabs'),tabBtns=[];
    function tab(k,label){
      var b=el('button','tab');b.type='button';b.setAttribute('aria-label',M[k].n);
      if(k==='visa')b.append(el('i','','VISA'));
      else if(k==='mc')b.append(el('span','mc r'),el('span','mc o'));
      else b.append(el('i','pp','PayPal'));
      b.onclick=function(){setMethod(k)};
      b.dataset.k=k;tabBtns.push(b);tabs.append(b);
    }
    tab('visa');tab('mc');tab('pp');

    var card=el('div','cardrow'),chip=el('div','chip visa');
    var ci=el('div','cinfo'),cn=el('span','','');
    ci.append(el('strong','',CONFIG.tarjetaNombre),cn);
    card.append(chip,ci);
    var sec=el('p','sec','');

    function setMethod(k){
      tabBtns.forEach(function(b){var on=b.dataset.k===k;b.classList.toggle('on',on);b.setAttribute('aria-pressed',on)});
      chip.className='chip '+k;
      cn.textContent=k==='pp'?'Cuenta de PayPal vinculada':'•••• '+last4+'  '+M[k].n;
      sec.textContent=M[k].sec;
      payTxt=k==='pp'?'PayPal':M[k].n+' •••• '+last4;
    }
    setMethod('visa');

    var pay=el('button','pay','Pagar '+sel.precio);pay.type='button';
    function startPay(){
      pay.disabled=true;pay.classList.add('busy');pay.textContent='';pay.setAttribute('role','status');
      pay.append(el('span','spin'),el('span','','Procesando compra...'));
      tabBtns.forEach(function(b){b.disabled=true});
      clearTimeout(payTimer);
      payTimer=setTimeout(function(){success(nick)},CONFIG.procesoMs);
    }
    pay.onclick=startPay;

    mb.append(back,prod,sum,pml,tabs,card,sec,pay);
    if(CONFIG.pagoAutomatico)startPay();
  }
  function success(nick){
    var c=CFG[cur],mb=$('mb');
    mb.textContent='';
    $('modal').className='modal wide '+cur;
    $('mt').textContent=c.done;
    function rnd(n){var s='',a='ABCDEFGHJKLMNPQRSTUVWXYZ0123456789';while(n--)s+=a[Math.floor(Math.random()*a.length)];return s}
    var ok=el('div','ok');

    /* Imagen de arriba: img/confirmacion.jpg (si no está, usa img/banner.jpg) */
    var ban=el('div','banner sm'),bi=el('img'),tried=false;
    bi.src='img/confirmacion.jpg';bi.alt='';
    bi.onerror=function(){if(!tried){tried=true;bi.src='img/banner.jpg'}else{bi.remove()}};
    ban.append(bi);

    var chk=el('div','');
    chk.innerHTML='<svg viewBox="0 0 80 80" role="img" aria-label="Festejar de nuevo"><circle cx="40" cy="40" r="30"/><path d="M27 41l9 9 18-20"/></svg>';
    chk.title='Tocá para festejar de nuevo';
    chk.onclick=celebrate;

    var h=el('h2','','¡Precompra completada!');
    var p=el('p','','Edición '+sel.nombre+' reservada para '+c.name+'. Vas a poder hacer la precarga antes del lanzamiento.');

    var det=el('div','sum det');
    function row(a,b,cls){var r=el('div','ln '+(cls||''));r.append(el('span','',a),el('span','',b));det.append(r)}
    var fecha=new Date().toLocaleString('es-AR',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'});
    row('Pedido',(cur==='xb'?'XBX':'PSN')+'-'+(1000+Math.floor(Math.random()*9000))+'-'+rnd(4));
    row('Fecha',fecha);
    row(c.id,nick);
    row('Edición','Edición '+sel.nombre);
    row('Pago',payTxt);
    row('Total cobrado',sel.precio,'hl');

    var done=el('button','go full','Listo');done.type='button';done.onclick=closeModal;
    ok.append(ban,chk,h,p,det,done);mb.append(ok);
    done.focus();
    celebrate();
  }
  document.querySelectorAll('.plat').forEach(function(b){b.addEventListener('click',function(){openModal(b.dataset.p,b)})});
  $('close').onclick=closeModal;
  $('ov').addEventListener('mousedown',function(e){if(e.target===$('ov'))closeModal()});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!$('ov').hidden)closeModal()});

  /* Festejo: confeti + fuegos artificiales */
  var cv=$('fx'),cx=cv.getContext('2d'),parts=[],run=false,COL=['#ff4f9a','#ffa14a','#38d6e8','#ffd84a','#b36bff','#ffffff'];
  function size(){cv.width=innerWidth;cv.height=innerHeight}
  size();addEventListener('resize',size);
  function confetti(x,y,ang,n,spread,pow){
    for(var i=0;i<n;i++){
      var a=ang+(Math.random()-.5)*spread,v=pow*(.5+Math.random()*.6);
      parts.push({x:x,y:y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,w:6+Math.random()*7,h:4+Math.random()*5,r:Math.random()*6,vr:(Math.random()-.5)*.4,c:COL[i%COL.length],g:.28,life:140+Math.random()*80,spark:false});
    }
  }
  function firework(x,y){
    var col=COL[Math.floor(Math.random()*5)];
    for(var i=0;i<46;i++){
      var a=Math.PI*2*i/46,v=2+Math.random()*4.5;
      parts.push({x:x,y:y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,w:3,h:3,r:0,vr:0,c:col,g:.06,life:60+Math.random()*30,spark:true,max:90});
    }
  }
  function loop(){
    cx.clearRect(0,0,cv.width,cv.height);
    parts=parts.filter(function(p){return p.life>0&&p.y<cv.height+40});
    parts.forEach(function(p){
      p.vy+=p.g;p.vx*=p.spark?.985:.992;p.x+=p.vx;p.y+=p.vy;p.r+=p.vr;p.life--;
      cx.globalAlpha=Math.min(1,p.life/(p.spark?30:40));
      cx.fillStyle=p.c;
      if(p.spark){cx.beginPath();cx.arc(p.x,p.y,p.w/2,0,7);cx.fill()}
      else{cx.save();cx.translate(p.x,p.y);cx.rotate(p.r);cx.fillRect(-p.w/2,-p.h/2,p.w,p.h);cx.restore()}
    });
    cx.globalAlpha=1;
    if(parts.length)requestAnimationFrame(loop);else run=false;
  }
  function start(){if(!run){run=true;requestAnimationFrame(loop)}}
  function celebrate(){
    var W=innerWidth,H=innerHeight;
    if(reduce){confetti(W/2,H*.4,-Math.PI/2,70,Math.PI,9);start();return}
    confetti(0,H,-Math.PI/3,110,.9,19);confetti(W,H,-Math.PI*2/3,110,.9,19);start();
    for(var i=0;i<9;i++){(function(i){setTimeout(function(){
      firework(W*(.12+Math.random()*.76),H*(.1+Math.random()*.35));
      if(i%2===0)confetti(W*Math.random(),-10,Math.PI/2,60,1.2,3);
      if(i%3===0){confetti(0,H,-Math.PI/3,40,.9,16);confetti(W,H,-Math.PI*2/3,40,.9,16)}
      start();
    },300+i*450)})(i)}
    setTimeout(function(){confetti(W/2,H*.55,-Math.PI/2,160,Math.PI*1.3,15);start()},2200);
    setTimeout(function(){confetti(W/2,H*.5,-Math.PI/2,160,Math.PI*1.3,16);start()},4300);
    var m=$('modal');m.classList.remove('glow');void m.offsetWidth;m.classList.add('glow');
  }
})();
