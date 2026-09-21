import re

def calculate_priority(category: str, problem_type: str, description: str) -> str:
    """
    Rule-Based Priority System:
    Evaluates complaints deterministically based on civic severity guidelines.
    HIGH:
      - Severe water shortage, pipeline burst, contamination
      - Blocked major drain, sewage backup, drain overflow
      - Stagnant water near homes, mosquito breeding, dengue threat
      - Flooding or submerged streets
    MEDIUM:
      - Garbage accumulation, overflowing bin
      - Minor drainage problem, slow drainage
      - Irregular water supply, low water pressure
    LOW:
      - General suggestion, awareness request, minor dripping tap
    """
    text = f"{category} {problem_type} {description}".lower()

    # High priority triggers
    high_keywords = [
        "severe", "burst", "contamination", "contaminated", "dirty water",
        "no water for", "blocked major drain", "major drain", "sewage backup",
        "drain overflow", "sewage overflow", "stagnant water near homes", "mosquito breeding", "dengue",
        "malaria", "flooding", "flooded", "submerged", "hazard", "health crisis",
        "choked main drain", "foul smell inside home"
    ]

    # Category-specific overrides
    if category.lower() == "garbage":
        return "Medium"

    if category.lower() == "stagnant water" and any(k in text for k in ["near home", "mosquito", "smell", "fever", "dengue"]):
        return "High"

    if category.lower() == "drainage" and any(k in text for k in ["flood", "overflow", "choked", "sewage", "major"]):
        return "High"

    if category.lower() == "water supply" and any(k in text for k in ["no water", "burst", "dirty", "contaminated", "severe"]):
        return "High"

    for kw in high_keywords:
        if kw in text:
            return "High"

    # Medium priority triggers
    medium_keywords = [
        "accumulate", "accumulation", "trash", "waste", "minor drain",
        "slow drainage", "irregular", "low pressure", "leak", "leakage",
        "cleaning needed", "clogged small drain"
    ]

    for kw in medium_keywords:
        if kw in text:
            return "Medium"

    # Specific category defaults
    if category.lower() in ["drainage", "stagnant water"]:
        return "Medium"
    elif category.lower() == "garbage":
        return "Medium"
    elif category.lower() == "water supply":
        return "Medium"
    else:
        return "Low"
