public event Action OnDeath;——————定义事件

OnDeath?.Invoke();————触发事件
?.是 C# 的“空判断安全调用”，等价于：
if(OnDeath != null)
{
    OnDeath();
}
如果有人监听，就执行。  
如果没人监听，就什么都不做。

Invoke 就是“执行这个事件”

enemy.OnDeath += HandleEnemyDeath;——————订阅事件
意思是：
“当 enemy 死亡时，请执行 HandleEnemyDeath 这个函数。”
流程是：
Enemy死亡 → Invoke() → 自动调用HandleEnemyDeath()

一个典型的事件上传流程：
## 第一步：Enemy死亡

Enemy：

OnDeath?.Invoke();

Enemy不知道BattleSystem。

---

## 第二步：BattleSystem监听

BattleSystem：

- 统计是否全部死亡
    
- 如果是 → 发 OnBattleEnd
    

---

## 第三步：GameManager监听

GameManager：

- 加金币
    
- 切场景
    
- 更新全局状态