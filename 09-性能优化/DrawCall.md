DrawCall（绘制调用）就是 CPU 向 GPU 发出的一次**图形绘制指令**。每次 DrawCall，CPU 需要：

1. 准备数据：收集网格、材质、变换矩阵等信息
2. 设置渲染状态：切换 Shader、纹理、混合模式等
3. 提交命令：通过图形 API（DirectX/Vulkan/Metal）将命令放入命令缓冲区
4. GPU 执行：GPU 读取命令，完成实际光栅化渲染
### Unity 中减少 DrawCall 的方法
#### 静态批处理（Static Batching）

适用于场景中不移动的物体（地形、建筑、道具等）。

// 在 Inspector 中勾选 Static 即可，或代码方式：

StaticBatchingUtility.Combine(gameObjects, root);

- 原理：将多个静态网格合并为一个大网格，一次 DrawCall 绘制多个物体
- 优点：运行时零额外 CPU 开销
- 缺点：会增加内存占用（每个场景实例都保存一份顶点数据）
- 要求：共享相同材质（Material）
#### 动态批处理（Dynamic Batching）

适用于会移动的小型网格物体。

- 原理：Unity 每帧自动将满足条件的动态物体合并绘制
- 限制较多：顶点数 ≤ 900，不能有 Scale 不均匀、不能使用多 Pass Shader
- 现代项目中意义不大，GPU Instancing 更常用
### GPU Instancing

适用于大量相同网格+相同材质但位置/颜色不同的物体（树木、草、敌人群等）。

// Shader 中启用 Instancing

#pragma multi_compile_instancing

// C# 侧用 DrawMeshInstanced 或在 Material 上勾选 Enable GPU Instancing

Graphics.DrawMeshInstanced(mesh, 0, material, matrices);

- 原理：一次 DrawCall 传入多个实例的变换矩阵，GPU 批量处理
- 优点：几乎不增加 CPU 开销，性能极好
- 要求：同一 Mesh + 同一 Material，Shader 需支持 Instancing
### SRP Batcher（URP/HDRP 专属）

Project Settings → Graphics → SRP Batcher ✓

- 原理：不合并网格，而是缓存 GPU 侧的 Shader 常量缓冲区，减少状态切换
- 不要求同一材质，只要求同一 Shader
- 现代 URP 项目中最推荐的方式，兼容性最好
- 可在 Frame Debugger 中看到 "SRP Batch" 标签
## 静态 vs 动态 对比总结

|方式|适用场景|内存开销|CPU开销|要求|
|---|---|---|---|---|
|静态批处理|不移动的物体|高（顶点复制）|低|同材质|
|动态批处理|小型移动物体|低|中（每帧合并）|同材质+顶点限制|
|GPU Instancing|大量相同物体|低|极低|同Mesh+同材质|
|SRP Batcher|URP/HDRP通用|低|低|同Shader|
## 实用建议

减少 DrawCall 的核心原则：

1. 合并材质 → 使用textureAtlas [[纹理图集]]将多张贴图合为一张
2. LOD 系统 → 远处物体用低精度网格，减少顶点处理量
3. Occlusion Culling → 被遮挡物体不提交 DrawCall
4. Frustum Culling → 视锥体外的物体自动剔除（Unity 默认开启）
5. Frame Debugger → Unity 内置工具，可逐帧查看每个 DrawCall 的来源

Window → Analysis → Frame Debugger

一般移动端建议控制在 100 以内，PC/主机端可以承受 1000+，但实际瓶颈还取决于 Shader 复杂度和带宽。