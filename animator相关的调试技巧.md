## 三、调试用的 Inspector 功能合集

### 3.1 Parameters 面板 —— Trigger 右边的圆圈

- ⭕ 空心圆（运行时）= 手动触发按钮
- 单击 → 立即 `SetTrigger`
- 仅 Play 模式有效，Edit 模式点了不会保存
- Bool 旁边是 ✅ 复选框，Float/Int 旁边是数值输入框，都可以运行时手改

小技巧：调状态机时不要急着写代码触发 trigger，先 Play 模式手动点圆圈验证 transition 配得对不对。

### 3.2 Transition 上的 Solo / Mute

|选项|作用|用法|
|---|---|---|
|Mute|临时禁用这条 transition|怀疑某条 transition 在抢，勾上看看|
|Solo|让源 state 上只有这条生效|隔离测试某一条|

⚠️ 调完记得取消！上线前清空所有 Solo/Mute（很多 bug 是忘记取消导致的）。

### 3.3 Transition 上的 Interruption Source（你问的）

控制"这条 transition 进行到一半时，还能不能被别的 transition 打断"。

|选项|含义|
|---|---|
|None|transition 进行中任何东西都打不断（即使条件满足）|
|Current State|只有从源 state出发的其他 transition 能打断|
|Next State|只有目标 state上的 transition 能打断（少见）|
|Current State Then Next State|先看源，再看目标|
|Next State Then Current State|先看目标，再看源|
|Ordered Interruption（复选框）|按 Inspector 顺序评估，只允许排在前面的打断|

典型场景：

- 角色 Idle → Walk 过渡到一半，玩家按了跳跃 → 想立刻跳起来：把 Walk transition 的 Interruption Source 设为 `Current State`（这样 Idle 上的 Jump transition 能打断它）
- 不希望 Hit 动画被任何东西打断：`None`

小技巧：默认 `None` 会导致角色"反应迟钝"（玩家按了键但要等过渡完才响应）。动作游戏里常见 bug。

### 3.4 Transition 上的 Can Transition To Self

- 勾上 = 允许自己跳到自己（重新播放当前动画）
- 用于"连续攻击"等需要重置当前 clip 的场景

### 3.5 Animator 窗口的右上角 Live Link

- Play 模式下，当前激活的 state 会高亮蓝色，正在 transition 的箭头会有进度条
- 这是最直观的调试方式：动画卡了第一眼就能看是哪个 state、哪个 transition 进度卡住

### 3.6 Layers 面板的 Weight 滑条

- 运行时拖动可以实时改图层权重（如 Upper Body 叠加层）
- Edit 模式改的是默认权重

### 3.7 Animator Inspector 的几个 checkbox

|选项|调试用途|
|---|---|
|Apply Root Motion|关掉看是不是 Root Motion 把角色拽偏了|
|Update Mode|切到 `Unscaled Time` 测时间缩放下的表现|
|Culling Mode|角色不在视野内时是否更新；调远景动画异常时关掉|

---

## 四、其他容易被忽视但很有用的"调试/技巧位"

### 4.1 Parameters 面板顶部的搜索框

参数多到几十个时，输入名字直接过滤。给参数命名加前缀（如 `Combat_Attack`, `Locomotion_Speed`）就能批量过滤。

### 4.2 Transition 的 Settings 折叠面板

|字段|用法|
|---|---|
|Has Fixed Duration|Duration 单位是秒（勾）还是 normalized（不勾）|
|Transition Offset|进入目标 state 时不从 0 开始，而是从指定 normalized time 开始 → 用于"动作衔接位相同"的场景|
|Exit Time|见前面文档|

Transition Offset 的妙用：两个跑步动画衔接时，让目标动画从相同步态点开始（如都从 0.25），脚步就不会突然换边。

### 4.3 Animation Window 的 Event 列表

- 顶部有事件标记（小白旗）
- 双击可以编辑 Function 名、参数、time
- 小技巧：选中 event 后可以直接拖动调时间，比改 normalized 数值直观

### 4.4 Animator 窗口 → 右键 State → Set as Default

调试时想跳过前面流程直接进某个 state，改默认 state 比写代码 Play 快。

### 4.5 Conditions 行末的 ≡ 拖动柄

多个 Condition 之间可以拖动改顺序（虽然都是 AND，顺序不影响逻辑，但读起来清晰）。
## 五、Parameters 使用上的高频小技巧

### 5.1 命名约定

Locomotion_Speed ← 哪个系统用的

Combat_AttackTrigger

State_IsDead

后期参数一多就知道好处了。

### 5.2 Default Value 一定要设对

IsGrounded: default = true ← 角色出生在地面上

IsDead : default = false

HP : default = 100

Default 设错的话，Awake 那一帧就可能错切到一个奇怪的 state。

### 5.3 用 StringToHash 优化

频繁调用时不要传字符串：

private static readonly int SpeedHash = Animator.StringToHash("Speed");

animator.SetFloat(SpeedHash, value);

- 避免每次哈希计算
- 拼写错误编译期就能发现（变量名错而不是字符串错）

### 5.4 防御性 ResetTrigger

animator.ResetTrigger("Attack");

animator.SetTrigger("Attack");

彻底解决"上次的 trigger 残留导致连切两次"。

### 5.5 用 AnimatorController.parameters 做运行时校验

写工具脚本时可以遍历 `animator.parameters` 检查参数是否存在，避免运行时 SetXxx 失败静默无报错。

### 5.6 动态切换 Controller 时 Parameters 会丢

animator.runtimeAnimatorController = newController;

新 Controller 的参数值是初始值，旧的不会迁移。需要手动重写。
## 六、调试功能速查表

