Legacy 动画系统，直接播放 `AnimationClip`,适用于简单的动画、UI、特效

## 一、AnimationClip 能否复用给别的对象？

### 简短回答：可以，但有条件

AnimationClip 本身是一个独立的资源文件（`.anim`），它不属于任何特定的 GameObject。它存储的是"对哪些路径上的属性做什么修改"。

### 关键概念：动画的"路径绑定"

当你在某个 GameObject 上录制动画时，AnimationClip 里记录的不是"这个对象"，而是一条条相对路径：

"" (根对象自己) → Transform.position

"Body/Arm" → Transform.localRotation

"Body/Arm/Hand" → SpriteRenderer.color

也就是说，AnimationClip 记录的是 "从动画根节点开始的相对路径 + 组件 + 属性"。

### 复用条件

要把同一个 AnimationClip 应用到另一个对象，新对象必须满足：

1. 拥有相同的子物体层级结构（路径要对得上）
2. 对应路径上有相同的组件（比如都有 SpriteRenderer）

举个例子：

角色A 层级： 角色B 层级（可复用）：

Player Enemy

├── Body ├── Body

│ └── Arm │ └── Arm

└── Head └── Head

只要层级结构一致，A 的动画就能直接应用到 B 上——这也是为什么 Unity 的 人形动画（Humanoid Animation） 能跨模型复用的原理（它通过 Avatar 把不同骨骼名映射到统一的人体骨骼）。

### 复用方式

- 旧版 Animation：在 Animation 组件的 `Animations` 数组里直接拖入同一个 Clip
- Animator：在 Animator Controller 的 State 上设置同一个 Motion 即可

### 什么时候用 Legacy Animation？

- 简单 UI 动画（一个面板的弹出/收起）
- 特效物体（不需要状态机切换）
- 不需要混合、过渡、参数控制的场景
- 性能敏感场景（Legacy 系统更轻量）

## 二、补充：你需要建立的几个核心认知

### 1. AnimationClip 是"数据"，不是"行为"

Clip 本身只是一份**"在 X 时间点把 Y 属性设为 Z 值"**的记录。播放它的是 Animation 组件或 Animator 组件。资源和播放器是分离的。

### 2. 路径是动画复用的核心

理解了相对路径绑定，你就理解了：

- 为什么改子物体名字会让动画失效
- 为什么动画能跨对象复用
- 为什么 Humanoid 动画需要 Avatar 做映射

### 3. Animation 能动画化的远不止 Transform

只要是 Unity 序列化的属性，几乎都能动画化：

- Transform（位置、旋转、缩放）
- Renderer 的材质属性（颜色、Tiling）
- Light 的颜色和强度
- Camera 的 FOV
- AudioSource 的音量
- 自定义脚本里的 public 字段（这点很强大！）
- 甚至可以通过 Animation Event 触发函数

### 4. 动画化自定义脚本字段示例

如果你的脚本有：

public class MyScript : MonoBehaviour

{

public float intensity;

}

在 Animation 窗口点 Add Property，就能找到 `MyScript.intensity`，可以像动画化 Transform 一样动画化它。这是制作程序化效果（如能量条充能、UI 数字滚动）的常用手法。

---

## 三、一个常见的疑问预答

> Q：我已经创建了 AnimationClip，但它在 Animator 上播放正常，拖给 Animation 组件却报错？

A：因为 Animator 用的 Clip 不是 Legacy，Animation 组件只接受 Legacy Clip。需要用 Debug Inspector 把 `Legacy` 改成 true（但改了之后可能就不能再给 Animator 用了，是单向选择）。