`MonoBehaviour` 是 Unity 脚本的基类：挂到 GameObject 上之后，引擎才会按生命周期自动调用你的函数。

项目里几乎所有玩法脚本都继承它，例如 `UIManager`、`PhoneLoginPanel`、`SlamARPlacer`。

## 它是什么

Unity 的设计是 GameObject + 组件：

- `GameObject`：场景里的一个空壳（有名字、Transform）
- `Component`：挂在壳上的能力（碰撞、渲染、音频……）
- `MonoBehaviour`：`Component` 的子类，专门给 C# 脚本 用

你写：

public class PhoneLoginPanel : MonoBehaviour

{

void Start() { }

void Update() { }

}

把这个脚本拖到物体上，Unity 就会：

1. 在 Inspector 里显示 `[SerializeField]` 字段
2. 物体启用时创建这个组件实例
3. 按固定顺序调用 `Awake` / `Start` / `Update` 等

不继承 `MonoBehaviour` 的普通 C# 类也能写逻辑，但 Unity 不会自动调用它，也不能直接挂到物体上。

## 为什么 Unity 都用它

核心就三点：

1. 组件化  
一个角色不是一个巨大的 `Player` 类，而是多个组件叠在一起：移动、动画、碰撞、网络。`MonoBehaviour` 让每段逻辑都能独立开关、复用、在 Inspector 里配。

2. 引擎驱动[[八股/生命周期|生命周期]] 
你不用自己写游戏主循环。引擎每帧跑一遍场景，按规则回调脚本。这样渲染、物理、输入、脚本能排好顺序。

3. 和编辑器绑在一起  
序列化字段、`OnValidate`、预制体、场景引用，都建立在 `MonoBehaviour` / `Component` 上。这是 Unity 能“拖脚本、填参数、按 Play”的原因。

所以不是“C# 只能这样写”，而是 要进场景、要被引擎驱动，就走这条路。纯数据、配置、工具代码可以不用它（你们也有普通类、`ScriptableObject`）。

## 什么时候不要用它

|用 MonoBehaviour|不用|
|---|---|
|要挂场景/预制体|纯数据、DTO、工具函数|
|要每帧/生命周期|配置资产 → `ScriptableObject`|
|要 Inspector 拖引用|静态工具类、纯 C# 服务|

联机脚本有时会继承 `NetworkBehaviour`（NGO），它本身也是 `MonoBehaviour` 的子类，多了网络生成、RPC
