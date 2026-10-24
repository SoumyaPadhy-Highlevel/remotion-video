"""Add deliberate AI reading/typing camera moves to the approved v5 title edit.
Only the clean picture clip receives native Premiere Motion keys. The v5 title
layers and soundtrack timing are preserved; each camera move is eased and held.
"""
from pathlib import Path
import copy, json, wave
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'out/premiere-computer-use'
AUDIT = OUT / 'ai-focus'
AUDIT.mkdir(exist_ok=True)
FPS = 30
# Time, scale, source crop's top-left, purpose. Each segment eases between
# these poses. Matching poses hold the view rather than continuously drifting.
POSES = [
    (0, 1, 0, 0, 'Approved steady framing'),
    (199.0, 1, 0, 0, 'Begin question close-up after title exits'),
    (199.8, 1.7, 150, 190, 'Read map overview request'),
    (202.0, 1.7, 150, 190, 'Hold through processing'),
    (202.65, 1, 0, 0, 'Return for answer title'),
    (205.2, 1, 0, 0, 'Answer title has cleared'),
    (205.9, 1.65, 150, 195, 'Read the streamed summary and needs-attention list'),
    (208.2, 1.65, 150, 195, 'Hold until the answer is readable'),
    (209.1, 1.35, 470, 160, 'Show highlighted errors on the map'),
    (210.6, 1.35, 470, 160, 'Hold on map result'),
    (211.55, 1, 0, 0, 'Wide before the next title'),
    (214.5, 1, 0, 0, 'Act title has cleared'),
    (215.15, 1.75, 150, 190, 'Read the Find all workflows typing'),
    (219.45, 1.75, 150, 190, 'Hold through the first action response'),
    (220.25, 1.75, 150, 405, 'Follow focus down to the composer'),
    (229.1, 1.75, 150, 405, 'Hold through create and move typing and confirmation'),
    (230.25, 1.4, 500, 205, 'Hand off to the new growth foundations folder'),
    (235.2, 1.4, 500, 205, 'Hold as moved workflows and connections resolve'),
    (236.3, 1, 0, 0, 'Return smoothly to full-map context'),
    (251.5, 1, 0, 0, 'Approved ending'),
]

POSES=[(round(p[0]*FPS)/FPS,*p[1:]) for p in POSES]


def pose(frame):
    t=frame/FPS
    for a,b in zip(POSES,POSES[1:]):
        if a[0] <= t <= b[0]:
            p=(t-a[0])/(b[0]-a[0]); k=p*p*(3-2*p)
            return tuple(a[i]+(b[i]-a[i])*k for i in range(1,4))
    return POSES[-1][1:4]


def node(parent,tag,text=None,**attrs):
    n=ET.SubElement(parent,tag,attrs)
    if text is not None:n.text=str(text)
    return n


def param(effect,identifier,name,values):
    p=node(effect,'parameter',authoringApp='PremierePro');node(p,'parameterid',identifier);node(p,'name',name)
    if identifier=='scale':node(p,'valuemin',0);node(p,'valuemax',1000)
    # Premiere infers a point parameter's type from its default value. Without
    # this value it discards the vector keys while still enabling animation.
    default=node(p,'value');first=values[0][1]
    if isinstance(first,tuple):node(default,'horiz',f'{first[0]:.8f}');node(default,'vert',f'{first[1]:.8f}')
    else:default.text=f'{first:.6f}'
    for frame,value in values:
        k=node(p,'keyframe');node(k,'when',frame);v=node(k,'value')
        if isinstance(value,tuple):node(v,'horiz',f'{value[0]:.8f}');node(v,'vert',f'{value[1]:.8f}')
        else:v.text=f'{value:.6f}'


