"""Prepare the CC0 MakeHuman dental asset. Requires numpy, scipy, scikit-image."""
from pathlib import Path
import json
import numpy as np
from scipy.sparse import coo_matrix
from scipy.sparse.csgraph import connected_components
from scipy.spatial import ConvexHull
from scipy.ndimage import gaussian_filter
from skimage.measure import marching_cubes

ROOT = Path(__file__).resolve().parents[1]
vertices, faces = [], []
for line in (ROOT / 'public/models/makehuman-teeth-source.obj').read_text().splitlines():
    if line.startswith('v '): vertices.append([float(x) for x in line.split()[1:4]])
    if line.startswith('f '): faces.append([int(x.split('/')[0])-1 for x in line.split()[1:]])
vertices = np.array(vertices)
edges = [(a,b) for f in faces for a,b in zip(f,f[1:]+f[:1])]
rows, cols = zip(*edges)
_, labels = connected_components(coo_matrix((np.ones(len(rows)),(rows,cols)),shape=(len(vertices),len(vertices))),directed=False)

def subdivide(v, fs):
    """Catmull–Clark subdivision with boundary preservation."""
    fp = np.array([v[f].mean(0) for f in fs])
    edges, adjacent, incident = {}, [[] for _ in v], [[] for _ in v]
    for fi,f in enumerate(fs):
        for a in f: adjacent[a].append(fi)
        for a,b in zip(f,f[1:]+f[:1]): edges.setdefault(tuple(sorted((a,b))),[]).append(fi)
    for e in edges:
        for a in e: incident[a].append(e)
    out = []
    for i,p in enumerate(v):
        boundary = [e[1] if e[0]==i else e[0] for e in incident[i] if len(edges[e])==1]
        if boundary: out.append(.75*p+.25*v[boundary].mean(0))
        else:
            n=len(adjacent[i]); r=np.array([v[list(e)].mean(0) for e in incident[i]]).mean(0)
            out.append((fp[adjacent[i]].mean(0)+2*r+(n-3)*p)/n)
    edge_ids={}
    for e, owners in edges.items():
        edge_ids[e]=len(out)
        out.append((v[list(e)].sum(0)+fp[owners].sum(0))/(2+len(owners)))
    face_start=len(out);out.extend(fp)
    result=[]
    for fi,f in enumerate(fs):
        for j,a in enumerate(f):result.append([a,edge_ids[tuple(sorted((a,f[(j+1)%len(f)])))],face_start+fi,edge_ids[tuple(sorted((f[j-1],a)))]])
    return np.array(out), result

teeth, all_v, all_f = [], [], []
for label in range(1,17):
    chosen=np.where(labels==label)[0]; remap={old:i for i,old in enumerate(chosen)}
    v=vertices[chosen].copy(); fs=[[remap[i] for i in f] for f in faces if labels[f[0]]==label]
    v[:,1]-=(v[:,1].min()+v[:,1].max())/2
    v[:,2]-=1.10;v*=10
    for _ in range(2):v,fs=subdivide(v,fs)
    teeth.append(v); base=len(all_v);all_v.extend(v)
    for f in fs:
        for i in range(1,len(f)-1):all_f.append([base+f[0],base+f[i],base+f[i+1]])

# Build a continuous, hollow tray around the tooth surfaces. A shared trim
# plane leaves its underside open; the narrow lip joins inner and outer walls.
v=np.array(all_v); step=.04
lower=v.min(0)-.18;upper=v.max(0)+.18
axes=[np.arange(a,b+step,step) for a,b in zip(lower,upper)]
field=np.full(tuple(map(len,axes)),10.,dtype=np.float32)
for tooth in teeth:
    eq=ConvexHull(tooth).equations
    lo=tooth.min(0)-.18;hi=tooth.max(0)+.18
    starts=[max(0,int((a-b)/step)) for a,b in zip(lo,lower)]
    ends=[min(len(axis),int((a-b)/step)+2) for a,b,axis in zip(hi,lower,axes)]
    slices=tuple(slice(a,b) for a,b in zip(starts,ends))
    grid=np.stack(np.meshgrid(*[axis[s] for axis,s in zip(axes,slices)],indexing='ij'),axis=-1)
    points=grid.reshape(-1,3); d=np.full(len(points),-10.)
    for plane in eq:d=np.maximum(d,points@plane[:3]+plane[3])
    field[slices]=np.minimum(field[slices],d.reshape(grid.shape[:-1]))
field=gaussian_filter(field,.65)
shell=np.maximum(field-.065,-(field-.008))
shell=np.maximum(shell,(-.30-axes[1])[None,:,None])
sv,sf,_,_=marching_cubes(shell,level=0,spacing=(step,step,step),gradient_direction='ascent')
sv+=lower

def packed(v,f):return {'positions':np.round(v,5).ravel().tolist(),'indices':np.array(f).ravel().tolist()}
output={'teeth':packed(all_v,all_f),'tray':packed(sv,sf)}
target=ROOT/'public/models/aligner-study.json'
target.write_text(json.dumps(output,separators=(',',':')))
assert np.isfinite(sv).all() and len(sf)>1000
print(f'{len(all_v)} tooth vertices; {len(sv)} tray vertices; {target.stat().st_size} bytes')
