import { Path, ellipsePath } from './geometry.js';
import { SeededRandom } from './prng.js';
import { drawFrame } from './organic.js';
import { planFigure, mapFacePoint } from './figure-primitives.js';

function add(layers, layer, path) {
  if (path.length > 0) layers[layer].push({ d: path.d, length: path.length });
}

/** A stroke comprised of cubic control triples, with no fills or transforms. */
function curve(layers, layer, start, segments, project = (p) => p) {
  const first = project(start);
  const line = new Path().moveTo(first[0], first[1]);
  for (const [a, b, c] of segments) {
    const p = project(a); const q = project(b); const r = project(c);
    line.cubicTo(p[0], p[1], q[0], q[1], r[0], r[1]);
  }
  add(layers, layer, line);
}

const seg = (a, b, c) => [a, b, c];
function single(layers, layer, p, a, b, q, project) {
  curve(layers, layer, p, [seg(a, b, q)], project);
}
function faceMap(plan) {
  return ([x, y]) => {
    const out = mapFacePoint(plan, x, y);
    return [out.x, out.y];
  };
}
function chooseFlow(curvature) {
  return 0.55 + curvature / 110;
}

/** Pencil-like face proportions, with genuine frontal/turned/profile profiles. */
function face(layers, plan) {
  const m = faceMap(plan);
  const side = plan.pose === 'profile';
  if (side) {
    // Forehead, nose, lips and chin form the visible right-hand profile.
    curve(layers, 'outlines', [-20, -40], [
      seg([-2, -47], [18, -42], [27, -25]),
      seg([29, -17], [26, -13], [31, -6]),
      seg([34, -1], [40, 3], [31, 5]),
      seg([27, 8], [27, 11], [30, 13]),
      seg([35, 15], [31, 17], [27, 19]),
      seg([21, 30], [10, 44], [-1, 46]),
      seg([-13, 42], [-23, 24], [-26, 2]),
    ], m);
    single(layers, 'detail', [8, -8], [16, -15], [23, -8], [27, -7], m);
    single(layers, 'detail', [9, -6], [15, -1], [22, -4], [25, -7], m);
    single(layers, 'detail', [26, 15], [22, 13], [20, 18], [27, 18], m);
    single(layers, 'detail', [-25, 3], [-17, -1], [-18, 14], [-24, 22], m);
  } else {
    curve(layers, 'outlines', [-27, -37], [
      seg([-38, -17], [-33, 12], [-23, 29]),
      seg([-12, 44], [-6, 48], [2, 47]),
      seg([17, 43], [33, 19], [31, -7]),
      seg([34, -28], [19, -43], [-7, -43]),
    ], m);
    // Distinguish far-side and near-side eyes with controlled perspective.
    const shift = plan.turn * 2.5;
    const eyes = plan.pose === 'front' ? [-15, 15] : [-13, 16];
    for (let i = 0; i < eyes.length; i++) {
      const centre = eyes[i] + shift;
      const width = i === 0 ? 9 - 2 * plan.turn : 9;
      single(layers, 'detail', [centre-width, -6],
        [centre-3, -12], [centre+4, -12], [centre+width, -7], m);
      single(layers, 'detail', [centre-width, -6],
        [centre-1, -2], [centre+5, -2], [centre+width, -7], m);
      single(layers, 'detail', [centre-width, -15],
        [centre-4, -19], [centre+5, -18], [centre+width, -14], m);
      single(layers, 'detail', [centre, -9], [centre-2, -4],
        [centre+3, -4], [centre+2, -9], m);
      // Delicate lashes, not filled areas.
      single(layers, 'detail', [centre+width-1, -7],
        [centre+width+1, -11], [centre+width+3, -12], [centre+width+4, -13], m);
    }
    single(layers, 'detail', [1, -6], [0, 8], [6, 13], [11, 15], m);
    single(layers, 'detail', [4, 18], [8, 19], [12, 18], [13, 17], m);
    single(layers, 'detail', [-8, 25], [-1, 22], [4, 22], [13, 24], m);
    single(layers, 'detail', [-8, 25], [-1, 29], [5, 29], [13, 24], m);
    single(layers, 'detail', [-4, 31], [1, 32], [6, 32], [10, 30], m);
    single(layers, 'detail', [22, -3], [29, 1], [29, 14], [24, 19], m);
    // One ear behind the visible cheek.
    single(layers, 'outlines', [-27, 1], [-42, -6], [-40, 18], [-27, 19], m);
  }
  // Front neck is defined by two slender flowing lines rather than a filled shape.
  single(layers, 'outlines', [-19, 30], [-21, 47], [-18, 56], [-22, 66], m);
  single(layers, 'outlines', [20, 30], [17, 48], [21, 55], [27, 65], m);
  single(layers, 'detail', [-8, 47], [-7, 53], [6, 60], [12, 61], m);
}

