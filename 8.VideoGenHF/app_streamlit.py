"""
🏍️ Vintage Bike Generator - Streamlit Frontend
Optimized for RTX 3050 6GB
"""

import streamlit as st
import os
import time
import torch

# Page Configuration - MUST be first Streamlit command
st.set_page_config(
    page_title="🏍️ Vintage Bike Generator",
    page_icon="🏍️",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Import our modules AFTER streamlit config
from config import ERA_DESCRIPTIONS, CAMERA_STYLES, PRESET_PROMPTS, VIDEO_CONFIG
from utils import validate_prompt, build_prompt, save_image, save_video, list_outputs
from generator import get_generator, clear_memory

# Custom CSS
st.markdown("""
<style>
    /* Dark vintage theme */
    .stApp {
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    }
    
    /* Title styling */
    .main-title {
        text-align: center;
        font-size: 2.5rem;
        background: linear-gradient(90deg, #d4a574, #e8d5b7);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        font-weight: bold;
        margin-bottom: 0.5rem;
    }
    
    .subtitle {
        text-align: center;
        color: #888;
        margin-bottom: 2rem;
    }
    
    /* Cards */
    .info-card {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 10px;
        padding: 1rem;
        border: 1px solid rgba(212, 165, 116, 0.3);
        margin: 0.5rem 0;
    }
    
    /* Buttons */
    .stButton > button {
        background: linear-gradient(135deg, #d4a574, #c49058);
        color: #1a1a2e;
        font-weight: bold;
        border: none;
        border-radius: 8px;
    }
    
    .stButton > button:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(212, 165, 116, 0.3);
    }
    
    /* GPU indicator */
    .gpu-ok { color: #27ae60; }
    .gpu-warn { color: #f39c12; }
    .gpu-bad { color: #e74c3c; }
</style>
""", unsafe_allow_html=True)

# Initialize session state
if 'generator' not in st.session_state:
    st.session_state.generator = None
if 'last_output' not in st.session_state:
    st.session_state.last_output = None
if 'generation_mode' not in st.session_state:
    st.session_state.generation_mode = "image"

# Header
st.markdown('<h1 class="main-title">🏍️ Vintage Bike Generator</h1>', unsafe_allow_html=True)
st.markdown('<p class="subtitle">Create stunning vintage motorcycle images & videos | Optimized for RTX 3050</p>', unsafe_allow_html=True)

# Sidebar
with st.sidebar:
    st.markdown("## ⚙️ Settings")
    
    # Generation Mode
    mode = st.radio(
        "🎯 Generation Mode",
        ["🖼️ Image", "🎬 Video"],
        help="Image is faster and uses less VRAM. Video creates short animations."
    )
    st.session_state.generation_mode = "image" if "Image" in mode else "video"
    
    st.markdown("---")
    
    # Era Selection
    era = st.selectbox(
        "🗓️ Era",
        options=list(ERA_DESCRIPTIONS.keys()),
        index=2
    )
    
    # Camera Style
    camera = st.selectbox(
        "🎥 Camera Style",
        options=list(CAMERA_STYLES.keys()),
        index=0
    )
    
    # Seed
    seed_option = st.radio("🎲 Seed", ["Random", "Custom"])
    if seed_option == "Custom":
        seed = st.number_input("Seed value", min_value=0, max_value=2**32-1, value=42)
    else:
        seed = None
    
    st.markdown("---")
    
    # System Info
    st.markdown("### 💻 System")
    
    if torch.cuda.is_available():
        gpu_name = torch.cuda.get_device_name(0)
        gpu_mem_total = torch.cuda.get_device_properties(0).total_memory / 1e9
        gpu_mem_used = torch.cuda.memory_allocated() / 1e9
        gpu_mem_free = gpu_mem_total - gpu_mem_used
        
        st.success(f"GPU: {gpu_name}")
        st.info(f"VRAM: {gpu_mem_used:.1f}/{gpu_mem_total:.1f} GB")
        
        # Memory bar
        mem_pct = gpu_mem_used / gpu_mem_total
        st.progress(mem_pct)
        
        if mem_pct > 0.8:
            st.warning("⚠️ High VRAM usage")
            if st.button("🧹 Clear Memory"):
                clear_memory()
                st.rerun()
    else:
        st.error("❌ No GPU detected!")
        st.info("Running on CPU (very slow)")
    
    # Config info
    with st.expander("📊 Current Config"):
        if st.session_state.generation_mode == "video":
            st.write(f"Resolution: {VIDEO_CONFIG['width']}x{VIDEO_CONFIG['height']}")
            st.write(f"Frames: {VIDEO_CONFIG['num_frames']}")
            st.write(f"Steps: {VIDEO_CONFIG['num_inference_steps']}")
        else:
            st.write("Resolution: 512x512")
            st.write("Steps: 20")

# Main Content
col1, col2 = st.columns([1, 1])

with col1:
    st.markdown("### 📝 Prompt")
    
    # Preset selection
    preset = st.selectbox(
        "Quick Presets",
        ["✍️ Custom"] + list(PRESET_PROMPTS.keys())
    )
    
    # Prompt input
    if preset != "✍️ Custom":
        default_prompt = PRESET_PROMPTS[preset]
    else:
        default_prompt = ""
    
    prompt = st.text_area(
        "Describe your vintage motorcycle",
        value=default_prompt,
        height=120,
        placeholder="e.g., A classic cafe racer motorcycle with chrome details..."
    )
    
    # Validation
    if prompt:
        is_valid, message = validate_prompt(prompt)
        if is_valid:
            st.success(message)
        else:
            st.error(message)
    
    # Generate button
    generate_col1, generate_col2 = st.columns([2, 1])
    with generate_col1:
        generate_btn = st.button(
            f"🎨 Generate {'Image' if st.session_state.generation_mode == 'image' else 'Video'}",
            type="primary",
            use_container_width=True
        )
    with generate_col2:
        if st.button("🧹 Clear", use_container_width=True):
            clear_memory()
            st.rerun()

with col2:
    st.markdown("### 🖼️ Output")
    output_placeholder = st.empty()
    status_placeholder = st.empty()
    download_placeholder = st.empty()
    
    # Show last output if exists
    if st.session_state.last_output and os.path.exists(st.session_state.last_output):
        if st.session_state.last_output.endswith(('.mp4', '.gif')):
            output_placeholder.video(st.session_state.last_output)
        else:
            output_placeholder.image(st.session_state.last_output)

# Generation Logic
if generate_btn:
    if not prompt:
        st.error("❌ Please enter a prompt")
    else:
        is_valid, message = validate_prompt(prompt)
        
        if not is_valid:
            st.error(message)
        else:
            # Build enhanced prompt
            full_prompt = build_prompt(prompt, era, camera)
            
            with st.expander("📜 Enhanced Prompt"):
                st.code(full_prompt)
            
            # Generate
            progress = st.progress(0)
            status = st.empty()
            
            try:
                status.text("🔄 Loading model...")
                progress.progress(10)
                
                generator = get_generator()
                
                if st.session_state.generation_mode == "image":
                    # Generate image
                    status.text("🎨 Generating image...")
                    progress.progress(30)
                    
                    start_time = time.time()
                    image, used_seed = generator.generate_image(full_prompt, seed=seed)
                    gen_time = time.time() - start_time
                    
                    progress.progress(80)
                    status.text("💾 Saving...")
                    
                    # Save
                    filepath = save_image(image, prompt, used_seed)
                    
                    progress.progress(100)
                    
                    # Display
                    st.session_state.last_output = filepath
                    output_placeholder.image(filepath)
                    status_placeholder.success(f"✅ Generated in {gen_time:.1f}s | Seed: {used_seed}")
                    
                    # Download
                    with open(filepath, "rb") as f:
                        download_placeholder.download_button(
                            "📥 Download Image",
                            f,
                            file_name=f"vintage_bike_{used_seed}.png",
                            mime="image/png"
                        )
                
                else:
                    # Generate video
                    status.text("🎬 Generating video (this takes longer)...")
                    progress.progress(30)
                    
                    start_time = time.time()
                    frames, used_seed = generator.generate_video(full_prompt, seed=seed)
                    gen_time = time.time() - start_time
                    
                    progress.progress(80)
                    status.text("💾 Saving video...")
                    
                    # Save
                    mp4_path, gif_path = save_video(frames, prompt, used_seed)
                    
                    progress.progress(100)
                    
                    # Display (prefer GIF as it always works)
                    output_path = mp4_path if mp4_path and os.path.exists(mp4_path) else gif_path
                    st.session_state.last_output = output_path
                    
                    if output_path:
                        output_placeholder.video(output_path)
                    
                    status_placeholder.success(f"✅ Generated in {gen_time:.1f}s | Seed: {used_seed} | Frames: {len(frames)}")
                    
                    # Downloads
                    dl_cols = download_placeholder.columns(2)
                    if gif_path and os.path.exists(gif_path):
                        with open(gif_path, "rb") as f:
                            dl_cols[0].download_button(
                                "📥 GIF",
                                f,
                                file_name=f"vintage_bike_{used_seed}.gif",
                                mime="image/gif"
                            )
                    if mp4_path and os.path.exists(mp4_path):
                        with open(mp4_path, "rb") as f:
                            dl_cols[1].download_button(
                                "📥 MP4",
                                f,
                                file_name=f"vintage_bike_{used_seed}.mp4",
                                mime="video/mp4"
                            )
                
                status.empty()
                progress.empty()
                
            except Exception as e:
                st.error(f"❌ Generation failed: {str(e)}")
                import traceback
                with st.expander("Error Details"):
                    st.code(traceback.format_exc())
                
                # Clear memory on error
                clear_memory()

# Gallery Section
st.markdown("---")
st.markdown("### 📂 Gallery")

outputs = list_outputs()
if outputs:
    cols = st.columns(4)
    for i, filepath in enumerate(outputs[:8]):
        with cols[i % 4]:
            if filepath.endswith(('.mp4', '.gif')):
                st.video(filepath)
            else:
                st.image(filepath, use_container_width=True)
            
            filename = os.path.basename(filepath)
            st.caption(filename[:20] + "..." if len(filename) > 20 else filename)
else:
    st.info("No outputs yet. Generate your first vintage bike image above!")

# Footer
st.markdown("---")
st.markdown("""
<div style="text-align: center; color: #666; padding: 1rem;">
    🏍️ Vintage Bike Generator | Optimized for RTX 3050 6GB | SD 1.5 + AnimateDiff
</div>
""", unsafe_allow_html=True)
