BlendTree 是 Animator 里和 State 平级的概念，它的核心作用是 根据一个或多个参数的连续变化，平滑地混合多个动画，让动画过渡看起来自然、连续，而不是生硬地切换。
## 一、BlendTree 的本质

[^1]> BlendTree 是 State 的一种特殊形态：从外面看它就是一个状态节点，但内部根据参数实时混合多个 Clip 的姿态。

- 它出现在 Animator Controller 里，和 State 一样可以连 Transition
- 双击进入后，可以编辑内部的混合逻辑
- 输出的"姿态"是多个 Clip 的加权平均

[^1]: 和普通states之间的切换Duration最大的不同是它不是只能一个过渡瞬间，它可以持续很久，就像根据参数后计算的一个新过渡状态

## 二、BlendTree 的类型

创建 BlendTree 时（右键 State 区域 → Create State → From New Blend Tree，再双击进入），可以选择 Blend Type：

### 1. 1D（一维混合）

最常用、最简单。根据一个参数的值在多个 Clip 之间混合。

经典例子：移动速度

- 参数：`Speed`

Motion 列表：

| Threshold | Motion |
| --------- | ------ |
| 0         | Idle   |
| 2         | Walk   |
| 6         | Run    |
参数值落在两个 Threshold 之间时，按线性插值混合。

### 2. 2D Simple Directional（二维简单方向）

根据两个参数混合，适合方向性动画，且每个方向只有一个动画。

经典例子：八方向移动

- 参数：`MoveX`、`MoveY`
Motion 列表（每个动画对应一个方向坐标）：

|Pos X|Pos Y|Motion|
|---|---|---|
|0|1|WalkForward|
|1|0|WalkRight|
|0|-1|WalkBackward|
|-1|0|WalkLeft|
|……|……|……|
要求：所有 Motion 不能有重复方向。

### 3. 2D Freeform Directional（二维自由方向）

类似 Simple Directional，但允许同一方向上有多个动画（比如同方向的快走和慢走）。

例子：方向 + 速度的组合

- 参数：`MoveX`（左右）、`Speed`（前进速度）
- 既能控制方向，又能控制速度，比如"向前慢走"和"向前快跑"在同一方向上

### 4. 2D Freeform Cartesian（二维自由笛卡尔）

最灵活的二维混合，两个参数没有方向性约束，纯粹根据二维坐标距离做混合。

例子：策略游戏的转向 + 速度

- 参数 X：`AngularSpeed`（转向速度，可正可负）
- 参数 Y：`ForwardSpeed`（前进速度）
- 可以做"原地转身""边走边转""边跑边急转"等各种组合

### 5. Direct（直接控制）

每个 Motion 直接绑定一个参数，手动控制每个动画的权重。

经典例子：表情融合（FaceCap、Blend Shape 表情）

- 一个参数控制 Smile 权重
- 一个参数控制 Frown 权重
- 一个参数控制 Eye Close 权重
- 任意组合 → "微笑闭眼""皱眉睁眼"等

也常用于程序化叠加多个动画层。
## 三、典型应用场景

### 场景 1：角色移动（最经典）

1D BlendTree，参数 `Speed`：

Idle (0) → Walk (2) → Run (6) → Sprint (10)

配合代码 `animator.SetFloat("Speed", currentSpeed)` 实时驱动。

### 场景 2：八方向移动

2D Simple Directional，参数 `MoveX`、`MoveZ`：

角色根据摇杆/键盘的方向输入，在 8 个方向动画之间平滑混合

### 场景 3：第三人称射击的瞄准

2D Freeform Cartesian，参数 `AimX`（左右）、`AimY`（上下）：

9 个动画：左上瞄准、上瞄准、右上瞄准 / 左瞄准、中心瞄准、右瞄准 / 左下、下、右下

角色枪口可以平滑跟随准星方向。

### 场景 4：表情系统

Direct BlendTree：

直接控制 Smile、Sad、Angry、Surprise 各自的权重，组合出复杂表情

### 场景 5：嵌套 BlendTree

内层用 1D 控制速度，外层用 2D 控制方向：

外层（2D 方向）

├── 前方 → 内层 1D（Idle/Walk/Run）

├── 后方 → 内层 1D（Idle/Walk/Run）

├── 左方 → 内层 1D（Idle/Walk/Run）

└── 右方 → 内层 1D（Idle/Walk/Run）

实现"任意方向 + 任意速度"的完整移动系统。
## 四、容易踩的坑

1. **参数突变导致动画抖动**  
    忘记用平滑过渡，角色从静止到全速会瞬间从 Idle 跳到 Run，看起来不自然。
    比如这样解决：animator.SetFloat("Speed", targetSpeed, 0.1f, Time.deltaTime);
    
2. **Threshold 设置不合理**  
    1D BlendTree 里 Threshold 间距不均匀，会导致某些速度区间动画混合得很怪。建议用 Compute Thresholds 让 Unity 根据 Root Motion 自动计算。
    
3. **动画节奏不一致**  
    Walk 和 Run 的脚步频率差太多，混合时脚会"打架"。需要：
    
    - 用 Time Scale 调整每个 Clip 的播放速度
    - 或勾选 Adjust Time Scale → Homogeneous Speed，让 BlendTree 自动同步节奏
4. **2D 模式下动画分布不均**  
    方向动画在二维空间分布不对称，会导致某些方向混合很奇怪。建议对称布局，每个方向至少有一个代表性动画。
    
5. **Direct 模式参数太多**  
    每加一个 Motion 就要加一个参数，参数管理容易混乱。适合表情、Blend Shape 这类天然就是"多通道"的场景。
    
6. **Root Motion 的混合**  
    多个 Clip 各自的 Root Motion 会被加权混合，可能导致角色实际位移与预期不符。需要在每个 Clip 的导入设置里调好 Root 节点。
    
7. **BlendTree 里的事件触发**  
    Animation Event 在 BlendTree 内部 Clip 上触发时，只有权重 > 0 的 Clip 的事件才会被触发，而且会按权重比例触发——这点容易引起混淆，比如脚步声可能在混合时少触发或多触发。