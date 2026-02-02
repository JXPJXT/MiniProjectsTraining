# 🏍️ Vintage Bike Generator - Local Setup

## ⚡ Quick Start (3 Steps)

### Step 1: Open Terminal
Open PowerShell or Command Prompt in this folder:
- Right-click in the folder → "Open in Terminal"
- OR press `Win+R`, type `cmd`, navigate to folder

### Step 2: Install Dependencies (One Time)
```bash
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu118
pip install diffusers transformers accelerate streamlit Pillow imageio imageio-ffmpeg safetensors
```

### Step 3: Run the App
```bash
streamlit run app_streamlit.py
```

Then open: **http://localhost:8501** in your browser

---

## 🖱️ Even Easier: Double-Click Launch
Just double-click `run.bat` to start everything automatically!

---

## 🌡️ Laptop Safety Features

Your laptop is SAFE because:

1. **Thermal Protection** - Automatically pauses if GPU gets too hot (>80°C)
2. **Memory Efficient** - Uses CPU offloading, only uses GPU when needed
3. **Low Resolution** - 256x256 generates faster with less heat
4. **Auto Throttling** - Your RTX 3050 automatically slows down at 85°C

### Tips to Stay Cool:
- Use a laptop cooling pad
- Don't block air vents
- Generate images first (faster/cooler than video)
- Take breaks between generations

---

## 📊 Expected Performance

| Mode | Resolution | Time | VRAM Used | Heat |
|------|-----------|------|-----------|------|
| Image | 512x512 | 15-30 sec | ~4 GB | Low |
| Video | 256x256 | 1-3 min | ~5 GB | Medium |

---

## 🔧 Troubleshooting

### "CUDA out of memory"
1. Close other apps using GPU (games, browsers with hardware accel)
2. Restart the app
3. Use Image mode instead of Video

### "Model download slow"
First run downloads ~4GB of models. This is one-time only.

### "GPU not detected"
1. Check NVIDIA drivers are installed
2. Run `nvidia-smi` in terminal to verify

### App crashes
1. Check GPU temperature with `nvidia-smi`
2. Wait for laptop to cool down
3. Close other applications

---

## 📁 File Structure

```
8.VideoGenHF/
├── app_streamlit.py    # Main Streamlit app
├── config.py           # Settings (edit for custom config)
├── generator.py        # AI generation engine
├── utils.py            # Helper functions
├── thermal_monitor.py  # GPU temperature monitoring
├── run.bat             # One-click launcher
├── requirements.txt    # Python packages
└── outputs/            # Generated images/videos saved here
    ├── images/
    └── videos/
```

---

## 🎯 Usage Tips

### Good Prompts:
- "vintage cafe racer motorcycle in garage"
- "classic 1970s chopper chrome details"
- "retro motorcycle on country road sunset"

### Avoid:
- People/faces
- Modern vehicles
- Very complex scenes

---

Made for RTX 3050 6GB laptops 🏍️
