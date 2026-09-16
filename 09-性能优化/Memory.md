**Total Committed Memory：**
操作系统实际提交给你程序的物理/虚拟内存总量。这是“真正占了多少”的硬指标
**Tracked Memory (In use / Reserved)：**
Unity 能追踪到的内存：在用 8.34 GB，已预留 10.54 GB
**Untracked Memory：**
Unity 追踪不到的部分（第三方插件、驱动、系统分配等）

**Total Memory Breakdown:**
- Managed Heap:C# 托管堆（你的脚本对象、托管数组等）。
- Graphics & Graphics Driver:GPU 资源：贴图、Mesh、RenderTexture、shader 等显存相关
- Audio:音频
- Video:视频
- Other:其他原生内存（引擎内部、原生分配等）

**Objects stats:**
资源对象统计