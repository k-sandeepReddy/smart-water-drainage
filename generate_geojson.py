import json
import os

# Create GeoJSON FeatureCollection
# We'll include:
# 1. India national boundary
# 2. State polygons (AP, Telangana, Tamil Nadu, Karnataka, Odisha, Maharashtra, etc.)
# 3. East Godavari district polygon
# 4. Major rivers (Godavari, Krishna, Ganga)
# 5. Major highways (NH-16, ADB Road, NH-44)
# 6. Ramaswami Peta survey area boundary

features = []

# 1. INDIA NATIONAL BOUNDARY
india_coords = [
    [74.8, 37.0], [77.0, 36.5], [80.3, 31.0], [81.0, 30.2], [88.0, 27.8],
    [88.9, 27.3], [89.8, 26.8], [92.0, 27.8], [94.0, 28.5], [97.0, 28.0],
    [97.4, 27.5], [95.5, 25.8], [93.5, 24.0], [92.5, 22.0], [91.8, 24.0],
    [89.0, 21.6], [87.0, 21.5], [85.0, 19.5], [83.3, 17.7], [82.2, 16.9],
    [81.9, 16.4], [80.3, 15.8], [80.2, 13.1], [79.8, 10.3], [79.3, 9.2],
    [77.5, 8.1], [76.5, 9.0], [75.0, 12.0], [73.8, 15.5], [72.8, 19.0],
    [72.6, 21.5], [68.8, 23.8], [68.5, 24.5], [71.0, 24.5], [70.5, 27.5],
    [74.0, 30.5], [74.5, 32.5], [74.8, 37.0]
]

features.append({
    "type": "Feature",
    "id": "IND",
    "properties": {
        "name": "India",
        "type": "country",
        "level": 1
    },
    "geometry": {
        "type": "Polygon",
        "coordinates": [india_coords]
    }
})

# 2. ANDHRA PRADESH STATE POLYGON (Detailed coastal state)
# Coastal Andhra + Rayalaseema
ap_coords = [
    [80.2, 13.5], [79.8, 13.2], [79.0, 13.2], [78.2, 13.8], [77.3, 14.0],
    [77.0, 15.0], [77.5, 15.8], [78.2, 16.0], [79.3, 16.8], [80.0, 16.8],
    [80.6, 16.5], [81.3, 17.2], [81.8, 17.5], [82.3, 17.9], [83.0, 18.3],
    [83.8, 18.8], [84.7, 19.1], [84.2, 18.4], [83.3, 17.7], [82.2, 16.9],
    [81.9, 16.4], [80.8, 15.8], [80.0, 15.2], [80.1, 13.8], [80.2, 13.5]
]

features.append({
    "type": "Feature",
    "id": "IN-AP",
    "properties": {
        "name": "Andhra Pradesh",
        "type": "state",
        "capital": "Amaravati",
        "highlight": True,
        "level": 2
    },
    "geometry": {
        "type": "Polygon",
        "coordinates": [ap_coords]
    }
})

# 3. TELANGANA STATE POLYGON
tg_coords = [
    [77.5, 15.8], [77.8, 17.0], [77.5, 18.0], [78.5, 19.8], [79.8, 19.5],
    [80.8, 18.6], [81.3, 17.8], [81.3, 17.2], [80.6, 16.5], [80.0, 16.8],
    [79.3, 16.8], [78.2, 16.0], [77.5, 15.8]
]

features.append({
    "type": "Feature",
    "id": "IN-TG",
    "properties": {
        "name": "Telangana",
        "type": "state",
        "capital": "Hyderabad",
        "level": 2
    },
    "geometry": {
        "type": "Polygon",
        "coordinates": [tg_coords]
    }
})

# 4. TAMIL NADU STATE POLYGON
tn_coords = [
    [80.2, 13.5], [79.8, 13.2], [79.0, 13.2], [77.5, 12.0], [76.8, 11.5],
    [76.7, 10.0], [77.2, 8.5], [77.5, 8.1], [79.3, 9.2], [79.8, 10.3],
    [80.2, 13.1], [80.2, 13.5]
]
features.append({
    "type": "Feature",
    "id": "IN-TN",
    "properties": {"name": "Tamil Nadu", "type": "state", "capital": "Chennai", "level": 2},
    "geometry": {"type": "Polygon", "coordinates": [tn_coords]}
})

# 5. KARNATAKA STATE POLYGON
ka_coords = [
    [77.5, 12.0], [76.8, 11.5], [75.0, 12.0], [74.5, 14.5], [74.1, 15.5],
    [75.5, 17.5], [77.5, 18.0], [77.8, 17.0], [77.5, 15.8], [77.0, 15.0],
    [77.3, 14.0], [78.2, 13.8], [77.5, 12.0]
]
features.append({
    "type": "Feature",
    "id": "IN-KA",
    "properties": {"name": "Karnataka", "type": "state", "capital": "Bengaluru", "level": 2},
    "geometry": {"type": "Polygon", "coordinates": [ka_coords]}
})

# 6. ODISHA STATE POLYGON
od_coords = [
    [84.7, 19.1], [83.8, 18.8], [83.0, 18.3], [82.5, 19.5], [83.5, 21.0],
    [84.5, 22.0], [86.5, 22.5], [87.5, 21.5], [86.8, 20.5], [85.5, 19.5],
    [84.7, 19.1]
]
features.append({
    "type": "Feature",
    "id": "IN-OD",
    "properties": {"name": "Odisha", "type": "state", "capital": "Bhubaneswar", "level": 2},
    "geometry": {"type": "Polygon", "coordinates": [od_coords]}
})

