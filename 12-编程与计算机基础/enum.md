#enum 是 C# 中的一个关键字，全称是 **enumeration（枚举）**。  
它的作用是：**定义一组有名字的常量，表示某个类型有限且固定的取值范围。**
`public enum ChallengeItemType { Lantern, Prop }`
意思是：
- 创建了一个叫 **ChallengeItemType** 的类型
    
- 这个类型的值只能是 **Lantern** 或 **Prop**

#**enum 的底层其实是整数**
默认情况下
- `Lantern = 0`
    
- `Prop = 1`
（当然也可以手动赋值）