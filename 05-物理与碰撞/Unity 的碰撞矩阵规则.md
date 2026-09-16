Unity 的碰撞矩阵规则：

| 双方组合                                         | 是否触发 OnTrigger |
| -------------------------------------------- | -------------- |
| 两个 Static Trigger Collider（都没 Rigidbody）     | ❌ 不触发          |
| Static Trigger + Kinematic Rigidbody Trigger | ✅ 触发           |
| 两个 Kinematic Rigidbody Trigger               | ✅ 触发           |
