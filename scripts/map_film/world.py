"""The film's map worlds (world_*.json) as flat node lists, with the product's asset colours."""
import json, os

HERE = os.path.dirname(__file__)
ASSET_COLORS = {"tags": "#a855f7", "forms": "#14b8a6", "calendars": "#0ea5e9", "surveys": "#eab308", "pipelines": "#f59e0b",
                "funnels": "#f97316", "funnelPages": "#f45d48", "funnelProducts": "#e9a40b", "globalProducts": "#10b981",
                "users": "#84cc16", "videos": "#ef4444", "templates": "#8b5cf6", "contactCustomFields": "#20c5c7"}
# film blob hue (OpenCV-style degrees) of each type, for matching detections to world nodes
FILM_HUE = {"workflow": 222, "tags": 270, "forms": 172, "calendars": 198, "pipelines": 38, "funnels": 24, "funnelPages": 6,
            "funnelProducts": 42, "globalProducts": 160, "users": 84, "videos": 2, "contactCustomFields": 188}

def load(name="main"):
    w = json.load(open(os.path.join(HERE, f"world_{name}.json")))
    nodes = [dict(id=n["id"], kind="workflow", type="workflow", x=n["at"][0], z=n["at"][1], plane=n["plane"], label=n["label"], status=n["status"]) for n in w["workflows"]]
    nodes += [dict(id=n["id"], kind="asset", type=n["type"], x=n["at"][0], z=n["at"][1], plane=n["plane"], label=n.get("label")) for n in w["assets"]]
    return w, nodes