| 位置                   | 功能                               | 用途                        |
| -------------------- | -------------------------------- | ------------------------- |
| Parameters 面板        | Trigger 圆圈 / Bool 复选框 / Float 输入 | 运行时手动触发                   |
| Transition Inspector | Mute                             | 临时禁用                      |
| Transition Inspector | Solo                             | 隔离测试                      |
| Transition Inspector | Interruption Source              | 控制能否被打断                   |
| Transition Inspector | Can Transition To Self           | 允许自跳                      |
| Transition Inspector | Has Fixed Duration               | 切换 Duration 单位            |
| Transition Inspector | Transition Offset                | 目标 clip 起播时点              |
| Animator 窗口          | 实时高亮 + 进度条                       | 看当前 state 和 transition 进度 |
| State Inspector      | Speed                            | 改播放速度（负数倒放）               |
| State Inspector      | Foot IK / Mirror                 | 镜像、IK 调试                  |
| Layers 面板            | Weight 滑条                        | 实时调图层权重                   |
| Animator 组件          | Apply Root Motion                | 排查位置异常                    |
| Animator 组件          | Update Mode                      | 排查时间缩放问题                  |
| Animator 组件          | Culling Mode                     | 排查不在视野时不更新                |
| Animation 窗口         | Event 拖动                         | 直观调 event 时间              |
| State 右键菜单           | Set as Default                   | 跳过前置直接测某 state            |

---


也就是说，如果我想实现当玩家speed大于5的话，就由state1变为state2,那么，我首先要在外部代码中（比如playerController)写animator.SetFloat("Speed", rb.velocity.magnitude);把animator中的名叫speed的float参数注册为speed，然后再用玩家速度来加入condition中进行判断

# 是的，理解完全正确，但有几个用词需要校准一下

## 你的理解（用更准确的话复述）

1. 在 Animator Controller 的 Parameters 面板里，建一个 Float 参数，名字叫 "Speed"

2. 在 Transition (state1 → state2) 的 Conditions 里，加一行：Speed Greater 5

3. 在外部代码（如 PlayerController）每帧调用：

animator.SetFloat("Speed", rb.velocity.magnitude);

4. 这样 Animator 内部的 "Speed" 就会跟着角色实际速度变，

condition 判断的就是真实速度

✅ 这个流程完全正确，可以照着做。

---

## 几个用词校准（避免后续踩坑）

### 1. 不是"注册"，而是"赋值/写入"

> "把 animator 中的名叫 speed 的 float 参数注册为 speed"

注册（register）这个词容易让人以为是"建立绑定关系，以后就自动同步了"。

实际是：

- `SetFloat` 是一次性赋值，不是订阅
- 每帧调用才能让 `Speed` 持续反映真实速度
- 写一次就走人 → `Speed` 就停在那个值不动了

正确说法："每帧把 rb 的速度写入 Animator 的 Speed 参数"。

### 2. 标准写法应该放在 Update 里

void Update()

{

animator.SetFloat("Speed", rb.velocity.magnitude);

}

或者更稳妥（物理相关用 FixedUpdate 更合理，但 Animator 在 Update 也 OK）：


### 3. 名字必须完全一致（区分大小写）

- Animator 里叫 `Speed`，代码必须写 `"Speed"`
- 写成 `"speed"` 不会报错，但写不进去（Unity 只在 Console 出 warning，容易漏看）
- 最佳实践：

private static readonly int SpeedHash = Animator.StringToHash("Speed");

void Update()

{

animator.SetFloat(SpeedHash, rb.velocity.magnitude);

}

---


## 容易忽略的细节

### 细节 1：Has Exit Time 一般要关掉

如果勾着 Has Exit Time，速度大于 5 还得等当前动画播到 Exit Time 才会切，玩家会觉得"按了键不响应"。

走路 / 跑步类切换，通常 Has Exit Time = 关，让 condition 一满足就立刻切。

### 细节 2：阈值要留迟滞，避免边界抖动

如果反向也用 5：

state1 → state2 : Speed > 5

state2 → state1 : Speed < 5

当玩家速度在 4.99 ↔ 5.01 来回波动（手柄微动、地面摩擦），动画就疯狂跳来跳去。

正确做法：

state1 → state2 : Speed > 5.0

state2 → state1 : Speed < 4.5 ← 留 0.5 缓冲

### 细节 3：默认值要合理

`Speed` 默认 0，如果你的 state1 是 Idle、state2 是 Run，刚启动时 Speed = 0 < 5，待机，没问题。 但如果 state1 是 Run（错装成默认）、state2 是 Idle，启动那一瞬间会从 Run 切 Idle，可能有视觉跳。

### 细节 4：rb.velocity.magnitude 包含 Y 轴

如果角色在跳跃下落，`magnitude` 会包含下落速度，可能误触发 Run。建议只取水平分量：

Vector3 horizontalVel = new Vector3(_rb.velocity.x, 0f, _rb.velocity.z);

_animator.SetFloat(SpeedHash, horizontalVel.magnitude);

### 细节 5：Float 还可以加 Damp（平滑过渡）

_animator.SetFloat(SpeedHash, targetSpeed, dampTime: 0.1f, deltaTime: Time.deltaTime);

这样 Animator 内部的 Speed 不会瞬变，而是平滑过渡到目标值。Blend Tree 混合时尤其有用，能让 Idle→Walk→Run 的过渡更自然。

---

## 一句话总结

> 你的理解对："建参数 → 在代码里每帧写值 → Animator 用这个值评估 Conditions" 是 Unity Animator 跟外部世界连通的标准模式。

