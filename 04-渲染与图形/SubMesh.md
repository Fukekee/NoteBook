## 一、SubMesh 是什么

核心概念：一个 `Mesh` 资产可以包含多组三角形索引，每一组就是一个 SubMesh。所有 ==SubMesh 共享同一份顶点数据（vertices/normals/uv/tangents/骨骼权重）==，只是用不同的索引把这些顶点组合成不同的三角形集合。

每个 SubMesh 有自己的：

- Index Buffer（三角形索引列表）
- Topology（Triangles / Lines / Points / Quads）
- firstVertex / vertexCount / indexStart / indexCount（在共享顶点池中的范围）

而 `MeshRenderer.materials[i]` 就是负责绘制 `subMeshes[i]` 的材质。
## 二、SubMesh 与"独立 GameObject"的对比

很多人会问：那为什么不直接拆成几个独立的 GameObject 呢？

| 对比项         | 单 Mesh + 多 SubMesh               | 多个 Mesh + 多个 GameObject |
| ----------- | -------------------------------- | ----------------------- |
| 顶点数据        | 共享，省内存                           | 各自一份                    |
| 顶点焊接 / 边连续  | 可以做到（共享顶点）                       | 不行（各自独立顶点）              |
| 骨骼蒙皮        | 共享一套骨骼权重和绑定                      | 各自蒙皮，骨骼引用复杂             |
| Culling     | 整个物体一起被 culling                  | 各自独立 culling            |
| 启用/隐藏某部分    | 做不到（只能换成透明材质或修改 mesh）            | 灵活，直接 SetActive         |
| DrawCall 数量 | 每 SubMesh 1 次（可被 SRP Batcher 合并） | 每 GameObject 1 次        |
| 典型用法        | 角色/复杂物体的不同部位                     | 可拆卸装备、独立运动的部分           |

> 关键：蒙皮角色几乎一定是单 Mesh 多 SubMesh，因为所有部位需要共享同一套骨骼权重才能正确变形。如果脸是一个 GameObject、衣服是另一个，那两个 SkinnedMeshRenderer 各自蒙皮，可能在拉伸时缝隙错位。

### 选中 Mesh 资源，看 Inspector 底部预览（最直观）

1. 在 Project 窗口找到模型文件（`.fbx` 或 `.glb`）
2. 点开三角箭头，里面会有一个或多个 `Mesh` 子资源（图标是网格图样）
3. 选中那个 Mesh 子资源
4. Inspector 底部预览面板会显示：
    - `Vertices: 12345`
    - `Tris: 6789`
    - `SubMeshes: 5` ← 这里直接告诉你 SubMesh 数量
### 4. SubMesh 顺序的影响

SubMesh 的顺序 == Materials 数组的顺序 == 默认绘制顺序。所以如果你想做"先画身体再画衣服（解决半透明排序问题）"，可以调整 Mesh 内部 SubMesh 的顺序（导出时控制）。


### 在 3D 软件里给不同面分配不同材质（创建多SubMesh的模型)

Blender 示例：

1. 进入 Edit Mode → 选中"嘴部"的面
2. 右侧 Material 面板 → `+` 添加新材质 → 命名"Lip"
3. 点击 `Assign` 把当前选中的面分配给这个材质
4. 重复对其他部位（眉、眼、皮肤）
5. 导出 FBX → Unity 自动按材质拆 SubMesh
