"""Native Premiere Motion/Opacity/Gaussian Blur animation for the title cards.
Static phrase plates preserve Poppins and the brand gradients. The timeline's
effect keyframes own all animation; only the hero's Maps layer scales on the drop.
"""
import copy
import importlib.util
import json
from pathlib import Path
import wave
import xml.etree.ElementTree as ET
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "out/premiere-computer-use/animated-type"
PLAN = json.loads((OUT / "plan.json").read_text())
FPS, END, DROP = PLAN["fps"], PLAN["end"], PLAN["impactFrame"]
spec = importlib.util.spec_from_file_location("premiere_xml_common", ROOT / "scripts/premiere-study-xml.py")
B = importlib.util.module_from_spec(spec)
spec.loader.exec_module(B)
B.OUT, B.STEADY, B.REFERENCE = OUT, True, OUT / "media/animated-picture.mp4"
B.FILES, B.CLIP_ID = {}, 0
N, rate, parameter = B.node, B.rate, B.parameter

# Name the image sequence once, then read each phrase's visible bounds. These
# bounds let the hero scale about its own centre instead of the canvas centre.
sources = sorted((OUT / "plates").glob("*.png"))
if len(sources) != len(PLAN["plates"]):
    raise RuntimeError(f"Expected {len(PLAN['plates'])} phrase plates, found {len(sources)}")
assets = {}
for source, plate in zip(sources, PLAN["plates"]):
    destination = OUT / "media" / plate["file"]
    if not destination.exists():
        destination.write_bytes(source.read_bytes())
    bbox = Image.open(destination).getchannel("A").getbbox()
    if bbox:
        assets[(plate["id"], plate["part"])] = (destination, bbox)

hero = next(c for c in PLAN["cards"] if c["kind"] == "hero")
maps_bbox = assets[(hero["id"], "accent")][1]
underline = OUT / "media/workflow-maps-underline.png"
if not underline.exists():
    image = Image.new("RGBA", (1920, 1080))
    draw = ImageDraw.Draw(image)
    left, right, top = maps_bbox[0], maps_bbox[2], maps_bbox[3] + 16
    for x in range(left, right):
        p = (x - left) / max(1, right - left - 1)
        color = tuple(round(a + (b-a)*p) for a,b in zip((21,94,239),(34,204,238)))
        draw.line([(x, top), (x, top + 5)], fill=(*color,255))
    image.save(underline)
assets[(hero["id"], "underline")] = (underline, Image.open(underline).getchannel("A").getbbox())


def clamp(x):
    return min(1., max(0., x))


def ease_out(x):
    return 1 - (1-clamp(x))**3


def interpolation(points, frame):
    for (a,va),(b,vb) in zip(points,points[1:]):
        if a <= frame <= b:
            return va+(vb-va)*(frame-a)/(b-a)
    return points[0][1] if frame < points[0][0] else points[-1][1]


def part_range(card, part):
    a,b = card["start"],card["end"]
    if card["kind"] == "hero":
        return {"kicker":(DROP-12,b-5), "main":(DROP-5,b-2), "accent":(DROP-4,b), "underline":(DROP+3,b)}[part]
    return {"kicker":(max(0,a-3),b-5), "main":(a,b-2), "accent":(a+3,b)}[part]


def state(card, part, frame):
    a,b = part_range(card,part)
    exit_frames = 7 if part != "kicker" else 6
    q = clamp((frame - (b-exit_frames-1))/exit_frames)
    x,y,scale,alpha,blur = 0.,0.,100.,100.,0.
    if card["kind"] == "hero":
        if part == "kicker":
            k = ease_out((frame-a)/8)
            y,alpha = 14*(1-k),100*k
        elif part == "main":
            k = ease_out((frame-a)/(DROP-a))
            x,y,alpha,blur = -56*(1-k),12*(1-k),100*k,8*(1-k)
        elif part == "accent":
            if frame <= DROP:
                k = ease_out((frame-a)/(DROP-a))
                y,scale,alpha,blur = 64*(1-k),90+20*k,100*k,11*(1-k)
            else:
                scale = interpolation([(DROP,110),(DROP+2,103),(DROP+4,99.4),(DROP+7,100.4),(DROP+9,100)],frame)
        elif part == "underline":
            k = ease_out((frame-a)/5)
            scale,alpha = 100*k,100
    else:
        k = ease_out((frame-a)/(6 if part == "kicker" else 10))
        x = 12*(1-k) if part == "accent" else 0
        y = (8 if part == "kicker" else 24 if part == "accent" else 28)*(1-k)
        alpha,blur = 100*k,(0 if part == "kicker" else 5)*(1-k)
    if q > 0:
        y -= 14*q**3
        alpha *= 1-q*q
        if part not in ("underline","kicker"):
            blur = max(blur,3*q*q)
    return x,y,scale,alpha,blur


