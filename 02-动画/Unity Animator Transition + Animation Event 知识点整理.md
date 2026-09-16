## 二、Animation Event（动画事件）基础

### 1. 什么是动画事件

动画事件是绑定在 `AnimationClip` 时间轴某一帧上的"回调点"。当动画播放到该帧时，Unity 会通过 `SendMessage` 机制调用 同一个 GameObject 上挂载的脚本中的方法。

### 2. 添加方式

方式一：在 Animation 窗口中添加

- 打开 `Window > Animation > Animation`
- 选中带 Animator/Animation 的 GameObject
- 在时间轴上右键 → `Add Animation Event`
- 在 Inspector 中选择 Function 名称

方式二：通过代码添加

AnimationEvent evt = new AnimationEvent();

evt.time = 0.5f;

evt.functionName = "OnFootStep";

evt.stringParameter = "Left";

AnimationClip clip = ...;

clip.AddEvent(evt);

### 3. 函数签名要求

被调用的函数必须满足：

- 必须挂在 播放动画的 GameObject 自身 上
- 必须是 `public`（或在 Inspector 可见）
- 最多一个参数，且参数类型只能是以下之一：
    - `int`
    - `float`
    - `string`
    - `Object`（UnityEngine.Object 引用）
    - `AnimationEvent`（可获取所有参数）

public void OnFootStep() { }

public void OnFootStep(string foot) { }

public void OnFootStep(AnimationEvent evt)

{

Debug.Log(evt.stringParameter);

Debug.Log(evt.intParameter);

Debug.Log(evt.floatParameter);

Debug.Log(evt.objectReferenceParameter);

}

---

## 三、Animator 状态机相关事件

除了 Clip 上的事件外，Animator 还提供了 状态机层面的回调。

### 1. StateMachineBehaviour

继承 `StateMachineBehaviour`，挂载到 Animator Controller 的 State 上：

public class MyStateBehaviour : StateMachineBehaviour

{

public override void OnStateEnter(Animator animator, AnimatorStateInfo stateInfo, int layerIndex) { }

public override void OnStateUpdate(Animator animator, AnimatorStateInfo stateInfo, int layerIndex) { }

public override void OnStateExit(Animator animator, AnimatorStateInfo stateInfo, int layerIndex) { }

public override void OnStateMove(Animator animator, AnimatorStateInfo stateInfo, int layerIndex) { }

public override void OnStateIK(Animator animator, AnimatorStateInfo stateInfo, int layerIndex) { }

}

常用回调：

|方法|触发时机|
|---|---|
|`OnStateEnter`|进入该状态时（一次）|
|`OnStateUpdate`|状态运行中每帧|
|`OnStateExit`|离开该状态时（一次）|
|`OnStateMove`|处理 Root Motion|
|`OnStateIK`|处理 IK|

### 2. Animator MonoBehaviour 回调

挂载 Animator 的 GameObject 上的脚本可以收到：

void OnAnimatorMove() { }

void OnAnimatorIK(int layerIndex) { }

---

## 四、常见使用场景

|场景|推荐方式|
|---|---|
|角色脚步声、武器挥砍判定帧|AnimationEvent（精准到帧）|
|攻击连招状态切换、播放完进入 idle|StateMachineBehaviour.OnStateExit|
|Root Motion 控制位移|OnAnimatorMove|
|IK 手部贴附|OnAnimatorIK|
|UI 动画播完关闭面板|AnimationEvent 或协程检测 `normalizedTime >= 1`|

---

## 五、注意事项与坑
1. SendMessage 性能：AnimationEvent 内部使用 `SendMessage`，反射调用，频繁调用有开销，但一般可接受。
    
2. 找不到方法警告：若动画事件指定的方法不存在，控制台会报警告：
    
    > "has no receiver! Are you missing a component?"
    
3. 导入 FBX 动画的事件：从模型文件导入的 Clip 默认是只读的。需在 `Import Settings > Animation > Events` 中添加，或用脚本（AssetPostprocessor）写入。
    
4. 同名动画事件：同一帧多个事件按添加顺序触发。
    
5. 跨脚本调用：事件只会调用 Animator 所在 GameObject 上的脚本，不会向父子物体广播。如果要传递，可以在该脚本里转发。
    
6. 时间精度：事件时间是按"帧"对齐的，不能完全保证毫秒级精度，混合状态下可能略有误差。
    
7. 状态切换时事件可能丢失：当 Animator 在 Transition 中被打断，部分事件可能不会触发。
    
8. Loop Clip 中事件每次循环都触发。
    
9. 编辑器预览 vs 运行时：Animation 窗口预览动画时也会触发事件（除非脚本检测 `Application.isPlaying`）。