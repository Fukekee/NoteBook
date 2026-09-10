### 什么样的模型算「凸面模型」（Convex Mesh）
一个三维形体是 凸（Convex） 的，当且仅当：

> 在形体内任取两点 A、B，连接它们的线段 AB 完全位于形体内部（不会穿出表面）。
###  Unity 物理中的「Convex MeshCollider」

Unity 的 `MeshCollider.convex = true` 时，PhysX 会自动给你的网格生成一个 凸包（Convex Hull），限制条件：

- 最多 255 个三角面（超过会被简化）
- 必须是闭合实体，不能是单面 plane
- 即使你的原始模型是非凸的，Unity 也会用「最外层凸包」去近似——也就是说凹陷会被「填平」
### Unity MeshCollider 凸包（Convex Hull）要求

### 1. 为什么要有「凸包要求」

Unity 使用的物理引擎是 PhysX。PhysX 对碰撞体有两种处理路径：

- Convex（凸）：两个凸体之间的碰撞检测很快，支持 Rigidbody（动态物理）
- Concave（凹/三角网格）：只能当 静态物体，不能挂 Rigidbody

所以规则很简单：

> 凡是需要运动（有 Rigidbody）的 ==MeshCollider，必须勾选 `convex = true`==。

### 2.不勾选 `convex`（三角网格模式）时的限制

|限制|说明|
|---|---|
|不能挂 Rigidbody|或者说挂了也没法做动态模拟，只能是 kinematic 或 static|
|只能与 Convex 体发生碰撞|两个 concave MeshCollider 之间不会产生碰撞|
|面数上限取决于项目设置|默认上限较高，但面数太多会严重影响性能|