function dressAndBody(layers, plan, options) {
  const turn = plan.turn;
  const flow = chooseFlow(options.curvature);
  const left = plan.leftShoulder; const right = plan.rightShoulder;
  const neckL = mapFacePoint(plan, -20, 59);
  const neckR = mapFacePoint(plan, 26, 59);
  // Sweeping shoulders, arms, waist and skirt are deliberately continuous.
  curve(layers, 'outlines', [neckL.x, neckL.y], [
    seg([119, 216], [100, 215], [left.x, left.y]),
    seg([73, 251], [70-flow*10, 299], [66, 361]),
    seg([67, 379], [71, 389], [81, 390]),
  ]);
  curve(layers, 'outlines', [neckR.x, neckR.y], [
    seg([183, 215], [202, 217], [right.x, right.y]),
    seg([224+turn*5, 265], [233+flow*8, 329], [242, 366]),
    seg([244, 380], [237, 392], [222, 390]),
  ]);
  single(layers, 'outlines', [81, 390], [119, 399], [185, 399], [222, 390]);
  single(layers, 'outlines', [neckL.x, neckL.y], [132, 251], [151, 252], [155, 259]);
  single(layers, 'outlines', [neckR.x, neckR.y], [176, 244], [168, 257], [155, 259]);
  single(layers, 'detail', [86, 232], [113, 245], [113, 257], [123, 284]);
  single(layers, 'detail', [214, 236], [188, 250], [188, 264], [181, 281]);
  // Pleats follow elastic, asymmetrical curves rather than straight lines.
  for (let i = 0; i < 9; i++) {
    const t = i / 8;
    const x = 96 + t * 112;
    const y = 261 + 22*Math.sin(t * Math.PI);
    const endX = 79 + t*137 + (t-0.5)*8*flow;
    const endY = 379 - ((i % 3)*5);
    single(layers, 'detail', [x,y], [x-13*flow, y+41], [endX+11*flow, endY-39], [endX,endY]);
  }
  // Different costume grammars ensure genuine outline differences.
  if (options.dress === 'shawl') {
    curve(layers, 'outlines', [88, 231], [
      seg([105, 245], [159, 248], [215, 230]),
      seg([198, 278], [151, 293], [100, 264]),
    ]);
    single(layers, 'detail', [100,264], [126,283], [169,279], [202,254]);
    for(let i=0;i<6;i++){
      const x=110+i*16;
      single(layers,'detail',[x,248],[x-2,258],[x-5,259],[x-7,264]);
    }
  } else {
    // Architectural seaming and an art nouveau pendant at the neckline.
    single(layers, 'outlines', [123, 253], [130, 278], [143, 295], [150, 303]);
    single(layers, 'outlines', [183, 252], [169, 274], [158, 290], [150, 303]);
    add(layers, 'detail', ellipsePath(150, 266, 5.5, 10));
    single(layers, 'detail', [150, 276], [146, 287], [151, 288], [150, 297]);
  }
  // Hands as small stylised anatomical contours; deliberately modest detail.
  single(layers, 'outlines', [68, 355], [64, 365], [64, 378], [76, 384]);
  single(layers, 'detail', [71, 365], [66, 372], [71, 377], [76, 378]);
  single(layers, 'outlines', [239, 355], [246, 367], [241, 380], [230, 385]);
  single(layers, 'detail', [235, 365], [241, 371], [236, 378], [232, 378]);
}

