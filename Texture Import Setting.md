Texture Type 会改变：

1. 默认导入参数（压缩、mipmap、可读性等）
2. Inspector 里显示的选项
3. 运行时怎么用这份数据
- 选 Sprite (2D and UI) → 出现 Sprite Mode、Mesh Type、Extrude Edges 等
- 选 Default → 主要是 3D 贴图相关选项
- 选 Normal map → 有法线贴图专用选项

 **Extrude Edges**
 把 Sprite 边缘像素向外「挤出」一圈，避免渲染时出现颜色渗色（bleeding）
 常见场景：
- 图集（Sprite Atlas）里多张图挤在一起
- Mesh Type = Tight 时网格贴边很紧，更容易渗色
- 缩放、旋转时用双线性过滤

一般 1～2 就够，太大反而浪费图集空间。

**Wrap Mode**
它来决定当 [[UV]] 超出 0～1 范围时[^1]，纹理怎么采样。

|模式|行为|
|---|---|
|Repeat|平铺重复|
|Clamp|超出部分一直用边缘像素（不再重复）|
|Mirror|镜像平铺|

对 UI Sprite 来说，UV 通常就在 Sprite 矩形内，Clamp 一般就够，很少用到 Repeat。

Wrap Mode 更常影响：

- 3D 材质平铺地面、墙面
- 自定义 Shader 里 UV 会超出 0～1 的情况


[^1]: 1、故意平铺2、模型UV重复铺3、shader自己算UV
