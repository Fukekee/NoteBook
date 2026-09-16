**image与RawImage的区分：**

| 点     | Image                                                                 | Raw Image                                                  |
| ----- | --------------------------------------------------------------------- | ---------------------------------------------------------- |
| 贴图类型  | **Sprite**（Texture2D 需导入为 Sprite）                                     | **任意 Texture**（Texture/RenderTexture/WebCamTexture/Video等） |
| UI 功能 | 支持 **Type**：Simple / **Sliced(九宫格)** / **Tiled** / **Filled(进度条扇形等)** | **不支持**九宫格/填充/平铺，仅做原始纹理显示                                  |
| UV/裁剪 | 基础（不暴露UV）                                                             | **UV Rect** 可裁剪/偏移显示纹理的一部分                                 |
| 动态源   | 不擅长（需要先做成 Sprite）                                                     | **非常适合**摄像头、视频、后处理输出（RenderTexture/RT）                     |
| 合批/图集 | 可与 **Sprite Atlas** 合图，UI 默认材质易 **合批**，性能好                            | 不走精灵图集；不同纹理/材质更容易 **打断合批**                                 |
| 形状/边缘 | 可用 Sprite 的 **Tight/自定义多边形网格** 减少过绘                                   | 网格始终是矩形，过绘更多                                               |
| 适用场景  | 图标、按钮、面板底、进度条、九宫格                                                     | 小地图RT、视频帧、WebCam、外部流纹理                                     |
**关于image组件上的一些属性解释：**

**Image Type:**
- Image下type为**sliced**:
给 Sprite 做 Border 就是设置九宫格（9-slice）边界，在 Unity 的 Sprite Editor 里手动拖，目的是让图片缩放时四个角不变形、只拉伸中间和边

- Image下type为**Filled**:
做进度条、圆形加载等

- Image下type为**Tiled**:
让 Sprite 重复铺满目标区域，而不是拉伸。区域变大时，图案像贴瓷砖一样一块块复制平铺，保持原始像素密度不被拉伸变形。

**Pixels Per Unit Multiplier** 的作用：

它是 Tiled / Sliced 模式下的一个缩放倍率，控制平铺单元和边框的"显示密度"。

**Material:**

作用：控制这张 Image 怎么画出来（用什么 Shader）。

-  None (Material) 时，Unity 会用内置的 `UI/Default` Shader，就是普通 UI 贴图显示。
- 填了自定义 Material 后，会换成那个 Material 上的 Shader，可以做例如：
    - 灰度、溶解、描边、圆角
    - 自定义颜色/透明度混合
    - 滚动、扭曲等 UI 特效

**Raycast Padding:**

它专门用来从四周往里缩小「可点击 / 可被射线检测」的区域。

**Maskable:**

这张 Image 要不要受父级遮罩（Mask）影响。
(遮罩靠 Stencil 实现，所以自定义 UI Material 的 Shader 也要支持 Stencil，否则 Maskable 可能失效。)

**Use sprite mesh:**
Use Sprite Mesh（使用 Sprite 网格）是 `Image Type = Simple` 时的一个选项，作用是：不用默认的矩形四边形来画。

会改用 Sprite 在 Sprite Editor 里定义的网格，常见几种：

| Sprite 的 Mesh Type | 网格形状                        |
| ------------------ | --------------------------- |
| Full Rect          | 还是矩形，勾选与否差别不大               |
| Tight              | 网格紧贴非透明像素轮廓                 |
| Custom             | 用你在 Sprite Editor 里手画的自定义网格 |
[^1]
[^1]: 这些都是在sprite对应的texture import setting里面可以看到

- **有什么用**
1. 减少透明区域的 overdraw  
    不规则图标（圆形、不规则剪影）时，GPU 少画很多无效像素，对移动端有一定帮助。
    
2. 边缘更贴合 Sprite 轮廓  
    渲染几何和 Sprite 实际形状一致，某些情况下边缘更干净。