function waveHair(layers, plan, options, rng) {
  const m=faceMap(plan);const flow=chooseFlow(options.curvature);
  // Silhouette: the hair crown wraps around the skull, then separates
  // into wind-swept locks falling over the shoulders.
  curve(layers, 'outlines', [-30,-25], [
    seg([-48,-48],[-33,-72],[-5,-70]),
    seg([24,-83],[47,-49],[42,-25]),
    seg([40,-4],[42,16],[32,34]),
  ],m);
  single(layers, 'outlines', [-30,-25], [-44,1], [-41,29], [-46,56], m);
  single(layers, 'outlines', [32,34], [42,49], [45,63], [35,79], m);
  single(layers, 'detail', [-31,-34], [-19,-61],[5,-69],[25,-53],m);
  single(layers, 'detail', [-28,-27], [-12,-47],[8,-43],[30,-31],m);
  single(layers, 'detail', [25,-53], [33,-42],[31,-27],[23,-23],m);
  for (const side of [-1,1]) {
    const x= side*34;
    // Individual strands vary independently but remain contained.
    for(let i=0;i<8;i++){
      const inward=i*2.4;
      const top=[x-side*inward,-35+i*3];
      const endY=65+i*6+rng.between(-3,3);
      const endX=x+side*(6+flow*10+i*1.5);
      single(layers, i<3?'outlines':'detail',top,
        [x+side*(13+flow*8),-5],
        [x-side*(15*flow),endY-27],
        [endX,endY],m);
    }
    // Curled termini punctuate the longer locks.
    single(layers, 'detail', [x+side*18,102],
      [x+side*28,106],[x+side*30,90],[x+side*20,91],m);
  }
}
function updoHair(layers, plan, options, rng) {
  const m=faceMap(plan); const flow=chooseFlow(options.curvature);
  // An Art Nouveau chignon and shell-shaped comb.
  curve(layers,'outlines',[-29,-30],[
    seg([-49,-63],[-12,-84],[17,-72]),
    seg([48,-63],[50,-24],[33,-3]),
  ],m);
  add(layers,'outlines',ellipsePath(plan.faceX,plan.faceY-70,22+flow*6,19+flow*3));
  single(layers,'outlines',[-29,-30],[-40,-6],[-33,28],[-30,45],m);
  single(layers,'outlines',[33,-3],[43,21],[29,42],[26,47],m);
  for(let i=0;i<11;i++){
    const delta=i-5;
    single(layers,'detail',[-27+5*i,-54],[-24+3*i,-69],
      [13+delta*2,-72-rng.between(1,6)],
      [15+delta*1.4,-54],m);
  }
  for(let i=0;i<6;i++){
    single(layers,'detail',[-19+i*6,-75],[-14+i*5,-89],
      [7+i*1.5,-91], [17+i*0.8,-75],m);
  }
  single(layers,'detail',[-30,4],[-35,29],[-26,45],[-19,61],m);
}
function braidHair(layers, plan, options) {
  const m=faceMap(plan); const flow=chooseFlow(options.curvature);
  curve(layers,'outlines',[-30,-33],[
    seg([-44,-62],[-8,-76],[20,-66]),
    seg([46,-49],[45,-16],[33,12]),
  ],m);
  single(layers,'detail',[-24,-35],[-18,-58],[5,-64],[24,-46],m);
  single(layers,'outlines',[-31,-27],[-40,3],[-33,27],[-33,47],m);
  // Braided sections alternate either side of a curved path.
  const side=-1;
  const x0=-32;
  for(let i=0;i<10;i++){
    const y=18+i*10;
    const x=x0-side*flow*(i*0.8);
    const w=9+2*flow;
    single(layers,'outlines',[x-w,y],
      [x-3,y+4],[x+w-1,y+7],[x+w,y+11],m);
    single(layers,'detail',[x+w,y],
      [x+2,y+5],[x-w+1,y+9],[x-w,y+12],m);
  }
  single(layers,'outlines',[-37,120],[-47,128],[-33,132],[-34,142],m);
  single(layers,'detail',[28,-37],[35,-16],[30,13],[24,25],m);
}

