ALLOWED_KEYWORDS = {
    "vintage", "classic", "motorcycle", "bike", "cafe racer",
    "retro", "1960s", "1970s", "chrome", "air cooled"
}

BLOCKED_KEYWORDS = {
    "person", "people", "face", "animal", "gun",
    "car", "truck", "futuristic", "cyberpunk",
    "robot", "alien", "fantasy"
}


def validate_prompt(prompt: str) -> bool:
    p = prompt.lower()

    if any(bad in p for bad in BLOCKED_KEYWORDS):
        return False

    if not any(good in p for good in ALLOWED_KEYWORDS):
        return False

    return True


def sanitize_prompt(prompt: str) -> str:
    return prompt.strip().lower()
