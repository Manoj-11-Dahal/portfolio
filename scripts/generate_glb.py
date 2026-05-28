#!/usr/bin/env python3
"""Generate a real visible blackhole.glb.

The file contains:
1. Standard glTF mesh geometry so normal GLB viewers show a black hole model.
2. Extra scene nodes/metadata used by the website renderer for detailed canvas animation.
"""
import json
import math
import os
import struct

out_dir = os.path.join(os.path.dirname(__file__), '..', 'public', 'models')
os.makedirs(out_dir, exist_ok=True)
out_path = os.path.join(out_dir, 'blackhole.glb')

buffer = bytearray()
buffer_views = []
accessors = []
meshes = []
nodes = []
links = []


def align4():
    while len(buffer) % 4:
        buffer.append(0)


def add_buffer_view(data: bytes, target=None):
    align4()
    offset = len(buffer)
    buffer.extend(data)
    view = {"buffer": 0, "byteOffset": offset, "byteLength": len(data)}
    if target:
        view["target"] = target
    buffer_views.append(view)
    return len(buffer_views) - 1


def add_accessor(values, component_type, type_name, target=None):
    # component_type: 5126 float, 5123 uint16
    if component_type == 5126:
        flat = [float(x) for row in values for x in (row if isinstance(row, (list, tuple)) else [row])]
        data = struct.pack('<' + 'f' * len(flat), *flat)
        count = len(values)
        mins = [min(v[i] for v in values) for i in range(len(values[0]))]
        maxs = [max(v[i] for v in values) for i in range(len(values[0]))]
        view = add_buffer_view(data, target)
        acc = {"bufferView": view, "componentType": component_type, "count": count, "type": type_name, "min": mins, "max": maxs}
    else:
        data = struct.pack('<' + 'H' * len(values), *values)
        view = add_buffer_view(data, target)
        acc = {"bufferView": view, "componentType": component_type, "count": len(values), "type": type_name}
    accessors.append(acc)
    return len(accessors) - 1


def add_mesh(name, positions, indices, material_index):
    pos_acc = add_accessor(positions, 5126, "VEC3", 34962)
    idx_acc = add_accessor(indices, 5123, "SCALAR", 34963)
    meshes.append({
        "name": name,
        "primitives": [{
            "attributes": {"POSITION": pos_acc},
            "indices": idx_acc,
            "material": material_index,
            "mode": 4
        }]
    })
    return len(meshes) - 1


def uv_sphere(radius=1.0, seg=36, rings=18):
    pos = []
    idx = []
    for y in range(rings + 1):
        v = y / rings
        theta = v * math.pi
        for x in range(seg + 1):
            u = x / seg
            phi = u * math.pi * 2
            pos.append([
                radius * math.sin(theta) * math.cos(phi),
                radius * math.cos(theta),
                radius * math.sin(theta) * math.sin(phi)
            ])
    for y in range(rings):
        for x in range(seg):
            a = y * (seg + 1) + x
            b = a + seg + 1
            idx.extend([a, b, a + 1, b, b + 1, a + 1])
    return pos, idx


def torus(R=2.4, r=0.08, seg_u=128, seg_v=10, y_scale=0.34):
    pos = []
    idx = []
    for i in range(seg_u + 1):
        u = i / seg_u * math.pi * 2
        for j in range(seg_v + 1):
            v = j / seg_v * math.pi * 2
            pos.append([
                (R + r * math.cos(v)) * math.cos(u),
                r * math.sin(v) * y_scale,
                (R + r * math.cos(v)) * math.sin(u)
            ])
    row = seg_v + 1
    for i in range(seg_u):
        for j in range(seg_v):
            a = i * row + j
            b = a + row
            idx.extend([a, b, a + 1, b, b + 1, a + 1])
    return pos, idx


def cone(radius=0.22, height=3.2, seg=40, side=1):
    pos = [[0, side * height, 0], [0, side * 0.38, 0]]
    for i in range(seg):
        a = math.pi * 2 * i / seg
        pos.append([math.cos(a) * radius, side * 0.38, math.sin(a) * radius])
    idx = []
    for i in range(seg):
        a = 2 + i
        b = 2 + ((i + 1) % seg)
        idx.extend([0, a, b])
        idx.extend([1, b, a])
    return pos, idx


materials = [
    {"name": "Event Horizon Black", "pbrMetallicRoughness": {"baseColorFactor": [0.0, 0.0, 0.0, 1], "metallicFactor": 0.0, "roughnessFactor": 1.0}},
    {"name": "Hot Orange Accretion", "pbrMetallicRoughness": {"baseColorFactor": [1.0, 0.34, 0.02, 1], "metallicFactor": 0.0, "roughnessFactor": 0.35}, "emissiveFactor": [1.0, 0.28, 0.02]},
    {"name": "Magenta Plasma", "pbrMetallicRoughness": {"baseColorFactor": [0.9, 0.08, 0.72, 1], "metallicFactor": 0.0, "roughnessFactor": 0.35}, "emissiveFactor": [0.8, 0.08, 0.58]},
    {"name": "Cyan Photon Ring", "pbrMetallicRoughness": {"baseColorFactor": [0.02, 0.75, 1.0, 1], "metallicFactor": 0.0, "roughnessFactor": 0.25}, "emissiveFactor": [0.02, 0.65, 1.0]},
]

# Visible mesh nodes for any GLB viewer.
core_mesh = add_mesh("Visible Event Horizon Sphere", *uv_sphere(1.0), 0)
nodes.append({"name": "Visible Event Horizon", "mesh": core_mesh, "extras": {"kind": "core", "color": [0.0, 0.0, 0.0], "size": 2.1}})

