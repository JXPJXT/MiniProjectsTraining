"""
GPU Thermal Monitor - Keeps your laptop safe!
"""

import time
import subprocess
import re

def get_gpu_temperature() -> float:
    """Get current GPU temperature using nvidia-smi"""
    try:
        result = subprocess.run(
            ['nvidia-smi', '--query-gpu=temperature.gpu', '--format=csv,noheader,nounits'],
            capture_output=True,
            text=True,
            timeout=5
        )
        temp = float(result.stdout.strip())
        return temp
    except Exception as e:
        print(f"⚠️ Could not read GPU temp: {e}")
        return 0.0  # Return 0 if we can't read (assume safe)


def get_gpu_info() -> dict:
    """Get GPU information"""
    try:
        result = subprocess.run(
            ['nvidia-smi', '--query-gpu=name,temperature.gpu,memory.used,memory.total,utilization.gpu', 
             '--format=csv,noheader,nounits'],
            capture_output=True,
            text=True,
            timeout=5
        )
        parts = result.stdout.strip().split(', ')
        return {
            "name": parts[0],
            "temp": float(parts[1]),
            "memory_used": float(parts[2]) / 1024,  # Convert to GB
            "memory_total": float(parts[3]) / 1024,
            "utilization": float(parts[4])
        }
    except Exception as e:
        return {"name": "Unknown", "temp": 0, "memory_used": 0, "memory_total": 6, "utilization": 0}


def wait_for_cooldown(max_temp: float = 80, target_temp: float = 70):
    """Wait for GPU to cool down if too hot"""
    current_temp = get_gpu_temperature()
    
    if current_temp >= max_temp:
        print(f"🌡️ GPU is hot ({current_temp}°C)! Waiting for cooldown...")
        
        while current_temp > target_temp:
            print(f"   Temperature: {current_temp}°C (waiting for {target_temp}°C)")
            time.sleep(5)
            current_temp = get_gpu_temperature()
        
        print(f"✅ GPU cooled to {current_temp}°C. Resuming...")
        return True
    
    return False


def is_safe_to_generate(max_temp: float = 80) -> tuple:
    """Check if GPU temperature is safe for generation"""
    temp = get_gpu_temperature()
    
    if temp == 0:
        return True, "Temperature monitoring unavailable"
    
    if temp >= max_temp:
        return False, f"GPU too hot: {temp}°C (limit: {max_temp}°C)"
    
    if temp >= 75:
        return True, f"⚠️ GPU warm: {temp}°C - generation will proceed with caution"
    
    return True, f"✅ GPU temp OK: {temp}°C"


if __name__ == "__main__":
    # Test the monitor
    print("🖥️ GPU Status:")
    info = get_gpu_info()
    print(f"   GPU: {info['name']}")
    print(f"   Temperature: {info['temp']}°C")
    print(f"   Memory: {info['memory_used']:.1f}/{info['memory_total']:.1f} GB")
    print(f"   Utilization: {info['utilization']}%")
