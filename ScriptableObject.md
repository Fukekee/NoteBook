![[Pasted image 20251011142549.png]]
ScriptableObject（可编程资源对象）
- 🔷 **蓝色立方体** → 表示这是一个资产（Asset），类似于 prefab、材质、场景等。
    
- 🟧 **花括号 `{}`** → 表示它与脚本（C# 代码）相关。
**一个继承自 `ScriptableObject` 的自定义脚本生成的资产实例**。
**如何创建：**
在 Unity 项目中通过：

`[CreateAssetMenu(fileName = "MyData", menuName = "MyGame/Data")] public class MyData : ScriptableObject {     public int health;     public string playerName; }`

然后在 Unity 编辑器中右键菜单里选择 “Create → MyGame → Data” 来创建这种资产。

**这种资产常用于存储可共享的配置数据、全局变量、或游戏平衡参数等。**

**如何介绍：**
1. 它是 Project 里的[^1]序列化资源（`.asset`），不挂在场景物体上。
2. 字段出现在 Inspector，Unity 负责存盘和加载（反序列化填字段，不靠构造函数）。
3. 和 MonoBehaviour 的区别是：一份数据被多处共享；实例状态仍应放在物体上的组件里。


**SO是具有生命周期的**
磁盘上的 `PuzzleData.asset` 一直在工程里，和有没有人拖到 Inspector 无关。

|状态|在哪|生命周期会不会跑|
|---|---|---|
|没被加载|只有文件|不会|
|场景/预制体/代码引用了它，Unity 把它读进内存|堆上多了一个 SO 实例|`OnEnable`（有时还有 `Awake`）|
|没人再用，资源被卸掉|实例没了|`OnDisable`，有时 `OnDestroy`|

「不引用不就得了」：对，不用的资产可以不加载。可 SO 的价值正好相反——很多物体共享同一份。这份东西的出生和死亡，不能绑在其中某一个 `MonoBehaviour` 上。

数据类SO不太需要使用到生命周期的
像是EventChannel这种SO，会有一个「不存盘的运行时状态」，所以要用
`void OnEnable()  { unityEvent.RemoveAllListeners(); }`
`void OnDisable() { unityEvent.RemoveAllListeners(); }`
来清空上次play留下的监听。但是除了这种，也可以在引用的组件上在 `OnEnable`/`OnDisable` 里 `Add`/`Remove`，就是两种处理情况。

[^1]: 序列化 = 把内存里活着的对象，写成可以存盘 / 传输的格式；反过来读回来，叫反序列化。