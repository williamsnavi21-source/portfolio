/**
 * [INPUT]: 上传封面 IMG、静音预览 VIDEO、连续滚动位置、入场进度。
 * [OUTPUT]: createHeroRenderer，WebGL 全屏图像转场及资源清理。
 * [POS]: 首页呈现层；失败时交还 DOM 封面，不参与导航或手势决策。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
export function createHeroRenderer(canvas,images,videos,wake) {
  const gl=canvas.getContext('webgl',{alpha:false,antialias:false,powerPreference:'low-power'});
  if(!gl)return null;
  const vertex=`attribute vec2 aPosition;
    varying vec2 vUv;
    void main(){vUv=aPosition*.5+.5;gl_Position=vec4(aPosition,0.,1.);}`;
  const fragment=`precision highp float;
    varying vec2 vUv;
    uniform sampler2D uFrom,uTo;
    uniform vec2 uViewport,uFromSize,uToSize;
    uniform float uProgress,uEntrance;
    vec2 cover(vec2 uv,vec2 size){
      float imageAspect=size.x/size.y;
      float viewAspect=uViewport.x/uViewport.y;
      vec2 ratio=vec2(min(viewAspect/imageAspect,1.),min(imageAspect/viewAspect,1.));
      return (uv-.5)*ratio+.5;
    }
    void main(){
      float phase=sin(uProgress*3.14159265);
      vec2 uv=(vUv-.5)/(1.+(1.-uEntrance)*.14)+.5;
      float bend=sin(uv.y*3.14159265)*phase;
      uv.x=(uv.x-.5)*(1.-bend*.12)+.5;
      vec2 fromUv=uv+vec2(0.,uProgress*.16);
      vec2 toUv=uv-vec2(0.,(1.-uProgress)*.16);
      float boundary=uProgress+sin(uv.x*3.14159265)*phase*.08;
      float blend=1.-smoothstep(boundary-.09*phase-.001,boundary+.09*phase+.001,uv.y);
      vec4 a=texture2D(uFrom,cover(fromUv,uFromSize));
      vec4 b=texture2D(uTo,cover(toUv,uToSize));
      gl_FragColor=mix(a,b,blend);
    }`;
  const shaders=[],textures=[],listeners=[];
  let program,buffer,disposed=false;
  const release=()=>{
    disposed=true;
    listeners.forEach(([image,handler])=>image.removeEventListener('load',handler));
    textures.forEach(t=>gl.deleteTexture(t));shaders.forEach(s=>gl.deleteShader(s));
    if(buffer)gl.deleteBuffer(buffer);if(program)gl.deleteProgram(program);
  };
  const compile=(type,source)=>{
    const shader=gl.createShader(type);shaders.push(shader);
    gl.shaderSource(shader,source);gl.compileShader(shader);
    if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw new Error('Shader compilation failed');
    return shader;
  };
  try{
    program=gl.createProgram();
    gl.attachShader(program,compile(gl.VERTEX_SHADER,vertex));
    gl.attachShader(program,compile(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(program);
    if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error('Shader linking failed');
    gl.useProgram(program);buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
    const attribute=gl.getAttribLocation(program,'aPosition');
    gl.enableVertexAttribArray(attribute);gl.vertexAttribPointer(attribute,2,gl.FLOAT,false,0,0);
    const uniforms=Object.fromEntries(['uFrom','uTo','uViewport','uFromSize','uToSize','uProgress','uEntrance'].map(n=>[n,gl.getUniformLocation(program,n)]));
    const loaded=images.map(()=>false);
    const videoTimes=images.map(()=>-1);
    const sizes=images.map(()=>[1,1]);
    images.forEach((image,index)=>{
      const texture=gl.createTexture();textures.push(texture);gl.bindTexture(gl.TEXTURE_2D,texture);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array([0,0,0,255]));
      const upload=()=>{
        if(disposed||!image.naturalWidth)return;
        gl.bindTexture(gl.TEXTURE_2D,texture);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);
        if(videoTimes[index]>=0)return;
        gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);
        sizes[index]=[image.naturalWidth,image.naturalHeight];loaded[index]=true;wake();
      };
      listeners.push([image,upload]);image.addEventListener('load',upload);if(image.complete)upload();
    });
    return {
      draw(position,entrance){
        if(disposed||gl.isContextLost())return false;
        const from=Math.floor(position),to=Math.min(from+1,images.length-1);
        for(const index of new Set([from,to])) {
          const video=videos[index];
          if(video.readyState<2||!video.videoWidth||videoTimes[index]===video.currentTime)continue;
          gl.bindTexture(gl.TEXTURE_2D,textures[index]);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);
          gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,video);
          videoTimes[index]=video.currentTime;sizes[index]=[video.videoWidth,video.videoHeight];loaded[index]=true;
        }
        if(!loaded[from]||(position%1>.001&&!loaded[to]))return false;
        const ratio=Math.min(devicePixelRatio||1,1.75);
        const width=Math.round(canvas.clientWidth*ratio),height=Math.round(canvas.clientHeight*ratio);
        if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height;}
        gl.viewport(0,0,width,height);gl.useProgram(program);
        gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,textures[from]);
        gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,textures[loaded[to]?to:from]);
        gl.uniform1i(uniforms.uFrom,0);gl.uniform1i(uniforms.uTo,1);
        gl.uniform2f(uniforms.uViewport,width,height);
        gl.uniform2f(uniforms.uFromSize,...sizes[from]);
        gl.uniform2f(uniforms.uToSize,...sizes[loaded[to]?to:from]);
        gl.uniform1f(uniforms.uProgress,position-from);gl.uniform1f(uniforms.uEntrance,entrance);
        gl.drawArrays(gl.TRIANGLE_STRIP,0,4);return true;
      },dispose:release,
    };
  }catch{release();return null;}
}
