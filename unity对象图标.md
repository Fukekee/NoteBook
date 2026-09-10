![[Pasted image 20251011142549.png]]
ScriptableObject（可编程资源对象）
- 🔷 **蓝色立方体** → 表示这是一个资产（Asset），类似于 prefab、材质、场景等。
    
- 🟧 **花括号 `{}`** → 表示它与脚本（C# 代码）相关。
**一个继承自 `ScriptableObject` 的自定义脚本生成的资产实例**。
**如何创建：**
在 Unity 项目中通过：

`[CreateAssetMenu(fileName = "MyData", menuName = "MyGame/Data")] public class MyData : ScriptableObject {     public int health;     public string playerName; }`

然后在 Unity 编辑器中右键菜单里选择 “Create → MyGame → Data” 来创建这种资产。

这种资产常用于存储可共享的配置数据、全局变量、或游戏平衡参数等。