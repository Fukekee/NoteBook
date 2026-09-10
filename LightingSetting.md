## LightingData（上方）

- 图标：齿轮 + 橙色球体
- 文件扩展名：`.asset`
- 内容：存储的是烘焙结果数据
    - 烘焙好的光照贴图（Lightmap）索引信息
    - 光照探针（Light Probe）数据
    - 反射探针（Reflection Probe）数据
    - 实时GI数据
- 何时生成：点击 Bake 按钮后由 Unity 自动生成，不能手动创建
- 删除后果：已烘焙的静态光照效果全部丢失，需要重新烘焙

## New Lighting Settings（下方）

- 图标：灯泡 + 齿轮
- 文件扩展名：`.lighting`
- 内容：存储的是烘焙参数配置
    - Skybox Material 设置
    - 环境光颜色/强度
    - 烘焙模式（Realtime/Baked/Mixed）
    - Lightmapper 参数（采样数、分辨率等）
- 何时生成：手动点击 Lighting 窗口中的 "New Lighting Settings" 创建
- 删除后果：配置参数丢失，但已烘焙的光照贴图不受影响

关于场景中的环境光设置：window—rendering—lighting
在对应的窗口中的scene标签下点击new,可以创建场景下的lightingSettings文件，
在Environment标签下可以配置 #skyBox 
点击下方的GenerateLighting可以烘培出lightingData文件
值得一提的是，就算不要这些lighting文件，加载场景的时候还是可以出现之前设置的environment效果，因为.unity文件本身也会存储这样的环境信息。
