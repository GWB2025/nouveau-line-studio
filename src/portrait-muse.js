import { Path, ellipsePath, localPoint } from './geometry.js';

/**
 * A deliberately hand-curated, original Art Nouveau pen drawing.
 * Sarah Bernhardt's floral-crowned Mucha poster provided the visual reference;
 * these are authored Bézier strokes, not an automated bitmap tracing.
 *
 * Canvas: 300 x 420; all strokes are open SVG pen centrelines.
 * The face, hair, lilies and shoulders remain identical across art seeds.
 */
export const PORTRAIT_CATALOGUE = Object.freeze([
  Object.freeze({
    id: 'muse-01',
    label: '01 — The Muse (frontal lilies)',
    reference: 'Alphonse Mucha, Sarah Bernhardt tribute poster (1896–1897)',
    status: 'ready',
  }),
]);

const layerSet = () => ({ frame: [], outlines: [], detail: [], hatching: [] });

function add(layers, layer, path) {
  if (path.length > 0) layers[layer].push({ d: path.d, length: path.length });
}

/** Each curve is [control 1 x/y, control 2 x/y, end x/y]. */
function draw(layers, layer, start, ...curves) {
  const path = new Path().moveTo(...start);
  for (const curve of curves) path.cubicTo(...curve);
  add(layers, layer, path);
}

function face(l) {
  // Continuous forehead/cheek/jaw, less schematic than the procedural portraits.
  draw(l, 'outlines', [119, 143],
    [111, 164, 111, 193, 121, 217],
    [127, 236, 141, 252, 155, 254],
    [174, 253, 190, 232, 196, 210],
    [203, 184, 196, 154, 183, 142]);
  // Hairline and natural parting, allowed to interrupt the upper forehead.
  draw(l, 'outlines', [116, 143], [124, 125, 139, 124, 150, 126],
    [166, 126, 178, 133, 185, 142]);
  draw(l, 'detail', [151, 125], [148, 133, 134, 139, 124, 140]);
  draw(l, 'detail', [159, 128], [171, 135, 177, 138, 183, 146]);

  // Left eyebrow, defined with two almost coincident expressive hairline curves.
  draw(l, 'detail', [124, 160], [129, 153, 141, 151, 149, 157]);
  draw(l, 'detail', [126, 162], [133, 158, 142, 157, 147, 160]);
  // Right eyebrow and temple, slightly arched for an asymmetrical expression.
  draw(l, 'detail', [164, 158], [172, 151, 184, 154, 190, 163]);
  draw(l, 'detail', [167, 160], [176, 157, 184, 159, 188, 165]);

  // Half-lidded almond-shaped eyes: thin upper lashes and restrained lower lids.
  draw(l, 'detail', [126, 172], [134, 166, 143, 167, 150, 173]);
  draw(l, 'detail', [127, 174], [134, 176, 143, 177, 150, 174]);
  draw(l, 'detail', [128, 170], [135, 164, 144, 166, 150, 172]);
  draw(l, 'detail', [165, 172], [172, 165, 182, 167, 190, 174]);
  draw(l, 'detail', [165, 174], [174, 177, 184, 178, 190, 174]);
  draw(l, 'detail', [167, 170], [176, 164, 183, 166, 188, 172]);
  // Eyelids cut across each iris rather than making big round eyes.
  draw(l, 'detail', [136, 170], [136, 174, 142, 175, 144, 171]);
  draw(l, 'detail', [176, 170], [176, 175, 183, 176, 184, 171]);
  draw(l, 'detail', [139, 171], [140, 172.5, 141, 172.5, 142, 171]);
  draw(l, 'detail', [179, 171], [180, 173, 181, 173, 182, 171]);
  // Fine outer corner and under-eye crease, without dark patches.
  draw(l, 'detail', [125, 172], [123, 172, 122, 170, 121, 169]);
  draw(l, 'detail', [190, 174], [192, 174, 193, 171, 195, 170]);
  draw(l, 'detail', [131, 184], [135, 187, 140, 187, 144, 184]);
  draw(l, 'detail', [171, 185], [177, 188, 183, 187, 186, 184]);

  // Nose: an indication of the bridge and two delicate nostril arcs.
  draw(l, 'detail', [155, 170], [155, 186, 160, 195, 161, 204]);
  draw(l, 'detail', [161, 204], [164, 207, 159, 211, 155, 210]);
  draw(l, 'detail', [151, 207], [148, 211, 144, 211, 143, 208]);
  draw(l, 'detail', [162, 211], [165, 210, 167, 207, 169, 208]);
  draw(l, 'detail', [149, 198], [150, 201, 151, 203, 151, 205]);

  // A restrained Cupid's bow, carefully split from the lower lip contour.
  draw(l, 'detail', [140, 223], [146, 218, 150, 218, 155, 221],
    [158, 218, 164, 218, 172, 223]);
  draw(l, 'detail', [140, 223], [149, 228, 164, 228, 172, 223]);
  draw(l, 'detail', [146, 230], [153, 233, 161, 233, 167, 230]);
  draw(l, 'detail', [153, 214], [154, 217, 154, 218, 154, 219]);
  draw(l, 'detail', [161, 214], [160, 217, 160, 218, 159, 219]);
  draw(l, 'detail', [148, 242], [153, 243, 160, 243, 165, 242]);
  // Very light modelling around cheek and chin.
  draw(l, 'detail', [121, 196], [122, 208, 126, 217, 131, 221]);
  draw(l, 'detail', [194, 193], [191, 207, 186, 217, 182, 221]);

  // Ears are partly hidden behind streaming hair, not symmetrical circles.
  draw(l, 'outlines', [114, 189], [105, 182, 105, 209, 119, 216]);
  draw(l, 'detail', [112, 199], [106, 191, 112, 209, 116, 208]);
  draw(l, 'outlines', [197, 184], [207, 179, 207, 203, 195, 214]);
  draw(l, 'detail', [198, 195], [204, 187, 201, 205, 195, 207]);
}

