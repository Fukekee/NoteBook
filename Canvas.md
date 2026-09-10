Render mode
    Overlay : 永远在屏幕最顶层，不经过任何相机
    Camera : 指定相机，canvas会放置在相距PlaneDistance处，超过相机的frustum就看不到了，**3D物体是可以遮挡canvas的**
    World Space : 就是canvas作为一个世界物体出现在画面中

### Overlay 的特征

- UI 像贴在屏幕玻璃上：清晰、扁平、无透视
- Game View 里看 UI 是绝对像素位置（左下、左上、中心都精确）
- Scene View 里 Canvas 显示成"1080×2280 米"的巨型矩形（漂在世界很远的地方）

### Screen Space - Camera 的特征

- UI 是相机正前方一块"贴片"，仍然铺满屏幕
- 但跟 3D 世界共享同一套渲染管线 → 会被 PP 处理、会被光晕影响、会被透明 3D 物体遮挡
- 适合那种"屏幕里有一个透明的 HUD，但你希望它和场景同呼吸共调色"的视觉风格
- 缺点：如果 3D 内容飞到 Plane Distance 之内，会盖住你的 UI（容易出 bug）