for name, R, r, mat, yoff in [
    ("Visible Inner Photon Ring", 1.45, 0.055, 1, 0.0),
    ("Visible Magenta Accretion Ring", 2.18, 0.075, 2, 0.02),
    ("Visible Cyan Outer Ring", 2.92, 0.055, 3, -0.02),
]:
    mesh = add_mesh(name, *torus(R, r), mat)
    nodes.append({"name": name, "mesh": mesh, "translation": [0, yoff, 0], "extras": {"kind": "mesh"}})

for side in [-1, 1]:
    mesh = add_mesh(f"Visible Relativistic Jet {side}", *cone(side=side), 3)
    nodes.append({"name": f"Visible Relativistic Jet {side}", "mesh": mesh, "extras": {"kind": "mesh"}})

# Animation data nodes read by the website renderer.
core_index = len(nodes)
nodes.append({
    "name": "Singularity Core Data",
    "translation": [0, 0, 0],
    "scale": [1.3, 1.3, 1.3],
    "extras": {"kind": "core", "color": [0.02, 0.01, 0.06], "size": 1.9}
})

rings = [
    (1.55, 72, [1.0, 0.42, 0.08], 0.08),
    (2.25, 104, [0.95, 0.18, 0.78], 0.18),
    (3.05, 132, [0.09, 0.78, 1.0], 0.31),
    (3.75, 156, [1.0, 0.82, 0.32], 0.22),
]
node_index = len(nodes)
previous_ring = []
for ring_id, (radius, count, color, tilt) in enumerate(rings):
    current_ring = []
    for i in range(count):
        a = (math.pi * 2 * i / count) + ring_id * 0.18
        wobble = math.sin(i * 1.618 + ring_id) * 0.13
        x = math.cos(a) * (radius + wobble)
        z = math.sin(a) * (radius + wobble)
        y = math.sin(a) * radius * tilt * 0.33 + math.cos(i * 0.77) * 0.05
        nodes.append({
            "name": f"Accretion Particle {ring_id + 1}-{i + 1}",
            "translation": [round(x, 4), round(y, 4), round(z, 4)],
            "scale": [0.08, 0.08, 0.08],
            "extras": {"kind": "disk", "color": color, "size": 0.46 if ring_id == 0 else 0.28}
        })
        current_ring.append(node_index)
        if i > 0:
            links.append([node_index - 1, node_index])
        node_index += 1
    links.append([current_ring[-1], current_ring[0]])
    if previous_ring:
        step = max(1, len(current_ring) // 28)
        for j in range(0, len(current_ring), step):
            links.append([current_ring[j], previous_ring[j % len(previous_ring)]])
    previous_ring = current_ring

for side in [-1, 1]:
    arc_nodes = []
    for i in range(30):
        t = i / 29
        a = -1.2 + t * 2.4
        r = 0.62 + math.sin(t * math.pi) * 1.15
        x = math.cos(a) * r
        z = math.sin(a) * r
        y = side * (0.35 + t * 3.2)
        nodes.append({
            "name": f"Lensing Arc {side}-{i}",
            "translation": [round(x, 4), round(y, 4), round(z, 4)],
            "scale": [0.08, 0.08, 0.08],
            "extras": {"kind": "jet", "color": [0.33, 0.92, 1.0], "size": 0.24}
        })
        arc_nodes.append(node_index)
        if i > 0:
            links.append([node_index - 1, node_index])
        node_index += 1
    links.append([core_index, arc_nodes[0]])

for i in range(260):
    a = (math.pi * 2 * i) / 260
    b = math.sin(i * 12.9898) * math.pi
    r = 5.2 + (i % 19) * 0.18
    x = math.cos(a) * r
    z = math.sin(a) * r
    y = math.sin(b) * 3.0
    nodes.append({
        "name": f"Background Star {i+1}",
        "translation": [round(x, 4), round(y, 4), round(z, 4)],
        "scale": [0.045, 0.045, 0.045],
        "extras": {"kind": "star", "color": [0.78, 0.9, 1.0], "size": 0.16}
    })
    node_index += 1

bin_view_index = None
if buffer:
    align4()
    bin_view_index = 0

gltf = {
    "asset": {"version": "2.0", "generator": "Arena.ai visible blackhole GLB generator"},
    "scene": 0,
    "scenes": [{"name": "Blackhole Background", "nodes": list(range(len(nodes))), "extras": {"links": links}}],
    "nodes": nodes,
    "materials": materials,
    "meshes": meshes,
    "buffers": [{"byteLength": len(buffer)}],
    "bufferViews": buffer_views,
    "accessors": accessors,
    "extras": {
        "description": "Visible generated black hole model plus animation data: event horizon, accretion rings, lensing arcs, micro particles, and stars.",
        "links": links,
        "theme": "blackhole"
    }
}

json_bytes = json.dumps(gltf, separators=(",", ":")).encode("utf-8")
while len(json_bytes) % 4:
    json_bytes += b" "
while len(buffer) % 4:
    buffer.append(0)

length = 12 + 8 + len(json_bytes) + 8 + len(buffer)
with open(out_path, "wb") as f:
    f.write(struct.pack("<III", 0x46546C67, 2, length))
    f.write(struct.pack("<I4s", len(json_bytes), b"JSON"))
    f.write(json_bytes)
    f.write(struct.pack("<I4s", len(buffer), b"BIN\x00"))
    f.write(buffer)

print(f"Generated {out_path} ({length} bytes, {len(nodes)} nodes, {len(meshes)} visible meshes)")
