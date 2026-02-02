import imageio
import os
from typing import List
import numpy as np


def frames_to_video(frames: List[np.ndarray], output_path: str, fps: int = 8):
    imageio.mimsave(
        output_path,
        frames,
        fps=fps,
        codec="libx264"
    )
