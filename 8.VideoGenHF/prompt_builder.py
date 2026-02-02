BASE_STYLE = (
    "cinematic shot, realistic motion, professional cinematography, "
    "natural lighting, shallow depth of field, film grain, 24fps"
)

ERA_MAP = {
    "1960s": "1960s vintage motorcycle, classic frame, analog gauges",
    "1970s": "1970s vintage motorcycle, cafe racer style, chrome exhaust",
    "1980s": "1980s retro motorcycle, air cooled engine"
}


def build_prompt(user_prompt: str, era: str, camera: str) -> str:
    era_desc = ERA_MAP.get(era, ERA_MAP["1970s"])

    camera_desc = {
        "static": "static camera, tripod shot",
        "pan": "slow cinematic pan",
        "tracking": "smooth tracking shot"
    }.get(camera, "slow cinematic pan")

    final_prompt = (
        f"{camera_desc} of a {era_desc}. "
        f"{user_prompt}. {BASE_STYLE}"
    )

    return final_prompt
