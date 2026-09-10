Root Motion = 动画师在制作动画时，对角色"根骨骼"（Root Bone）施加的位移和旋转，被动画系统提取出来，应用到 GameObject 的 Transform 上。

在Animator组件上勾选启用
## 一、为什么 Root Motion 很重要

### 1. 消除滑步（Foot Sliding）

角色实际移动速度和脚步频率完全匹配，因为它们来自同一份动画数据。

### 2. 表现力更强

动作的力量感、节奏感都能被精确还原。比如：

- 闪避翻滚：动画里翻滚 2 米，角色就真的位移 2 米，时机和距离都和动画师设计的一致
- 战斧重砍前冲：砍击同时角色冲出去 1 米，那种"压上去"的力量感是代码模拟不出的
- 格斗游戏的击退：受击时角色被击退的距离和动画完美同步

### 3. 适合"动作驱动型"游戏

- 黑魂、只狼、鬼泣、战神这类动作游戏几乎都依赖 Root Motion
- 因为角色的每一帧位移都是动画师精心设计的，不是代码线性插值出来的
## 二、Root Motion 在 Unity 的开启方式

### Animator 组件勾选 `Apply Root Motion`

选中带 Animator 的 GameObject，在 Inspector 里：

Animator 组件

├── Controller

├── Avatar

├── Apply Root Motion ← 勾上就启用

└── ...

### 还需要在动画 Clip 里配置好 Root 的提取

在 FBX 模型的 Import Settings → Animation → 选中具体 Clip → 下方有 Root Transform 配置区：

|配置项|含义|
|---|---|
|Root Transform Rotation|控制 Y 轴旋转（角色面朝方向）的处理方式|
|Root Transform Position (Y)|控制垂直方向（高度）的处理方式|
|Root Transform Position (XZ)|控制水平方向（前后左右位移）的处理方式|

每一项都有：

- Bake Into Pose：不应用到 Transform，烘焙进动画姿态里（保持原地）
- Based Upon：基于什么参考点计算（Original / Center of Mass / Feet 等）
- Offset：偏移量

### 关键操作：决定哪些位移"由动画驱动"

例如做一个"原地挥剑"动画：

- 动画师可能不小心让 Root 偏移了一点
- 勾选 Bake Into Pose 后，这些偏移就被"烘焙"进动画，不会改变 Transform 位置
- 角色就真的"原地"挥剑

而做一个"前冲斩击"动画：

- 不勾 Bake Into Pose，让位移正常输出
- 角色就会随动画前冲

---

## 三、Root Motion 的代码接入：OnAnimatorMove

这是之前我们提到过的回调。当你想自己处理动画位移（比如和 CharacterController 配合、加重力、做碰撞检测），就实现这个回调：

void OnAnimatorMove()

{

Vector3 deltaPos = animator.deltaPosition;

Quaternion deltaRot = animator.deltaRotation;

characterController.Move(deltaPos);

transform.rotation *= deltaRot;

}

关键 API：

- `animator.deltaPosition`：本帧动画产生的位移（世界坐标）
- `animator.deltaRotation`：本帧动画产生的旋转
- `animator.velocity`：当前帧的根运动速度（位移 / 时间）
- `animator.angularVelocity`：当前帧的根运动角速度

> 重要：只要你实现了 `OnAnimatorMove()`，Animator 就不会自动把 Root Motion 应用到 Transform 了，你必须自己手动应用，否则角色不会动。

---

## 四、Apply Root Motion 的三种状态

实际上 `Apply Root Motion` 这个开关在脚本里有三种状态：

|状态|行为|
|---|---|
|勾选 Apply Root Motion（无 OnAnimatorMove）|Animator 自动把根运动应用到 Transform|
|勾选 Apply Root Motion + 有 OnAnimatorMove|回调里手动处理，自动应用被屏蔽|
|不勾选 Apply Root Motion|完全忽略根运动，等同于"原地动画 + 代码控制移动"|

代码层面：

animator.applyRootMotion = true;