def camera(clip,source_start,source_end):
    frames={source_start,source_end-1}
    for a,b in zip(POSES,POSES[1:]):
        lo,hi=round(a[0]*FPS),round(b[0]*FPS)
        if a[1:4] != b[1:4]:
            frames.update(range(max(source_start,lo),min(source_end,hi+1),2))
        if source_start<=lo<source_end:frames.add(lo)
        if source_start<=hi<source_end:frames.add(hi)
    for f in list(clip.findall('filter')):clip.remove(f)
    fx=node(node(clip,'filter'),'effect')
    for tag,val in [('name','Basic Motion'),('effectid','basic'),('effectcategory','motion'),('effecttype','motion'),('mediatype','video')]:node(fx,tag,val)
    scales=[];positions=[]
    for f in sorted(frames):
        s,left,top=pose(f)
        assert left>=-1e-6 and top>=-1e-6 and left+1920/s<=1920+1e-6 and top+1080/s<=1080+1e-6
        scales.append((f,s*100))
        positions.append((f,((s*(960-left)-960)/1920,(s*(540-top)-540)/1080)))
    param(fx,'scale','Scale',scales);param(fx,'rotation','Rotation',[(0,0)]);param(fx,'center','Center',positions);param(fx,'centerOffset','Anchor Point',[(0,(0,0))])
    clip.find('name').text='Steady picture + AI reading and map focus (native Motion)'

root=ET.parse(OUT/'Animated-type.xml').getroot()
children=root.find('project/children');full=children.find('sequence')
for s in list(children)[1:]:children.remove(s)
full.set('id','ai-focus-current');full.find('name').text='Workflow Maps - CURRENT - v6.1 AI focus'
camera(full.find('media/video/track/clipitem'),0,7545)
# Version all IDs consistently; media stays linked to the original image/video assets.
idmap={x.attrib['id']:'ai6-'+x.attrib['id'] for x in root.iter() if 'id' in x.attrib}
for x in root.iter():
    if 'id' in x.attrib:x.set('id',idmap[x.attrib['id']])
for time,scale,left,top,label in POSES[1:-1]:
    mark=node(full,'marker');node(mark,'name',label);node(mark,'in',round(time*FPS));node(mark,'out',-1)
review=copy.deepcopy(full);review.set('id','ai-focus-review');review.find('name').text='REVIEW - AI typing and map focus v6.1'
lo,hi=round(194*FPS),round(241.5*FPS);length=hi-lo
for tag in ['duration','out']:review.find(tag).text=str(length)
for track in review.findall('media/video/track')+review.findall('media/audio/track'):
    for c in list(track.findall('clipitem')):
        a,b=int(c.findtext('start')),int(c.findtext('end'));ca,cb=max(a,lo),min(b,hi)
        if ca>=cb:track.remove(c);continue
        source_in=int(c.findtext('in'))+ca-a
        c.find('start').text=str(ca-lo);c.find('end').text=str(cb-lo);c.find('in').text=str(source_in);c.find('out').text=str(source_in+cb-ca)
        c.set('id','review-'+c.attrib['id'])
        f=c.find('file')
        if f is not None:
            for child in list(f):f.remove(child)
        if track is review.find('media/video/track'):camera(c,lo,hi)
        else:assert a>=lo and b<=hi or c.find('sourcetrack') is not None, 'Title crosses the review boundary'
for m in list(review.findall('marker')):
    f=int(m.findtext('in'))
    if lo<=f<hi:m.find('in').text=str(f-lo)
    else:review.remove(m)
children.append(review)
ET.indent(root)
ET.ElementTree(root).write(OUT/'AI-focus.xml',encoding='utf-8',xml_declaration=True)
# Standalone corrected review import: Premiere stores Motion key times on the
# source media clock (the review's picture starts at source frame 5820).
review_only=copy.deepcopy(root)
rc=review_only.find('project/children'); rc.remove(rc.find('sequence'))
files={f.attrib['id']:f for f in full.findall('.//file') if len(f)}
seen=set()
for f in rc.findall('.//file'):
    fid=f.attrib['id']
    if fid not in seen:
        seen.add(fid)
        for child in files[fid]:f.append(copy.deepcopy(child))
ET.ElementTree(review_only).write(OUT/'AI-focus-review.xml',encoding='utf-8',xml_declaration=True)
with wave.open(str(OUT/'Full current soundtrack.wav'),'rb') as src:
    params=src.getparams();src.setpos(lo*1600);data=src.readframes(length*1600)
with wave.open(str(OUT/'AI focus review soundtrack.wav'),'wb') as dst:dst.setparams(params);dst.writeframes(data)
(AUDIT/'camera-plan.json').write_text(json.dumps({'fps':FPS,'reviewRange':[lo,hi],'poses':[{'time':p[0],'scale':p[1],'left':p[2],'top':p[3],'purpose':p[4]} for p in POSES]},indent=2))
print(f'Created AI-focus.xml: full 7545 frames; review {length} frames ({length/FPS}s); all crop bounds verified')
