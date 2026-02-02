import torch
from diffusers import DiffusionPipeline
import numpy as np


class VideoGenerator:
    def __init__(self):
        self.pipe = None

    def load(self):
        if self.pipe is None:
            self.pipe = DiffusionPipeline.from_pretrained(
                "cerspense/zeroscope_v2_576w",  # replace with WAN when ready
                torch_dtype=torch.float16
            )
            self.pipe.to("cuda")

    def generate(
        self,
        prompt: str,
        num_frames: int = 16,
        seed: int = 42
    ) -> list:
        self.load()

        generator = torch.Generator("cuda").manual_seed_
