**EventChannel 最典型的用法——跨场景解耦**

**ScriptableObject Event Channel 架构：**

> 用 ScriptableObject 作为全局事件广播站，用 UnityEvent 发送广播，用 OnEnable/OnDisable 管理订阅生命周期，用泛型扩展为强类型事件。

核心目的：
**让 Unity 项目模块之间彻底解耦。**

EventChannel 本身是一个 ScriptableObject 资产（`.asset` 文件），里面持有一个私有的 [Unity Event]

#### 实现事件传递的关键点：
发送端和接收端在 Inspector 里拖入的是 同一个 `.asset` 文件。这个资产就是“通道”，`UnityEvent` 的监听器列表就挂在这个资产上，所以跨场景、跨 GameObject 也能通信，不需要互相引用或 `FindObjectOfType`。

#### 整体流程

1. 在 Project 里创建 `EventChannel` / `StringEventChannel` 等资产
2. 接收方 在 `OnEnable` / `Awake` 里 `AddListener(你的方法)`
3. 发送方 在合适时机调用 `RaiseEvent()` 或 `RaiseEvent(数据)`[^1]
4. 内部 `unityEvent.Invoke(...)` 依次调用所有已注册的回调

[^1]: 可以带参数进行事件传递 public void RaiseEvent(T arg)