function neckAndCostume(l) {
  // Long neck and softly unequal shoulders inspired by classical posters.
  draw(l, 'outlines', [134, 237], [132, 264, 139, 284, 119, 294]);
  draw(l, 'outlines', [179, 238], [179, 264, 173, 283, 192, 295]);
  draw(l, 'detail', [136, 256], [139, 272, 149, 277, 153, 281]);
  draw(l, 'detail', [175, 260], [173, 276, 168, 280, 165, 283]);
  draw(l, 'outlines', [119, 294], [99, 297, 73, 306, 65, 339],
    [60, 355, 66, 371, 77, 376]);
  draw(l, 'outlines', [192, 295], [218, 299, 234, 320, 245, 342],
    [250, 358, 244, 369, 234, 377]);
  draw(l, 'outlines', [77, 376], [119, 389, 195, 388, 234, 377]);
  // Wide, graceful scalloped collar and elaborated dress edge.
  draw(l, 'outlines', [109, 302], [129, 315, 138, 322, 156, 329],
    [171, 324, 181, 312, 200, 302]);
  draw(l, 'detail', [109, 308], [133, 322, 140, 329, 156, 335],
    [171, 329, 187, 319, 201, 308]);
  draw(l, 'detail', [76, 347], [106, 352, 124, 356, 137, 378]);
  draw(l, 'detail', [234, 348], [212, 353, 199, 365, 184, 378]);
  draw(l, 'detail', [119, 296], [135, 299, 148, 302, 155, 304]);
  draw(l, 'detail', [194, 297], [179, 300, 165, 304, 156, 304]);
  add(l, 'detail', ellipsePath(156, 333, 4, 6));
  draw(l, 'detail', [156, 339], [150, 347, 162, 349, 155, 356]);
  for (const [x,delta] of [[88,4],[106,1],[124,-4],[184,3],[202,1],[220,-4]]) {
    draw(l, 'detail', [x, 351], [x+delta-5, 359, x+delta+3, 367, x+delta, 377]);
  }
}

