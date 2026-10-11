import struct,json,sys
sys.path.insert(0,__import__('os').path.dirname(__file__))
from dbf import read_dbf
base=sys.argv[1]; out=sys.argv[2]
_,rows=read_dbf(base+'.dbf')
idx=[i for i,r in enumerate(rows) if r['TOWNNAME']=='壯圍鄉']
shx=open(base+'.shx','rb').read(); shp=open(base+'.shp','rb')
feats=[]
for i in idx:
    off,_=struct.unpack('>ii',shx[100+i*8:108+i*8]); shp.seek(off*2+8)
    t=struct.unpack('<i',shp.read(4))[0]; assert t in (5,15),t
    shp.read(32); np_,npt=struct.unpack('<ii',shp.read(8))
    parts=list(struct.unpack('<%di'%np_,shp.read(4*np_)))
    pts=[struct.unpack('<2d',shp.read(16)) for _ in range(npt)]
    if t==15: pass
    parts.append(npt)
    rings=[[ [round(x,6),round(y,6)] for x,y in pts[parts[k]:parts[k+1]]] for k in range(np_)]
    # shapefile: outer rings clockwise; group holes (ccw) under preceding outer
    def area(r): return sum(r[j][0]*r[j+1][1]-r[j+1][0]*r[j][1] for j in range(len(r)-1))/2
    polys=[]
    for r in rings:
        if area(r)<0 or not polys: polys.append([r])
        else: polys[-1].append(r)
    r=rows[i]
    feats.append({"type":"Feature","properties":{k:r[k] for k in ('VILLCODE','VILLNAME','VILLENG')},
      "geometry":{"type":"MultiPolygon","coordinates":polys}})
    print(r['VILLNAME'],np_,'parts',npt,'pts')
feats.sort(key=lambda f:f['properties']['VILLCODE'])
json.dump({"type":"FeatureCollection","features":feats},open(out,'w'),ensure_ascii=False,separators=(',',':'))
