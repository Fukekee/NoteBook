核心作用是 让多套动画同时播放、互不干扰，并通过权重和遮罩控制混合方式
## 一、Layers 的解决方案

把动画分层：

- Base Layer：只管下半身/全身基础动作（站、走、跑）
- Upper Body Layer：只管上半身（瞄准、射击），通过 Avatar Mask 只影响上半身骨骼

这样只需要 3 + 3 = 6 个动画，而且任意组合都能自由切换。
（体现Layers的重要性）
## 二、Layer 的核心配置

打开 Animator 窗口左上角的 Layers 标签，每个 Layer 的设置（齿轮图标）包括：

### 1. Weight（权重）

- 取值 `0 ~ 1`
- `0` = 完全不生效
- `1` = 完全生效
- 中间值 = 与下层混合

注意：==Base Layer（第 0 层）的 Weight 永远是 1==，无法修改。其他 Layer 的 Weight 可以在运行时通过代码动态调整：
（常用，比如在检测到玩家拿出手枪后，那么就要把UpperLayer的权重动态调整为1）
animator.SetLayerWeight(1, 0.5f);

### 2. Mask（遮罩）

指定一个 Avatar Mask 资源，控制该层只影响哪些骨骼。

例如：上半身 Layer 的 Mask 只勾选上半身骨骼，那么这层动画只会修改上半身，下半身保持 Base Layer 的动画。

创建 Avatar Mask：

- `右键 Project 窗口 → Create → Avatar Mask`
- 在 Inspector 里勾选要影响的身体部位（Humanoid）或骨骼（Generic）

### 3. Blending（混合模式）

两种模式：

|模式|含义|用途|
|---|---|---|
|Override（覆盖）|高层动画直接替换低层|大部分情况，比如上半身动画覆盖下半身的上半身部分|
|Additive（叠加）|高层动画叠加到低层之上|呼吸起伏、受伤摇晃、瞄准微调|

#### Override 例子

Base Layer 让角色双手自然摆动，Upper Body Layer（Override + 上半身 Mask）让双手举枪——结果：双手举枪（覆盖了原本的摆动）。

#### Additive 例子

Base Layer 是普通跑步动画，叠加一层"受伤踉跄"动画（Additive，权重 0.5）——结果：跑步同时身体微微倾斜摇晃。

> Additive 注意：用作叠加的 Clip 在 Import Settings 里需要设置 Reference Pose（参考姿势），Unity 会计算"差值"叠加到下层。

### 4. Sync（同步层）

> [!这样就不用维护两套状态机]
> ==勾选 Sync 后，该层会复用另一个 Layer 的状态机结构==（State 和 Transition），但可以使用不同的 Clip。

典型用途：

- Base Layer 是"健康状态"的 Idle/Walk/Run 状态机
- Sync Layer 是"受伤状态"，复用同样的状态机，但每个 State 用受伤版的动画
- 切换时只需调整 Layer Weight，不用维护两套状态机

勾选 Sync 后还会出现 Timing 选项：决定状态时长以哪一层为准。

### 5. IK Pass

勾选后，该层会触发 `OnAnimatorIK(int layerIndex)` 回调，可以做 IK 解算（比如手贴枪、脚贴地）。

不需要 IK 的层不勾选可以省性能。

## 三、运行时常用 API

animator.GetCurrentAnimatorStateInfo(int layerIndex);

animator.Play("StateName", layerIndex);

animator.CrossFade("StateName", 0.2f, layerIndex);
（要在方法中指定layer,不然控制不会生效）
## 四、典型应用场景

### 场景 1：射击游戏的上下半身分离

|Layer|Mask|Blending|内容|
|---|---|---|---|
|0 (Base)|无|-|移动状态机（Idle/Walk/Run/Jump）|
|1 (Upper)|上半身 Mask|Override|武器状态机（Idle/Aim/Shoot/Reload）|

下半身可以自由移动，上半身可以独立瞄准射击，互不干扰。

### 场景 2：受伤叠加效果

|Layer|Mask|Blending|内容|
|---|---|---|---|
|0 (Base)|无|-|正常移动|
|1 (Hurt)|无|Additive|身体晃动/抽搐|

血量低时把 Hurt Layer 的 Weight 慢慢提高，角色就会显得越来越虚弱。

### 场景 3：表情/眼睛动画

|Layer|Mask|Blending|内容|
|---|---|---|---|
|0 (Base)|无|-|身体动画|
|1 (Face)|只勾选脸部骨骼|Override|表情状态机|

身体演什么不影响表情，可以独立控制"愤怒""微笑""说话"。

### 场景 4：动作 + 道具持握

|Layer|Mask|Blending|内容|
|---|---|---|---|
|0 (Base)|无|-|跑跳基础动作|
|1 (Hand)|只勾选手部|Override|持剑/持盾/持弓|

不同武器只需替换 Hand Layer 的动画，主动作不变。

## 五、容易踩的坑
1、Base Layer 的 Weight 改不了  
    想让 Base Layer 部分生效是不行的，
    所以注意baseLayer上放置的state都是base的
2、 Additive 层需要 Reference Pose  
    Clip 导入设置里没设 Reference Pose 的话，Additive 会得到奇怪的结果
3、Mask 与 Generic/Humanoid 不通用  
    Humanoid 模型用 Humanoid Mask（按身体部位勾选）；Generic 模型要按骨骼名勾选 Transform
4、 Layer 太多会有性能开销  
    每多一层就多一次姿态计算和混合。一般角色 2~4 层够用，不要滥用
5、 状态机各自独立  
    每个 Layer 有自己的状态机和 Transition，Parameter 是共享的（所有 Layer 共用一套 Animator 参数）