function hair(l) {
  // A large asymmetrical crown: sweeping left fringe, lifted right curls.
  draw(l, 'outlines', [112, 154], [92, 139, 88, 115, 109, 104],
    [118, 87, 128, 86, 140, 94],
    [156, 73, 178, 81, 180, 96],
    [201, 85, 215, 107, 208, 119],
    [222, 139, 222, 161, 210, 171]);
  draw(l, 'outlines', [111, 147], [119, 129, 130, 113, 153, 114],
    [171, 115, 182, 121, 191, 141]);
  draw(l, 'detail', [105, 142], [106, 118, 128, 96, 152, 106],
    [172, 104, 190, 120, 196, 134]);
  draw(l, 'detail', [118, 119], [132, 99, 150, 97, 167, 103]);
  draw(l, 'detail', [152, 97], [160, 85, 171, 84, 178, 96]);
  draw(l, 'detail', [173, 105], [191, 94, 207, 110, 203, 128]);
  draw(l, 'detail', [97, 126], [83, 119, 93, 98, 108, 99]);
  draw(l, 'detail', [193, 117], [210, 110, 216, 131, 207, 146]);
  draw(l, 'outlines', [103, 146], [79, 165, 77, 201, 93, 225],
    [63, 261, 81, 286, 91, 291],
    [68, 325, 72, 347, 88, 359]);
  draw(l, 'outlines', [209, 150], [229, 175, 225, 202, 215, 228],
    [245, 256, 230, 283, 225, 297],
    [256, 328, 237, 356, 233, 368]);
  // Sweeping ribbons of hair, each a deliberate unique S-curve.
  const ribbons = [
    [[99,143],[84,164,101,191,89,215],[66,241,99,260,80,284],[65,307,71,339,89,348]],
    [[105,151],[97,181,109,204,94,225],[82,249,102,274,88,301],[75,318,82,346,98,359]],
    [[109,155],[102,181,119,211,103,235],[91,266,122,282,105,320],[98,340,104,363,119,367]],
    [[115,160],[104,185,130,209,112,246],[99,277,128,295,116,324],[114,345,125,362,139,363]],
    [[98,175],[80,208,79,231,96,250],[74,280,85,300,75,318],[65,341,78,361,94,369]],
    [[96,192],[75,222,87,249,73,266],[53,296,77,321,63,339],[55,353,67,365,78,363]],
    [[205,145],[224,176,202,197,216,224],[237,257,199,279,222,306],[248,326,233,350,219,362]],
    [[199,151],[222,190,195,209,209,238],[232,273,197,295,215,328],[234,351,220,369,202,366]],
    [[205,169],[212,198,197,223,208,247],[226,277,204,300,212,325],[220,350,205,360,193,367]],
    [[199,188],[198,207,191,225,204,248],[215,277,187,294,202,328],[210,354,188,367,179,369]],
    [[215,186],[231,214,214,234,226,260],[246,283,219,308,237,330],[251,349,238,364,224,369]],
    [[218,206],[239,232,231,246,240,268],[251,289,231,311,245,326],[259,348,246,371,231,375]],
  ];
  for (let i=0;i<ribbons.length;i++) {
    const [start,...curves] = ribbons[i];
    draw(l, i % 3 === 0 ? 'outlines' : 'detail', start, ...curves);
  }
  // Small loose coils and flyaway strands (Mucha's characteristic whiplash).
  draw(l, 'detail', [82, 299], [63, 302, 61, 282, 78, 279], [92, 278, 93, 295, 81, 307]);
  draw(l, 'detail', [229, 277], [253, 277, 259, 302, 240, 302], [222, 303, 233, 282, 244, 282]);
  draw(l, 'detail', [82, 340], [62, 344, 65, 366, 85, 373], [105, 380, 107, 360, 99, 355]);
  draw(l, 'detail', [235, 341], [263, 342, 266, 368, 245, 382], [223, 390, 213, 371, 220, 360]);
  draw(l, 'detail', [113, 146], [102, 160, 111, 176, 112, 183]);
  draw(l, 'detail', [200, 142], [209, 157, 204, 170, 201, 182]);
}

function lily(l, cx, cy, scale, tilt) {
  const petals = [
    [-1.7,-25],[7,-22],[18,-14],[15,4],[2,13],[-15,4],[-18,-11],
  ];
  const project = (x,y) => localPoint(cx,cy,tilt,x*scale,y*scale);
  for(let i=0;i<petals.length;i++) {
    const [x,y]=petals[i];
    const v=project(x,y), a=project(0,0), bend=project(x*0.55-y*0.24,y*0.55+x*0.24),
      other=project(x*0.55+y*0.24,y*0.55-x*0.24);
    draw(l,'outlines',[a.x,a.y],
      [bend.x,bend.y,v.x - (v.y-a.y)*0.08,v.y + (v.x-a.x)*0.08,v.x,v.y],
      [other.x,other.y,a.x,a.y,a.x,a.y]);
    const mid=project(x*0.5,y*0.5);
    draw(l,'detail',[a.x,a.y],[mid.x,mid.y,mid.x,mid.y,v.x,v.y]);
  }
  const c=ellipsePath(cx,cy,2.8*scale,3.2*scale);
  add(l,'detail',c);
}

function flowers(l) {
  lily(l,88,121,0.9,-0.37);
  lily(l,218,124,0.9,0.36);
  // Three long sparse leaves connect floral headpiece to curling hair.
  draw(l,'detail',[74,126],[62,115,72,92,80,90],[93,95,78,110,74,126]);
  draw(l,'detail',[231,133],[243,113,239,96,229,89],[214,93,224,115,231,133]);
  draw(l,'detail',[98,102],[84,89,91,77,105,80]);
  draw(l,'detail',[205,105],[216,89,223,81,236,91]);
}

function shading(l) {
  // Selective short and separated pen strokes: eye and neck modelling.
  const groups = [
    [115,191,7,3], [187,193,8,-3], [128,263,6,1], [177,263,6,-1],
    [124,284,8,3], [183,285,8,-3], [84,319,7,5], [224,323,7,-5],
  ];
  for(const [x,y,length,slant] of groups) {
    for(let i=0;i<3;i++) {
      draw(l,'hatching',[x+i*2.5,y+i*3.8],
        [x+length*0.33+i*2.5,y+1+i*3.8,
          x+length*0.67+i*2.5,y+slant+i*3.8,
          x+length+i*2.5,y+slant+0.5+i*3.8]);
    }
  }
}

export function buildMusePortrait() {
  const layers=layerSet();
  face(layers);
  neckAndCostume(layers);
  hair(layers);
  flowers(layers);
  shading(layers);
  return layers;
}