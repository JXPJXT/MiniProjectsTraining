import gradio as gr
import tempfile

from gatekeeper import validate_prompt, sanitize_prompt
from prompt_builder import build_prompt
from video_engine import VideoGenerator
from postprocess import frames_to_video
from cache import cache_key, get_cached_video, store_video


engine = VideoGenerator()


def generate_video(prompt, era, camera):
    if not validate_prompt(prompt):
        return None, "Prompt rejected. Only vintage motorcycle content allowed."

    clean_prompt = sanitize_prompt(prompt)
    final_prompt = build_prompt(clean_prompt, era, camera)

    key = cache_key(final_prompt)
    cached = get_cached_video(key)
    if cached:
        return cached, "Served from cache."

    frames = engine.generate(final_prompt)

    tmp = tempfile.NamedTemporaryFile(suffix=".mp4", delete=False)
    frames_to_video(frames, tmp.name)

    final_path = store_video(key, tmp.name)
    return final_path, "Generated successfully."


with gr.Blocks() as demo:
    gr.Markdown("### Vintage Motorcycle Video Generator")

    prompt = gr.Textbox(label="Describe the vintage bike scene")
    era = gr.Dropdown(["1960s", "1970s", "1980s"], value="1970s", label="Era")
    camera = gr.Dropdown(["static", "pan", "tracking"], value="pan", label="Camera")

    generate_btn = gr.Button("Generate")
    video = gr.Video()
    status = gr.Textbox(label="Status")

    generate_btn.click(
        generate_video,
        inputs=[prompt, era, camera],
        outputs=[video, status]
    )

demo.launch()