function ornament(layers, options, rng) {
  // Small independent botanical studies occupy the space between frame and
  // figure, and share the selected flower theme without overlapping the face.
  const petals=options.flower==='poppy'?5:options.flower==='iris'?3:6;
  const count=Math.max(0,Math.round(options.density/22));
  if (count === 0) return;
  for(const side of [-1,1]){
    const x=150+side*103;
    single(layers,'detail',[x,331],[x-side*16,267],[x+side*4,196],[x-side*7,147]);
    for(let i=0;i<count;i++){
      const y=175+i*34;
      const leafX=x-side*(3+(i%2)*4);
      const tipX=leafX-side*(12+4*(i%3));
      single(layers,'outlines',[leafX,y],
        [leafX-side*5,y-17],[tipX-side*6,y-12],[tipX,y-2]);
      single(layers,'outlines',[tipX,y-2],
        [tipX-side*2,y+10],[leafX-side*2,y+6],[leafX,y]);
      if (i%2===0){
        const cy=y-22, cx=x-side*5;
        for(let j=0;j<petals;j++){
          const a=j*2*Math.PI/petals;
          const tx=cx+8*Math.cos(a),ty=cy+8*Math.sin(a);
          single(layers,'detail',[cx,cy],
            [cx+5*Math.cos(a-0.5),cy+5*Math.sin(a-0.5)],
            [tx-2*Math.cos(a+0.5),ty-2*Math.sin(a+0.5)],
            [tx,ty]);
        }
      }
    }
    if(options.symmetry<100 && side>0){
      single(layers,'detail',[x,331],
        [x+3*rng.between(0,1),290],[x-5,250],[x+4,209]);
    }
  }
}

function inkShading(layers, plan, options) {
  const intensity=options.hatching/100;
  if(intensity<=0) return;
  const n=Math.max(1,Math.round(intensity*23));
  const flow=chooseFlow(options.curvature);
  for(let i=0;i<n;i++){
    const v=i/Math.max(n-1,1);
    const y=274+v*99;
    // Lightly curved dress folds, kept separate from outline layer.
    const x=96+v*12;
    single(layers,'hatching',[x,y],
      [x+4+flow*6,y+1],[x+10,y+5],[x+12+flow*4,y+8]);
    if(options.shading==='crosshatch'){
      single(layers,'hatching',[x+10,y],
        [x+9,y+4],[x+5,y+8],[x+1,y+11]);
    }
    const hX=plan.faceX-35+v*7;
    const hY=plan.faceY-18+v*78;
    single(layers,'hatching',[hX,hY],
      [hX+2,hY+3],[hX+6,hY+4],[hX+8,hY+6]);
  }
}

/** Four independent pen layers with bounded complexity and no raster data. */
export function buildFigureComposition(options) {
  const layers={frame:[],outlines:[],detail:[],hatching:[]};
  const seed=options.seed ?? 'figure';
  const rng=new SeededRandom(`${seed}|art-nouveau-figure`);
  const plan=planFigure(seed,options.figurePose);
  drawFrame(layers,options.frame??'arch');
  ornament(layers,options,rng);
  dressAndBody(layers,plan,options);
  face(layers,plan);
  if(options.hairstyle==='updo') updoHair(layers,plan,options,rng);
  else if(options.hairstyle==='braid') braidHair(layers,plan,options);
  else waveHair(layers,plan,options,rng);
  inkShading(layers,plan,options);
  return layers;
}