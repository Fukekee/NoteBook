同一个动画效果（比如"按钮放大回弹的脉冲"），既可以用**代码/Tween**（协程手写、或 [[DOTween]]）实现，也可以用 Unity 的 **Animation / [[animator|Animator]]**（[[animation|AnimationClip]] + 状态机）实现。两条路在**复用性**上差异很大，这篇专门对比。

---

## 一、核心结论（先看这个）

| 维度 | 代码 / Tween 驱动 | Animation / Animator 驱动 |
| --- | --- | --- |
| 简单程序化特效（缩放/位移/淡入） | **复用最好**，参数化强，层级无关 | 能复用，但要逐对象挂组件 + 连触发 |
| 复杂手 K 关键帧（角色、多属性编排） | 写起来痛苦 | **强项**，美术可视化调 |
| 跨对象 / 跨层级 | 天然通用 | 受"属性路径"约束（见 [[animation]]） |
| 触发方式 | 直接调方法/传参 | 仍要写代码 `SetTrigger` / `CrossFade` |
| 运行时开销 | 轻（一个协程/一个 tween） | 重（整套 Animator 状态机） |

一句话：**简单可复用特效用代码；复杂手 K 序列用 Animation。**

---

## 二、纠正一个常见误解：Clip / Controller 是可复用资产

很多人以为"两个按钮要用同一个 Animation，就得复制一份 clip、再各建一个状态机"——**不对**。

- `AnimationClip`（`.anim`）是独立资产，**不需要复制**，可被任意多个对象引用。
- `AnimatorController`（状态机）也是资产，也能被多个对象的 `Animator` 组件**共用同一份**。

所以两个广告按钮用 Animation 的正确做法是：

1. 做一个 `Pulse.anim`（缩放放大回弹）
2. 做一个 `AdButton.controller`，里面一个 State 引用这个 clip
3. 两个按钮各挂一个 `Animator`，都指向**同一个** controller 资产

clip 和 controller 都只有一份。

---

## 三、为什么复用能不能成立，取决于"动画作用在谁身上"

这一点是 Animation 复用的命脉，详见 [[animation]] 的"路径绑定"：

- 脉冲动画改的是**按钮自身**的 `localScale`，路径是空字符串 `""`（相对 Animator 所在节点）。这种"作用在根节点自己"的 clip 是**完全层级无关**的，挂到任何对象上都能用 → 复用无障碍。
- 如果 clip 改的是**子节点**属性（比如 `Icon/Glow` 的颜色），两个对象的子层级结构必须一致，否则路径对不上就失效 → 这才是 Animation 复用真正麻烦的地方。

代码/Tween 没有这个约束：你把 `target` 传进去，改谁就是谁，跟层级结构无关。

---

## 四、Animation 相比代码"更麻烦"的几个点

1. **每个对象都要挂组件**：`Animator` 组件必须逐个挂并指定 controller；代码方案可以是一个 `static` 方法，谁都能调，连组件都不用挂。
2. **触发还是得靠代码**：`animator.SetTrigger("Pulse")` / `CrossFade` 依然要写脚本引用。Animator 并没有让你"摆脱代码"，只是把补间数学挪进了 clip。
3. **参数化差**：代码里 `Play(target, restScale, peak, duration)` 想调峰值/时长直接传参；Animator 想让两个按钮节奏不同，得靠 `AnimatorOverrideController` 或改 speed，笨重得多。
4. **一次性小特效开销大**：为一个缩放脉冲挂整套状态机，运行时和维护成本都比一个协程重。

---

## 五、项目实例：为什么脉冲动画用了代码

ChatGo 里"金币不足时广告按钮放大提示"用的是一个静态协程方法 `WatchAdButtonPulse.Play(target, restScale, peak, duration)`：

- **层级无关**：作用在按钮自身 scale，谁调都行。
- **零组件成本**：不用给按钮挂 Animator + controller。
- **强参数化**：峰值、时长随手传。
- **一处复用**：体力购买面板和关卡解锁面板两个不同的广告按钮，**同一个方法**直接复用，不用复制任何资产、不用连状态机。

如果当初用 Animation 实现，虽然 clip/controller 能共享，但仍躲不掉"逐按钮挂 Animator + 代码触发"，且一旦动画牵扯子节点，层级不一致就没法直接复用。这正是"简单可复用特效优先用代码"的现实理由。

---

## 六、选择清单

- 效果简单、要跨对象复用、要参数化 → **代码 / [[DOTween]]**
- 美术手 K、多属性编排、需要状态机过渡/混合 → **[[animator|Animator]] + [[animation|AnimationClip]]**
- 想两者兼得：把程序化效果封装成**可挂载的 MonoBehaviour**（暴露 `Play()`），或用 tween 库统一管理

## 相关
[[animation]]
[[animator]]
[[DOTween]]