def animate(c, card, part, clip_start, clip_end):
    _,bbox = assets[(card["id"],part)]
    cx,cy = (bbox[0]+bbox[2])/2,(bbox[1]+bbox[3])/2
    if part == "underline":
        cx = bbox[0]  # reveal the underline from its left edge
    a,b = part_range(card,part)
    entry_end = DROP+9 if card["kind"] == "hero" else a+10
    frames = {clip_start,clip_end-1}
    frames.update(f for f in range(clip_start,clip_end) if f <= entry_end or f >= b-9)
    positions,scales,alphas,blurs = [],[],[],[]
    for f in sorted(frames):
        x,y,sc,alpha,blur = state(card,part,f)
        # Scaling about each visible word/line keeps the other phrases fixed.
        x += (1-sc/100)*(cx-960)
        y += (1-sc/100)*(cy-540)
        local = f-clip_start
        positions.append((local,(x/1920,y/1080)))
        scales.append((local,sc));alphas.append((local,alpha));blurs.append((local,blur))
    motion = B.effect(c,"Basic Motion","basic")
    parameter(motion,"scale","Scale",keys=scales)
    parameter(motion,"rotation","Rotation",val=0)
    parameter(motion,"center","Center",keys=positions)
    parameter(motion,"centerOffset","Anchor Point",val=(0,0))
    parameter(B.effect(c,"Opacity","opacity"),"opacity","opacity",keys=alphas)
    if max(v for _,v in blurs) > 0:
        effect = B.effect(c,"Gaussian Blur","Gaussian Blur")
        effect.find("effecttype").text="filter"
        effect.find("effectcategory").text="Blur"
        parameter(effect,"radius","Radius",keys=blurs)
    c.find("labels/label2").text="Yellow" if card["kind"] == "hero" else "Lavender"


def sequence(parent,name,identifier,ranges):
    length = sum(b-a for a,b in ranges)
    seq = N(parent,"sequence",id=identifier)
    N(seq,"name",name);N(seq,"duration",length);rate(seq);N(seq,"in",0);N(seq,"out",length)
    time = N(seq,"timecode");rate(time);N(time,"string","00:00:00:00");N(time,"frame",0);N(time,"displayformat","NDF")
    media=N(seq,"media");video=N(media,"video");video.append(copy.deepcopy(B.TEMPLATE.find("media/video/format")))
    picture=N(video,"track")
    tracks={part:N(video,"track") for part in ["kicker","main","accent","underline"]}
    audio=N(media,"audio");N(audio,"numOutputChannels",2);audio.append(copy.deepcopy(B.TEMPLATE.find("media/audio/format")))
    music=N(audio,"track",premiereTrackType="Stereo")
    offset=0
    for lo,hi in ranges:
        B.clip(picture,"Steady picture - typography separated",B.REFERENCE,END,offset,offset+hi-lo,lo)
        B.clip(music,"Music - original timing",ROOT/"out/premiere-computer-use/Full current soundtrack.wav",END,offset,offset+hi-lo,lo,audio=True)
        for card in PLAN["cards"]:
            for part,track in tracks.items():
                if (card["id"],part) not in assets:
                    continue
                a,b=part_range(card,part);ca,cb=max(a,lo),min(b,hi)
                if ca>=cb:
                    continue
                path,_=assets[(card["id"],part)]
                c=B.clip(track,f"TYPE - {card['id']} - {part}",path,86400,offset+ca-lo,offset+cb-lo,still=True)
                animate(c,card,part,ca,cb)
            if lo<=card["start"]<hi:
                marker=N(seq,"marker");N(marker,"name",f"TYPE - {card['id']}");N(marker,"comment","Native Motion, Opacity and Gaussian Blur phrase animation; picture framing remains steady.");N(marker,"in",offset+card["start"]-lo);N(marker,"out",-1)
        for f,label in [(DROP,"DROP 1 - MAPS impact"),(DROP+9,"Secondary hit - title settles")]:
            if lo<=f<hi:
                marker=N(seq,"marker");N(marker,"name",label);N(marker,"comment","Aligned to the nearest 30 fps frame of the original soundtrack.");N(marker,"in",offset+f-lo);N(marker,"out",-1)
        offset+=hi-lo
    for track in [picture,*tracks.values(),music]:B.finish_track(track)
    N(music,"outputchannelindex",1)


root=ET.Element("xmeml",version="4");project=N(root,"project");N(project,"name","Workflow Maps - native animated typography")
children=N(project,"children")
sequence(children,"Workflow Maps - CURRENT - v5 animated type","type-current",[(0,END)])
ranges=[(DROP-36,hero["end"]+45)]
old=json.loads((ROOT/"out/premiere-computer-use/current-study/plan.json").read_text())
ranges.extend((s["patchStart"]-30,s["patchEnd"]+30) for s in old["scenes"])
trace = next(c for c in PLAN["cards"] if c["id"] == "chapter-2")
ranges[2] = (min(ranges[2][0],trace["start"]-12),ranges[2][1])
sequence(children,"REVIEW - Drop and animated text v5","type-review",ranges)
ET.indent(root)
path=OUT.parent/"Animated-type.xml";ET.ElementTree(root).write(path,encoding="utf-8",xml_declaration=True)
with wave.open(str(OUT.parent/"Full current soundtrack.wav"),"rb") as source:
    params=source.getparams();parts=[]
    for lo,hi in ranges:
        source.setpos(lo*1600);parts.append(source.readframes((hi-lo)*1600))
with wave.open(str(OUT.parent/"Animated type review soundtrack.wav"),"wb") as dest:
    dest.setparams(params);dest.writeframes(b"".join(parts))
(OUT/"review-ranges.json").write_text(json.dumps(ranges))
print(f"Created {path}; {len(PLAN['cards'])} cards, {len(B.FILES)} media assets; review {sum(b-a for a,b in ranges)/FPS:.2f}s")
