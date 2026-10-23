"""Synthetic club identities, rosters, and tactical formation anchors.

Complies strictly with hackathon trademark guardrails:
- No real Premier League crests or copyrighted marks.
- Synthetic names with '-Sim' suffix.
- Home: North London Red (NLR), #EF4444 Crimson
- Away: Merseyside Blue (MSB), #3B82F6 Royal Blue
- Star Player: #8 Marcus Vance (NLR-8, Attacking Midfielder)
"""

from typing import Dict, List, Literal, Tuple
from app.models.schemas import PlayerPosition

TeamCode = Literal["NLR", "MSB"]

CLUB_METADATA = {
    "NLR": {
        "full_name": "North London Red",
        "short_name": "NLR",
        "primary_color": "#EF4444",
        "secondary_color": "#FFFFFF",
        "formation": "4-3-3",
        "star_player_id": "NLR-8",
    },
    "MSB": {
        "full_name": "Merseyside Blue",
        "short_name": "MSB",
        "primary_color": "#3B82F6",
        "secondary_color": "#FACC15",
        "formation": "4-3-3 Mid-Block",
        "star_player_id": "MSB-9",
    },
}

# Formation anchor coordinates on 105m x 68m pitch
# NLR attacks from x=0 toward x=105
NLR_ROSTER: List[Dict[str, object]] = [
    {"id": "NLR-1", "name": "D. Raya-Sim", "number": 1, "role": "GK", "anchor": (6.0, 34.0)},
    {"id": "NLR-18", "name": "J. Timber-Sim", "number": 18, "role": "LB", "anchor": (28.0, 10.0)},
    {"id": "NLR-6", "name": "G. Magalhaes-Sim", "number": 6, "role": "CB", "anchor": (24.0, 24.0)},
    {"id": "NLR-2", "name": "W. Saliba-Sim", "number": 2, "role": "CB", "anchor": (24.0, 44.0)},
    {"id": "NLR-4", "name": "B. White-Sim", "number": 4, "role": "RB", "anchor": (28.0, 58.0)},
    {"id": "NLR-5", "name": "T. Partey-Sim", "number": 5, "role": "DM", "anchor": (40.0, 34.0)},
    {"id": "NLR-20", "name": "D. Rice-Sim", "number": 20, "role": "CM", "anchor": (48.0, 22.0)},
    {"id": "NLR-8", "name": "M. Vance-Sim", "number": 8, "role": "AM", "anchor": (56.0, 44.0)},  # Star Player
    {"id": "NLR-11", "name": "G. Martinelli-Sim", "number": 11, "role": "LW", "anchor": (68.0, 12.0)},
    {"id": "NLR-9", "name": "K. Havertz-Sim", "number": 9, "role": "CF", "anchor": (70.0, 34.0)},
    {"id": "NLR-7", "name": "B. Saka-Sim", "number": 7, "role": "RW", "anchor": (68.0, 56.0)},
]

# MSB attacks from x=105 toward x=0 (defends x=105 side)
MSB_ROSTER: List[Dict[str, object]] = [
    {"id": "MSB-1", "name": "J. Pickford-Sim", "number": 1, "role": "GK", "anchor": (99.0, 34.0)},
    {"id": "MSB-19", "name": "V. Mykolenko-Sim", "number": 19, "role": "LB", "anchor": (78.0, 58.0)},
    {"id": "MSB-32", "name": "J. Branthwaite-Sim", "number": 32, "role": "CB", "anchor": (82.0, 44.0)},
    {"id": "MSB-6", "name": "J. Tarkowski-Sim", "number": 6, "role": "CB", "anchor": (82.0, 24.0)},
    {"id": "MSB-2", "name": "N. Patterson-Sim", "number": 2, "role": "RB", "anchor": (78.0, 10.0)},
    {"id": "MSB-27", "name": "I. Gueye-Sim", "number": 27, "role": "DM", "anchor": (66.0, 34.0)},
    {"id": "MSB-8", "name": "A. Onana-Sim", "number": 8, "role": "CM", "anchor": (58.0, 44.0)},
    {"id": "MSB-16", "name": "A. Doucoure-Sim", "number": 16, "role": "CM", "anchor": (58.0, 24.0)},
    {"id": "MSB-7", "name": "D. McNeil-Sim", "number": 7, "role": "LW", "anchor": (45.0, 56.0)},
    {"id": "MSB-9", "name": "D. Calvert-Sim", "number": 9, "role": "CF", "anchor": (40.0, 34.0)},
    {"id": "MSB-11", "name": "J. Harrison-Sim", "number": 11, "role": "RW", "anchor": (45.0, 12.0)},
]


def get_all_initial_players() -> List[PlayerPosition]:
    """Return all 22 players at their tactical formation base positions."""
    players: List[PlayerPosition] = []

    for p in NLR_ROSTER:
        anchor = p["anchor"]  # type: ignore
        players.append(
            PlayerPosition(
                player_id=str(p["id"]),
                name=str(p["name"]),
                shirt_number=int(p["number"]),  # type: ignore
                team="NLR",
                x=float(anchor[0]),
                y=float(anchor[1]),
                speed_kmh=12.4 if p["id"] == "NLR-8" else 8.5,
                stamina_pct=88.5 if p["id"] == "NLR-8" else 92.0,
            )
        )

    for p in MSB_ROSTER:
        anchor = p["anchor"]  # type: ignore
        players.append(
            PlayerPosition(
                player_id=str(p["id"]),
                name=str(p["name"]),
                shirt_number=int(p["number"]),  # type: ignore
                team="MSB",
                x=float(anchor[0]),
                y=float(anchor[1]),
                speed_kmh=9.1,
                stamina_pct=90.0,
            )
        )

    return players
