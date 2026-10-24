"""Finish native Premiere camera curves in a separate saved-project copy.
Premiere's XML importer omits the camera's Point parameter keys. Use the native
PointComponentParam format confirmed by keyframes authored in the UI, sampled
at 30 fps to preserve exact easing and avoid pan/scale interpolation mismatch.
The original project remains available; this copy is opened and rendered by Premiere.
"""
from pathlib import Path
import gzip,json,xml.etree.ElementTree as ET

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'out/premiere-computer-use'
source=OUT/'Workflow Maps - Transition Study.prproj'
root=ET.fromstring(gzip.decompress(source.read_bytes()))
ids={x.attrib.get('ObjectID'):x for x in root if 'ObjectID' in x.attrib}
uids={x.attrib.get('ObjectUID'):x for x in root if 'ObjectUID' in x.attrib}
plan=json.loads((OUT/'ai-focus/camera-plan.json').read_text());poses=plan['poses'];TPF=8467200000

def state(frame):
    t=frame/30
    for a,b in zip(poses,poses[1:]):
        if a['time']<=t<=b['time']:
            p=(t-a['time'])/(b['time']-a['time']);k=p*p*(3-2*p)
            s,left,top=[a[key]+(b[key]-a[key])*k for key in ['scale','left','top']]
            assert -1e-6<=left<=1920-1920/s+1e-6 and -1e-6<=top<=1080-1080/s+1e-6
            return s,s*(960-left)/1920,s*(540-top)/1080
    return 1,.5,.5

def motion_for(seq):
    groups=[ids[x.attrib['ObjectRef']] for x in seq.findall('TrackGroups/TrackGroup/Second')]
    group=next(g for g in groups if g.tag=='VideoTrackGroup')
    track=uids[group.find('TrackGroup/Tracks/Track').attrib['ObjectURef']]
    item=ids[track.find('ClipTrack/ClipItems/TrackItems/TrackItem').attrib['ObjectRef']]
    chain=ids[item.find('ClipTrackItem/ComponentOwner/Components').attrib['ObjectRef']]
    motion=next(ids[x.attrib['ObjectRef']] for x in chain.findall('ComponentChain/Components/Component') if ids[x.attrib['ObjectRef']].findtext('MatchName')=='AE.ADBE Motion')
    params=[ids[x.attrib['ObjectRef']] for x in motion.findall('Component/Params/Param')]
    return next(x for x in params if x.findtext('Name')=='Position'),next(x for x in params if x.findtext('Name')=='Scale')

for name,lo,hi in [('Workflow Maps - CURRENT - v6.1 AI focus',0,7545),('REVIEW - AI typing and map focus v6.1',5820,7245)]:
    seq=next(x for x in root.findall('Sequence') if x.findtext('Name')==name)
    position,scale=motion_for(seq)
    frames=sorted({lo,hi-1,*range(max(lo,5970),min(hi,7090))})
    point_keys=[];scale_keys=[]
    for frame in frames:
        s,x,y=state(frame);tick=frame*TPF
        point_keys.append(f'{tick},{x:.15f}:{y:.15f},0,0,0,0,0,0,5,4,0,0,0,0;')
        scale_keys.append(f'{tick},{s*100:.12f},0,0,0,0.166667,0,0.166667;')
    for param,keys in [(position,point_keys),(scale,scale_keys)]:
        if param.find('IsTimeVarying') is None:ET.SubElement(param,'IsTimeVarying').text='true'
        else:param.find('IsTimeVarying').text='true'
        if param.find('Keyframes') is None:ET.SubElement(param,'Keyframes')
        param.find('Keyframes').text=''.join(keys)
    properties=seq.find('Node/Properties')
    for tag in ['MZ.InPoint','MZ.OutPoint']:
        for child in list(properties.findall(tag)):properties.remove(child)
    if properties.find('MZ.EditLine') is not None:properties.find('MZ.EditLine').text=str((6630 if lo==0 else 810)*TPF)
    print(name, 'native point',position.attrib['ObjectID'],'scale',scale.attrib['ObjectID'],len(frames),'synchronized keys')
# Keep the incorrect import drafts clearly separate from the finished sequences.
for seq in root.findall('Sequence'):
    name=seq.find('Name')
    if name is not None and name.text in ['Workflow Maps - CURRENT - v6 AI focus','REVIEW - AI typing and map focus v6']:
        name.text='DRAFT - '+name.text
path=OUT/'Workflow Maps - AI focus final.prproj'
path.write_bytes(gzip.compress(ET.tostring(root,encoding='utf-8',xml_declaration=True)))
print('Wrote',path)
