# 🏍️ Vintage Bike Video Generator

A context-specific AI video generation tool designed for creating stunning cinematic videos of vintage motorcycles. Built with low-compute GPU models for Google Colab's free tier.

![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)
![Streamlit](https://img.shields.io/badge/Streamlit-1.28+-red.svg)
![Colab](https://img.shields.io/badge/Google%20Colab-Compatible-yellow.svg)

## ✨ Features

- 🎬 **Text-to-Video Generation** - Create videos from text descriptions
- 🏍️ **Context-Aware** - Specialized for vintage motorcycle content
- ⚡ **Low Compute** - Optimized for T4 GPU (Colab free tier)
- 🎨 **Streamlit Frontend** - Beautiful, intuitive web interface
- 📥 **Export Options** - Download as MP4 or GIF
- 🔄 **Caching** - Reuse previously generated videos

## 🚀 Quick Start (Google Colab)

### Option 1: Use the Notebook Directly

1. Open [VintageVideoGen_Colab.ipynb](./VintageVideoGen_Colab.ipynb) in Google Colab
2. Enable GPU: `Runtime` → `Change runtime type` → `T4 GPU`
3. Run all cells sequentially
4. Click the public URL to access the Streamlit app

### Option 2: Upload Individual Files

Upload these files to your Colab environment:
- `video_config.py` - Configuration settings
- `video_engine.py` - Video generation engine
- `prompt_builder.py` - Prompt enhancement
- `video_utils.py` - Video processing utilities
- `streamlit_app.py` - Streamlit frontend

## 📋 Requirements

```
torch>=2.0.0
diffusers>=0.21.0
transformers>=4.30.0
accelerate>=0.20.0
streamlit>=1.28.0
pyngrok>=6.0.0
imageio[ffmpeg]>=2.31.0
opencv-python-headless>=4.8.0
xformers>=0.0.21
```

## 🎥 Model Used

**ModelScope Text-to-Video (damo-vilab/text-to-video-ms-1.7b)**
- Model Size: ~3.4 GB
- VRAM Required: 6-8 GB
- Generation Time: 1-3 minutes per video
- Output: 16 frames @ 256x256 resolution

This model is chosen for its low compute requirements while still producing quality results.

## 🛠️ Configuration

Edit `video_config.py` to customize:

```python
# Video settings (trade quality for speed)
VIDEO_CONFIG = {
    "num_frames": 16,       # More frames = longer video
    "height": 256,          # Higher = better quality but slower
    "width": 256,           
    "num_inference_steps": 25,  # Higher = better quality
    "guidance_scale": 7.5,
    "fps": 8
}
```

## 📝 Prompt Tips

### ✅ Good Prompts:
- "Classic cafe racer motorcycle in rustic garage, warm lighting"
- "Vintage 1970s chopper on desert highway at sunset"
- "British Norton motorcycle, chrome details gleaming, studio shot"

### ❌ Avoid:
- People, faces, animals
- Modern vehicles (cars, trucks)
- Futuristic/fantasy themes
- Violence or weapons

### 🎯 Preset Prompts Available:
- 🏍️ Classic Cafe Racer
- 🔧 Garage Scene
- 🌅 Sunset Ride
- 🏁 Racing Heritage
- 🪞 Chrome Details
- 🌿 Country Road

## 📂 Project Structure

```
8.VideoGenHF/
├── VintageVideoGen_Colab.ipynb  # Main Colab notebook
├── streamlit_app.py              # Streamlit frontend
├── video_config.py               # Configuration
├── video_engine.py               # Video generation
├── prompt_builder.py             # Prompt enhancement
├── video_utils.py                # Video utilities
├── requirements.txt              # Dependencies
└── README.md                     # This file
```

## 🔧 Local Development

While designed for Colab, you can run locally:

```bash
# Install dependencies
pip install -r requirements.txt

# Run Streamlit
streamlit run streamlit_app.py
```

**Note:** Requires NVIDIA GPU with 8GB+ VRAM

## 🎨 UI Preview

The Streamlit app features:
- 🌙 Dark vintage theme
- 📝 Prompt input with validation
- ⚙️ Era & camera style selection
- 🎬 Real-time video preview
- 📥 Download buttons (MP4 & GIF)
- 📂 Generation history gallery

## ⚠️ Troubleshooting

### Out of Memory (OOM)
- Restart Colab runtime
- Reduce `num_inference_steps` to 20
- Keep resolution at 256x256

### Slow Generation
- T4 GPU: 1-3 minutes
- Patience is required for AI video generation

### ngrok Issues
- Get free token from [ngrok.com](https://ngrok.com)
- Or use localtunnel alternative in notebook

## 📄 License

MIT License - Free for personal and commercial use

## 🙏 Acknowledgments

- [ModelScope](https://modelscope.cn/) for the text-to-video model
- [Hugging Face](https://huggingface.co/) for diffusers library
- [Streamlit](https://streamlit.io/) for the web framework

---

**Created for vintage motorcycle enthusiasts 🏍️**
