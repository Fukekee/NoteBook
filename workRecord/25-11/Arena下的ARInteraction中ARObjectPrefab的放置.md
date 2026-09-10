### 使用 SpawnPoint（固定位置）

在 ARInteraction 场景中：

1. 创建一个空 GameObject，命名为 SpawnPoint 或 LanternSpawn

2. 设置该 GameObject 的位置（例如：相机前方 1 米，高度 1 米）

3. 这样 prefab 会生成在这个固定位置

### 使用 AutoPlaceOnGround（自动地面检测）

在 Prefab 上：

1. 添加 AutoPlaceOnGround 组件

2. 添加 ContentPositioningBehaviour 组件

3. 在 ARInteraction 场景中确保有 PlaneFinderBehaviour

4. 这样 prefab 会自动检测地面并放置
