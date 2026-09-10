`Sprite` 是 Unity 里的一种资源类型/对象，是对贴图（`Texture2D`）的一层"裁剪 + 元数据"包装，专门给 2D 和 UI 用。

## 关键概念区分

- 图片格式：PNG、JPG、TGA 等，是磁盘上文件的编码方式。
- `Texture2D`：图片被 Unity 导入后，在显存里的原始像素数据（GPU 能采样的贴图）。
- `Sprite`：在 `Texture2D` 基础上再包一层，记录"用这张贴图的哪一块矩形区域、以及一些 2D 相关参数"。

所以三者关系是：

磁盘 PNG 文件 →（导入）→ Texture2D（像素） →（包装）→ Sprite（区域+元数据）

## Sprite 里多存了什么

相比纯贴图，`Sprite` 额外携带：

- Rect：在图集里截取哪一块区域（这样多个 Sprite 能共享同一张大图 = 图集 Atlas）。
- Pivot：轴心点（旋转/定位的中心）。
- Pixels Per Unit：多少像素对应世界里的 1 单位（决定 2D 物体显示大小）。
- Border：九宫格边界（给 `Image` 的 Sliced 模式用）。
- 物理外形 / 网格等。

## 为什么需要 Sprite 这一层

主要是为了 图集（Sprite Atlas）合批：很多小图标可以打进一张大贴图，每个 `Sprite` 只是"指向大图里的一小块"。渲染时它们共用同一张 `Texture`，能合并 draw call，性能更好。这也是 `Image`（吃 Sprite）比 `RawImage`（吃裸 Texture）更适合做大量 UI 元素的原因。