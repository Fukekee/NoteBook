## 一、Parameters 是什么？归谁所有？

### 1.1 本质：Animator Controller 的"内部变量表"

Parameters 是 Animator Controller 资产里定义的变量，但值的实例归挂载这个 Controller 的 Animator 组件持有。

Animator Controller (.controller 资产) ← 定义有哪些参数（Schema）

↓ 被多个 GameObject 引用

Animator 组件 A → 各自维护自己一份参数值（实例）

Animator 组件 B → 各自维护自己一份参数值（实例）

⚠️ 所以同一个 Controller 被两个角色用，他们的 `Speed` 互不影响。

### 1.2 你问的"float 代表谁的值"

> "我设了一个 float 作为 condition，那么这个 float 代表的是谁的值？"

它不代表任何外部对象的值。它就是这个 Animator 实例自己的一块内存，初始 = 你在 Inspector 里设的 default 值。

要让它"代表"某个东西（如角色速度），必须由外部代码每帧写进去：

animator.SetFloat("Speed", rb.velocity.magnitude);

不写就永远是默认值。这是新手常误解的点：以为 `Speed` 自带"角色速度"含义——其实只是个名字。

---

## 二、四种 Parameter 类型 + 典型场景

|类型|在 Conditions 里的比较|典型场景|
|---|---|---|
|Float|`Greater` / `Less` 双阈值|移动速度、Blend Tree 权重、混合比|
|Int|`Equals` / `NotEqual` / `Greater` / `Less`|武器类型 ID、关卡阶段、连击数|
|Bool|`True` / `False`|是否在地面、是否瞄准、是否手持物品|
|Trigger|不能选比较，只有"是否被触发"|跳跃、攻击、受击、开门等一次性事件|

### 2.1 Float 的常见模式

模式 A：阈值切换（Idle ↔ Walk ↔ Run）

Idle → Walk : Speed > 0.1

Walk → Run : Speed > 4.0

Run → Walk : Speed < 3.5 ← 留迟滞，避免边界抖动

Walk → Idle : Speed < 0.05

⚠️ 小技巧：去↑和回↓的阈值一定要错开（hysteresis），否则角色会在临界值上抖。

模式 B：Blend Tree 的混合权重

1D Blend Tree by Speed:

Idle threshold = 0

Walk threshold = 2

Run threshold = 6

Float 在这里是连续的混合参数，不再是离散切换。

### 2.2 Int 的典型场景

WeaponType: 0=拳头, 1=刀, 2=枪

→ 用一个 Int 切到不同武器的 Idle/Attack 子状态

小技巧：与其用一堆 Bool（`HasSword`, `HasGun`...），不如用一个 Int 互斥，状态机干净很多。

### 2.3 Bool 的典型场景

- `IsGrounded`、`IsAiming`、`IsCrouching`：持续性状态
- 跟 Trigger 的关键区别：Bool 一直保持，Trigger 一次性消费

### 2.4 Trigger 的典型场景

- `Jump`、`Attack`、`Hit`、`Die`：一次性事件
- 因为会自动消费，不用担心忘记 ResetTrigger（多数情况）

⚠️ Trigger 的小坑：

|坑|现象|解法|
|---|---|---|
|提前 SetTrigger|还没轮到那条 transition 评估，trigger 已被另一条 transition 消费|用 Bool 替代，或者在合适时机才 Set|
|Trigger 被多条 transition 同时监听|第一条吃掉，第二条永远等不到|同一时机别让多条 transition 同 trigger|
|想"按住才连续触发"|Trigger 不会持续 true|改用 Bool|

保险写法：在关键时机先 `ResetTrigger("Attack")` 再 `SetTrigger("Attack")`，避免上次残留。