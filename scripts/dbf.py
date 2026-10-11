import struct,sys
def read_dbf(p):
    f=open(p,'rb'); h=f.read(32)
    n,hl,rl=struct.unpack('<IHH',h[4:12])
    fields=[]
    while True:
        d=f.read(32)
        if d[0]==0x0D: break
        fields.append((d[:11].split(b'\0')[0].decode(),chr(d[11]),d[16]))
    f.seek(hl); rows=[]
    for i in range(n):
        r=f.read(rl); o=1; row={}
        for name,t,l in fields:
            row[name]=r[o:o+l].decode('utf-8','replace').strip(); o+=l
        rows.append(row)
    return fields,rows
if __name__=='__main__':
    fl,rows=read_dbf(sys.argv[1]); print(fl); print(len(rows)); print(rows[0])
    for i,r in enumerate(rows):
        if any('壯圍' in v for v in r.values()): print(i,r)