# 7. MAHARASHTRA STATE POLYGON
mh_coords = [
    [72.8, 19.0], [72.6, 21.0], [74.5, 21.5], [78.5, 21.5], [80.5, 20.8],
    [80.8, 18.6], [79.8, 19.5], [78.5, 19.8], [77.5, 18.0], [75.5, 17.5],
    [74.1, 15.5], [73.8, 15.5], [72.8, 19.0]
]
features.append({
    "type": "Feature",
    "id": "IN-MH",
    "properties": {"name": "Maharashtra", "type": "state", "capital": "Mumbai", "level": 2},
    "geometry": {"type": "Polygon", "coordinates": [mh_coords]}
})

# 8. EAST GODAVARI DISTRICT POLYGON (In Andhra Pradesh)
# Headquarters Rajahmundry, contains Rajanagaram, Kanavaram, Ramaswami Peta
eg_coords = [
    [81.65, 17.35], [81.85, 17.40], [82.05, 17.30], [82.15, 17.15],
    [82.05, 16.90], [81.85, 16.85], [81.70, 16.92], [81.60, 17.10],
    [81.65, 17.35]
]

features.append({
    "type": "Feature",
    "id": "AP-EG",
    "properties": {
        "name": "East Godavari",
        "type": "district",
        "state": "Andhra Pradesh",
        "hq": "Rajahmundry",
        "highlight": True,
        "level": 3
    },
    "geometry": {
        "type": "Polygon",
        "coordinates": [eg_coords]
    }
})

# 9. RAMASWAMI PETA SURVEY AREA (Level 4 local polygon)
# Centered at ~81.9023, 17.0845
rp_coords = [
    [81.898, 17.088], [81.906, 17.089], [81.907, 17.084],
    [81.905, 17.080], [81.899, 17.081], [81.898, 17.088]
]

features.append({
    "type": "Feature",
    "id": "PROJECT-RAMASWAMI-PETA",
    "properties": {
        "name": "Ramaswami Peta Survey Area",
        "type": "project_boundary",
        "plusCode": "3WHH+7P6",
        "pincode": "533294",
        "level": 4
    },
    "geometry": {
        "type": "Polygon",
        "coordinates": [rp_coords]
    }
})

# 10. RIVERS
# Godavari River (Flows right through Rajahmundry and East Godavari)
godavari_coords = [
    [73.5, 19.9], [75.3, 19.5], [77.5, 18.9], [79.2, 18.8],
    [80.5, 18.6], [81.3, 17.8], [81.75, 17.1], [81.80, 17.0],
    [81.90, 16.8], [82.25, 16.7]
]
features.append({
    "type": "Feature",
    "id": "RIVER-GODAVARI",
    "properties": {
        "name": "Godavari River",
        "type": "river",
        "color": "#38bdf8",
        "width": 3
    },
    "geometry": {
        "type": "LineString",
        "coordinates": godavari_coords
    }
})

# Krishna River (Flows through Vijayawada)
krishna_coords = [
    [73.7, 18.0], [75.5, 16.5], [77.0, 16.2], [78.5, 16.0],
    [80.0, 16.3], [80.64, 16.5], [81.1, 16.0], [81.2, 15.8]
]
features.append({
    "type": "Feature",
    "id": "RIVER-KRISHNA",
    "properties": {
        "name": "Krishna River",
        "type": "river",
        "color": "#38bdf8",
        "width": 2.5
    },
    "geometry": {
        "type": "LineString",
        "coordinates": krishna_coords
    }
})

# 11. HIGHWAYS / ROADS
# NH-16 (East Coast Highway connecting Chennai - Vijayawada - Rajahmundry - Rajanagaram - Visakhapatnam - Kolkata)
nh16_coords = [
    [80.27, 13.08], [80.00, 14.44], [80.05, 15.50], [80.44, 16.31],
    [80.65, 16.51], [81.10, 16.71], [81.80, 17.00], [81.90, 17.08],
    [83.22, 17.69], [83.90, 18.30], [85.10, 20.95], [88.36, 22.57]
]
features.append({
    "type": "Feature",
    "id": "ROAD-NH16",
    "properties": {
        "name": "NH-16 (Golden Quadrilateral)",
        "type": "highway",
        "code": "NH-16",
        "color": "#fbbf24",
        "width": 2.5
    },
    "geometry": {
        "type": "LineString",
        "coordinates": nh16_coords
    }
})

# ADB Road (Asian Development Bank Road connecting Rajanagaram directly through Kanavaram / Ramaswami Peta towards Kakinada)
adb_coords = [
    [81.80, 17.00], [81.9015, 17.0789], [81.9025, 17.0845], [81.95, 17.02],
    [82.10, 17.00], [82.2475, 16.9891]
]
features.append({
    "type": "Feature",
    "id": "ROAD-ADB",
    "properties": {
        "name": "ADB Road (Rajanagaram - Ramaswami Peta - Kakinada)",
        "type": "highway",
        "code": "ADB Road",
        "color": "#f97316",
        "width": 2
    },
    "geometry": {
        "type": "LineString",
        "coordinates": adb_coords
    }
})

geojson_data = {
    "type": "FeatureCollection",
    "features": features
}

with open("frontend/public/maps/india-geo.json", "w", encoding="utf-8") as f:
    json.dump(geojson_data, f, indent=2)

with open("map-data/india/india-geo.json", "w", encoding="utf-8") as f:
    json.dump(geojson_data, f, indent=2)

print(f"Generated india-geo.json with {len(features)} features.")
