Sub-State Machine（子状态机）是 Animator Controller 里用来 组织和封装一组相关 State 的容器。它的核心作用是 让复杂的状态机变得可读、可维护、可复用，而不是让你在一张图上塞几十个 State 和上百条 Transition。

### 应用示例场景 ：分类组织角色状态

Base Layer
     Locomotion (六边形)
        Idle、Walk、Run、Sprint
     Combat (六边形)
        Attack1、Attack2、Combo、Heavy
     Hit (六边形)
        HitFront、HitBack、HitLeft、HitRight
     Death (六边形)
        Die1、Die2、Die3

外层只看到 4 个六边形节点（Sub-State Machine 的图标），双击进去才看到内部细节。

### 跨层级的 Transition

这是 Sub-State Machine 最关键也最容易混淆的部分。

#### 场景：从 Sub-State Machine 内部跳到外面的 State

例如：`Combat/Attack3` 结束后要回到外面的 `Locomotion/Idle`。

操作步骤：

1. 进入 Combat 子状态机
2. 右键 `Attack3` → Make Transition
3. 拖到 (Up) Base Layer 节点
4. 弹出菜单选择目标 State：`Locomotion → Idle`

#### 场景：从外面跳进 Sub-State Machine 的某个内部 State

例如：从 `Locomotion/Idle` 直接跳到 `Combat/Attack1`（而不是从 Combat 的 Entry 进入）。

操作步骤：

1. 在外层右键 `Idle` → Make Transition
2. 拖到 `Combat` 六边形
3. 弹出菜单选择：
    - `Combat` (Entry) → 走 Entry 默认流程
    - `Combat → Attack1` → 直接进入指定 State

#### 场景：从 Sub-State Machine 整体跳走

直接在外层从 `Combat` 六边形拉一条 Transition 到 `Hit` 六边形——表示任何在 Combat 里的状态满足条件都会跳到 Hit。

### Entry 节点的高级用法

子状态机的 Entry 不只是"指向默认 State"，它还可以带条件分支：

Entry

├── 条件 A 满足 → AttackLight

├── 条件 B 满足 → AttackHeavy

└── 默认 → AttackNormal

操作：右键 Entry → Make Transition，可以连接到多个 State，并设置条件。

实际用途：根据进入时的状态智能选择子状态机内部的起始 State。例如：进入 Combat 时根据武器类型选择不同的初始攻击动画。
### Sub-State Machine 与 Any State

==`Any State` 是 Layer 级别的==（也存在于 Sub-State Machine 内部，是该 Sub-State Machine 内部的 Any State）。

- 外层 Any State：可以跳到外层任意 State 或 Sub-State Machine
- 内层 Any State：只对该子状态机内部的 State 生效

> 注意：每一层都有自己的 Any State，作用范围仅限本层。