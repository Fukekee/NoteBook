## 一、整体设计思路

把"动画播放完成"作为 AR 任务完成的触发信号，链路是这样的：

.anim 文件 (Animation Event "Trigger")

│

▼

AnimationEventRelay ── (反射调用 Trigger 方法)

│

▼ (UnityEvent 配置)

StoryARTaskBridge.CompleteTask()

│

▼ (RaiseEvent)

EventChannel (ScriptableObject)

│

▼ (订阅)

StorySequencer → 推进剧情下一段

三层解耦：

- AnimationEventRelay：把"反射方法调用"翻译成 Inspector 可拖拽的 UnityEvent
- StoryARTaskBridge：场景内单例，统一收口"AR 任务完成"，做防重 + 延迟
- EventChannel：跨场景/跨脚本通信通道，避免 `FindObjectOfType`

---

## 二、各组件职责

### 1. `AnimationEventRelay`（`Assets/Scripts/model_control/AnimationEventRelay.cs`）

作用：Animation Event 的"通用转发器"。

为什么需要它：Unity 的 Animation Event 是反射调用，且只能找 Animator 同 GameObject 上的 public 方法，不能直接调用其他对象。所以需要一个挂在 Animator 旁边的脚本，把调用转发到任意目标。

对外暴露的方法（在 Animation Event 的 Function 里填这些）：

- `Trigger`：无参
- `TriggerInt(int)`：传一个 int
- `TriggerFloat(float)`
- `TriggerString(string)`
- `TriggerObject(Object)`
- `TriggerByName(string)`：按名字分发，一份脚本支持多个事件

### 2. `StoryARTaskBridge`（`Assets/Scripts/Story/StoryARTaskBridge.cs`）

作用：每个 AR 场景的"任务完成出口"。

关键能力：

- 场景内单例（`Instance`），便于代码直接调用 `StoryARTaskBridge.Instance.CompleteTask()`
- 防重复触发（`_taskCompleted` 标志）
- 可配置延迟（`notifyDelay`）：动画结束后等 0.5s 再通知，体验更平滑
- autoNotify 开关：自动还是手动通知
- 通过 `EventChannel` 通知，不走 `FindObjectOfType`

### 3. `EventChannel`（`Assets/Scripts/Events/EventChannel.cs`）

作用：基于 ScriptableObject 的事件总线，发布订阅完全解耦。

---

## 三、完整接入流程（以"动画播完进入下一幕"为例）

### 步骤 1：准备 EventChannel 资产（如已存在则跳过）

1. Project 里某个文件夹（推荐 `Assets/Resources/Events/` 或 `Assets/Game/Events/`）右键
2. Create → Scriptable Objects → Events → EventChannel
3. 命名为 `ARSegmentCompletedChannel`（或本场景专用名）
4. `StorySequencer` 那一侧把这个资产拖入对应订阅字段

### 步骤 2：场景里挂 `StoryARTaskBridge`

1. AR 场景里建一个空 GameObject，比如叫 `_TaskBridge`
2. 添加组件 `StoryARTaskBridge`
3. Inspector 配置：
    - `Notify Delay`：建议 `0.3 ~ 0.5`，让动画收尾自然
    - `Auto Notify`：勾选
    - `Ar Segment Completed Channel`：拖入步骤 1 的 EventChannel 资产

### 步骤 3：在动画对象上挂 `AnimationEventRelay`

1. 找到带 Animator 的 GameObject（比如某个 NPC、某个交互物）
2. 添加组件 `AnimationEventRelay`
3. 在 Inspector 的 On Animation Event 列表：
    - 点 +
    - 拖入场景里的 `_TaskBridge`
    - 函数选 `StoryARTaskBridge → CompleteTask()`

### 步骤 4：在动画 Clip 末尾加 Animation Event

1. 选中 FBX → Inspector → Animation 标签
2. 选中要加事件的 Clip
3. Events 时间轴上拖到末尾
4. 点 添加事件
5. Function 字段填 `Trigger`
6. 点右下角 Apply

> 如果 FBX 是只读、动画也想改关键帧，先 `Ctrl+D` 复制成独立 `.anim`，然后把 Animator State 引用换成新的。

### 步骤 5：跑一遍验证

播放动画到末尾时，应当能看到日志：

[StoryARTaskBridge] AR task completed!

之后 `StorySequencer` 收到 `EventChannel` 回调，推进剧情。

---

## 四、几种常见用法变体

### 变体 A：动画里有多个事件（开始、命中、结束分别要做事）

- Function 都填 `TriggerByName`
- 在 Inspector 的 Named Events 列表里加 `start` / `hit` / `end` 三项，分别绑不同回调
- Animation Event 的 String 字段填对应的 id

### 变体 B：动画结束不立即完成任务，要先做点别的

- `AnimationEventRelay.Trigger` → 绑你自己的中间逻辑（比如播放音效、切镜头）
- 在中间逻辑里再调用 `StoryARTaskBridge.Instance.CompleteTask()`

### 变体 C：不是动画触发，而是按钮/拾取触发

- `StoryARTaskBridge` 的 `CompleteTask` 本身就是 `public`，可直接：
    - 拖到 Button 的 OnClick
    - 在脚本里 `StoryARTaskBridge.Instance.CompleteTask()`
    - 给 `TaskItemCollectible` 等任务脚本的"完成回调"绑上

### 变体 D：动画很长，想中途也能完成（提前结束）

- 把 `Auto Notify` 关掉
- `Trigger` 改成绑 `CompleteTask`（仅置标志、不通知）
- 任意位置手动调用 `bridge.NotifySequencer()`